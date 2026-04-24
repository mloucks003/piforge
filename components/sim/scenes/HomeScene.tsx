'use client';
import { useProjectStore } from '@/stores/projectStore';

function useGpioHigh(definitionId: string) {
  const components = useProjectStore((s) => s.components);
  const comp = Object.values(components).find((c) => c.definitionId === definitionId);
  return comp?.pinStates?.['anode']?.value === 1;
}

function Room({ x, y, w, h, label, lit, litColor = '#fde68a' }: {
  x: number; y: number; w: number; h: number; label: string; lit: boolean; litColor?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3"
        fill={lit ? litColor : '#1e293b'} fillOpacity={lit ? 0.55 : 0.7}
        stroke="#334155" strokeWidth="1.5"
        style={{ filter: lit ? `drop-shadow(0 0 12px ${litColor})` : 'none', transition: 'all 0.4s' }} />
      {/* Ceiling light fixture */}
      <circle cx={x + w / 2} cy={y + h / 2} r={lit ? 14 : 8}
        fill={lit ? litColor : '#374151'}
        style={{ filter: lit ? `drop-shadow(0 0 18px ${litColor})` : 'none', transition: 'all 0.4s' }} />
      <circle cx={x + w / 2} cy={y + h / 2} r="4" fill={lit ? '#fff' : '#475569'} />
      <text x={x + w / 2} y={y + h - 8} textAnchor="middle" fontSize="9" fill={lit ? '#92400e' : '#475569'}>{label}</text>
    </g>
  );
}

export default function HomeScene() {
  const livingLit  = useGpioHigh('led-green');
  const bedroomLit = useGpioHigh('led-blue');
  const motion     = useGpioHigh('pir-sensor');
  const buzzer     = useGpioHigh('buzzer');

  return (
    <svg viewBox="0 0 700 210" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="700" height="210" fill="url(#floor)" />

      {/* House outline */}
      <rect x="30" y="20" width="500" height="175" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
      {/* Roof */}
      <polygon points="25,22 280,2 535,22" fill="#1e293b" stroke="#475569" strokeWidth="2" />

      {/* Room dividers */}
      <line x1="280" y1="20" x2="280" y2="195" stroke="#334155" strokeWidth="2" />
      <line x1="30" y1="110" x2="280" y2="110" stroke="#334155" strokeWidth="1.5" />

      {/* Rooms */}
      <Room x={40} y={28}  w={230} h={74}  label="Living Room"     lit={livingLit}  litColor="#fde68a" />
      <Room x={40} y={118} w={230} h={68}  label="Hallway / Entry" lit={motion}     litColor="#fdba74" />
      <Room x={290} y={28} w={230} h={165} label="Bedroom"         lit={bedroomLit} litColor="#bfdbfe" />

      {/* Doors */}
      <rect x="148" y="107" width="30" height="6" rx="2" fill="#475569" />
      <rect x="286" y="85"  width="6" height="40" rx="2" fill="#475569" />

      {/* PIR sensor - front door area */}
      <g transform="translate(95, 152)">
        <rect x="-18" y="-12" width="36" height="24" rx="4"
          fill={motion ? '#78350f' : '#1e3a5f'} stroke={motion ? '#f97316' : '#1d4ed8'} strokeWidth="1.5"
          style={{ transition: 'all 0.3s' }} />
        <text textAnchor="middle" y="4" fontSize="8" fill={motion ? '#fdba74' : '#93c5fd'}>PIR</text>
        {motion && (
          <>
            <ellipse cx="0" cy="-18" rx="22" ry="10" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.7">
              <animate attributeName="rx" values="22;35;22" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1s" repeatCount="indefinite" />
            </ellipse>
            <text textAnchor="middle" y="-25" fontSize="8" fill="#fb923c">🚶 Motion!</text>
          </>
        )}
      </g>

      {/* Buzzer / Doorbell */}
      <g transform="translate(510, 100)">
        <rect x="-22" y="-22" width="44" height="44" rx="8"
          fill={buzzer ? '#451a03' : '#1e293b'} stroke={buzzer ? '#f97316' : '#334155'} strokeWidth="1.5"
          style={{ transition: 'all 0.3s' }} />
        <text textAnchor="middle" y="5" fontSize="16">{buzzer ? '🔔' : '🔕'}</text>
        {buzzer && [20, 32, 44].map((r, i) => (
          <circle key={i} cx="0" cy="0" r={r} fill="none" stroke="#f97316" strokeWidth="1" opacity={0.7 - i * 0.2}>
            <animate attributeName="r" values={`${r};${r + 8};${r}`} dur={`${0.6 + i * 0.2}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur={`${0.6 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text textAnchor="middle" y="26" fontSize="8" fill={buzzer ? '#fb923c' : '#475569'}>Doorbell</text>
      </g>

      {/* Stats panel */}
      <rect x="550" y="20" width="140" height="170" rx="8" fill="rgba(15,23,42,0.9)" stroke="#334155" strokeWidth="1.5" />
      <text x="620" y="40" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#94a3b8">🏠 Home Status</text>

      {[
        { label: '💡 Living Room',  on: livingLit,  color: '#fde68a' },
        { label: '💡 Bedroom',      on: bedroomLit, color: '#bfdbfe' },
        { label: '🚶 Motion',       on: motion,     color: '#fb923c' },
        { label: '🔔 Doorbell',     on: buzzer,     color: '#fb923c' },
      ].map(({ label, on, color }, i) => (
        <g key={i} transform={`translate(560, ${58 + i * 26})`}>
          <circle cx="8" cy="0" r="6" fill={on ? color : '#374151'}
            style={{ filter: on ? `drop-shadow(0 0 5px ${color})` : 'none', transition: 'all 0.3s' }} />
          <text x="20" y="4" fontSize="9" fill={on ? color : '#6b7280'}>{label}</text>
          <text x="126" y="4" textAnchor="end" fontSize="9" fontWeight="bold" fill={on ? color : '#4b5563'}>
            {on ? 'ON' : 'OFF'}
          </text>
        </g>
      ))}

      <text x="560" y="168" fontSize="9" fill="#94a3b8">🌡 Temp: 21.4°C</text>
      <text x="560" y="182" fontSize="9" fill="#94a3b8">💦 Humidity: 55%</text>

      <text x="10" y="207" fontSize="9" fill="#4b5563">🏠 Smart Home — Motion, Lighting & Doorbell Automation</text>
    </svg>
  );
}
