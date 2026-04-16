import { NextRequest, NextResponse } from 'next/server';

// Destination email — server-side only, never sent to the browser
const TO_EMAIL = 'loucksmichael1234@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { type, message, senderEmail, senderName } = await req.json() as {
      type: string;
      message: string;
      senderEmail?: string;
      senderName?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ ok: false, error: 'Message is required.' }, { status: 400 });
    }

    const subject = `[PiForge Feedback] ${type ?? 'General'} from ${senderName || 'Anonymous'}`;
    const htmlBody = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e4e4e7;padding:24px;border-radius:12px">
        <h2 style="color:#22c55e;margin:0 0 16px">PiForge Feedback</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="color:#71717a;padding:4px 0;width:120px">Type</td><td style="color:#e4e4e7;font-weight:600">${type ?? 'General'}</td></tr>
          <tr><td style="color:#71717a;padding:4px 0">From</td><td style="color:#e4e4e7">${senderName || 'Anonymous'}</td></tr>
          ${senderEmail ? `<tr><td style="color:#71717a;padding:4px 0">Email</td><td><a href="mailto:${senderEmail}" style="color:#22c55e">${senderEmail}</a></td></tr>` : ''}
        </table>
        <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:16px">
          <p style="margin:0;white-space:pre-wrap;line-height:1.6">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        </div>
        <p style="color:#52525b;font-size:12px;margin-top:20px">Sent from PiForge Virtual Lab — ${new Date().toUTCString()}</p>
      </div>
    `;

    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      // Send via Resend (https://resend.com — free tier: 3k emails/month)
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'PiForge Feedback <onboarding@resend.dev>',
          to: [TO_EMAIL],
          reply_to: senderEmail || undefined,
          subject,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[feedback] Resend error:', err);
        // Don't fail the user-facing response — log and continue
      }
    } else {
      // No Resend key configured — log to server console (Vercel functions log)
      console.log('[PiForge Feedback]', { type, senderName, senderEmail, message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[feedback] unexpected error:', err);
    return NextResponse.json({ ok: false, error: 'Server error. Please try again.' }, { status: 500 });
  }
}
