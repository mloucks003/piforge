import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PiForge — Virtual Raspberry Pi & Arduino Laboratory';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f1a0f 50%, #0a0a0a 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)',
          backgroundSize: '40px 40px' }} />

        {/* Glow */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(34,197,94,0.15)',
            border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36 }}>
            ⚡
          </div>
          <span style={{ fontSize: 72, fontWeight: 900, color: '#ffffff', letterSpacing: '-2px' }}>
            Pi<span style={{ color: '#22c55e' }}>Forge</span>
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize: 28, color: '#a1a1aa', margin: 0, textAlign: 'center', maxWidth: 700 }}>
          Virtual Raspberry Pi &amp; Arduino Laboratory
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 36 }}>
          {['🐍 Real Python', '⚡ Arduino C++', '🏠 Smart Home IoT', '🤖 AI Assistant'].map((label) => (
            <div key={label} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 100, padding: '8px 20px', fontSize: 18, color: '#86efac' }}>
              {label}
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div style={{ position: 'absolute', bottom: 36, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 18, color: '#52525b', letterSpacing: '0.05em' }}>getpiforge.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
