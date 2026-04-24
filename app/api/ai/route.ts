import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Use edge runtime for streaming

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIRequestBody {
  messages: ChatMessage[];
  code?: string;
  components?: string;
  wiring?: string;
  consoleErrors?: string;
  mode?: 'chat' | 'analyze' | 'fix';
}

function buildSystemPrompt(body: AIRequestBody): string {
  const contextParts: string[] = [];

  if (body.code?.trim()) {
    contextParts.push(`## Current Python Code\n\`\`\`python\n${body.code}\n\`\`\``);
  }
  if (body.components?.trim()) {
    contextParts.push(`## Placed Components\n${body.components}`);
  }
  if (body.wiring?.trim()) {
    contextParts.push(`## Wiring Connections\n${body.wiring}`);
  }
  if (body.consoleErrors?.trim()) {
    contextParts.push(`## Console Output / Errors\n\`\`\`\n${body.consoleErrors}\n\`\`\``);
  }

  const modeInstructions: Record<string, string> = {
    analyze: `You are performing a CODE ANALYSIS. Review the code for:
1. Bugs or logic errors
2. Incorrect GPIO pin usage or API misuse
3. Missing imports or undefined variables
4. Best practices for gpiozero / RPi.GPIO
Format your response with clear sections: ✅ What's correct, ⚠️ Issues found, 💡 Suggestions.`,
    fix: `You are performing an AUTO-FIX. Based on the console errors and code, provide:
1. A clear explanation of what caused the error
2. The corrected Python code (complete, ready to paste)
3. An explanation of each change made
Format: brief diagnosis → corrected code block → explanation.`,
    generate: `You are a CODE GENERATOR for Raspberry Pi projects. The user will describe what they want to build.
You must provide:
1. **Project Overview** — brief description of what you will generate
2. **Components Needed** — exact list of components and quantities
3. **Wiring Guide** — step-by-step wiring instructions (format: ComponentPin → Pi GPIO BCM number)
4. **Complete Python Code** — fully working, commented Python using gpiozero or RPi.GPIO, ready to paste
5. **How to Run** — 1-2 sentences on running the project

Keep code practical, well-commented, and use gpiozero where possible.`,
    chat: `You are a helpful assistant. Answer concisely and practically. When showing code, use Python code blocks.`,
  };

  const basePrompt = `You are PiForge AI, an expert embedded systems and Raspberry Pi assistant built into the PiForge virtual lab.

PiForge is a browser-based Raspberry Pi simulator that runs real Python via Pyodide. Supported libraries:
- \`gpiozero\`: LED, Button, Buzzer, PWMLED, RGBLED, AngularServo, Servo, Motor, Robot, DistanceSensor, MotionSensor
- \`RPi.GPIO\`: Full GPIO control (BCM mode)
- \`pygame\`: For the virtual 7" touchscreen display
- \`Adafruit_DHT\`: DHT11/DHT22 temperature & humidity
- \`time\`, \`math\`, \`random\`, \`json\`

IMPORTANT PiForge-specific rules:
- All blocking calls (time.sleep, button.wait_for_press, etc.) work normally — PiForge patches them to be async internally
- GPIO pins use BCM numbering
- The Pi 5 board has 40 GPIO pins; pins 6,9,14,20,25,30,34,39 are GND

${modeInstructions[body.mode ?? 'chat']}

${contextParts.length > 0 ? `---\n## Project Context\n${contextParts.join('\n\n')}` : ''}`;

  return basePrompt;
}

export async function POST(req: NextRequest) {
  try {
    const body: AIRequestBody = await req.json();

    // Resolve API key: env variable takes priority, then user-supplied header
    const apiKey = process.env.OPENAI_API_KEY || req.headers.get('x-api-key') || '';
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Add your OpenAI API key in the AI panel settings.' },
        { status: 401 }
      );
    }

    const systemPrompt = buildSystemPrompt(body);

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...body.messages.filter((m) => m.role !== 'system'),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openaiMessages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = (err as { error?: { message?: string } }).error?.message ?? `OpenAI error ${response.status}`;
      return NextResponse.json({ error: msg }, { status: response.status });
    }

    // Stream OpenAI's SSE response directly to the client.
    // We keep a leftover buffer so JSON lines split across two network packets
    // are never dropped (which causes garbled / truncated output).
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // Process only complete lines; keep any partial line in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? ''; // last element may be incomplete
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) await writer.write(encoder.encode(delta));
            } catch { /* skip keep-alive / non-JSON lines */ }
          }
        }
        // Flush any remaining buffered line
        if (buffer.trim().startsWith('data: ')) {
          const data = buffer.trim().slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) await writer.write(encoder.encode(delta));
            } catch { /* ignore */ }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
