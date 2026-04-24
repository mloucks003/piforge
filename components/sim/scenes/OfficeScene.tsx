'use client';
import { useProjectStore } from '@/stores/projectStore';

function useGpioHigh(definitionId: string) {
  const components = useProjectStore((s) => s.components);
  const comp = Object.values(components).find((c) => c.definitionId === definitionId);
  return comp?.pinStates?.['anode']?.value === 1;
}

export default function OfficeScene() {
  const mainLight   = useGpioHigh('led-green');
  const statusLight = useGpioHigh('led-blue');
  const occupied    = useGpioHigh('pir-sensor');
  const hvacOn      = useGpioHigh('relay');

  return (
    <svg viewBox="0 0 700 210" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="offbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      <rect width="700" height="210" fill="url(#offbg)" />

      {/* Office shell */}
      <rect x="20" y="15" width="510" height="180" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />

      {/* Room dividers */}
      <line x1="310" y1="15"  x2="310" y2="195" stroke="#334155" strokeWidth="2" />
      <line x1="310" y1="110" x2="530" y2="110" stroke="#334155" strokeWidth="1.5" />
      <line x1="20"  y1="130" x2="310" y2="130" stroke="#334155" strokeWidth="1.5" />

      {/* Open-plan area — main light */}
      <rect x="28" y="22" width="274" height="100" rx="4"
        fill={mainLight ? 'rgba(253,230,138,0.18)' : 'rgba(30,41,59,0.9)'}
        stroke="#334155" strokeWidth="1"
        style={{ filter: mainLight ? 'drop-shadow(0 0 20px rgba(253,230,138,0.4))' : 'none', transition: 'all 0.4s' }} />
      <text x="164" y="38" textAnchor="middle" fontSize="10" fill="#64748b">Open Plan</text>
      {/* Desks */}
      {[60, 120, 200, 250].map((x, i) => (
        <rect key={i} x={x} y={i % 2 === 0 ? 50 : 70} width="40" height="24" rx="3"
          fill="#1e293b" stroke="#475569" strokeWidth="1" />
      ))}
      {/* Ceiling panel lights */}
      {[90, 160, 240].map((x, i) => (
        <g key={i}>
          <rect x={x - 18} y="24" width="36" height="8" rx="3"
            fill={mainLight ? '#fde68a' : '#334155'}
            style={{ filter: mainLight ? 'drop-shadow(0 0 10px #fde68a)' : 'none', transition: 'all 0.4s' }} />
        </g>
      ))}

      {/* People / occupancy */}
      {occupied && (
        <g>
          {[80, 150, 220].map((x, i) => (
            <g key={i} transform={`translate(${x}, 82)`}>
              <circle cx="0" cy="-12" r="8" fill="#fbbf24" />
              <rect x="-6" y="-4" width="12" height="16" rx="4" fill="#3b82f6" />
              <text textAnchor="middle" y="20" fontSize="7" fill="#60a5fa">🧑 staff</text>
            </g>
          ))}
          <text x="164" y="125" textAnchor="middle" fontSize="9" fill="#fb923c">🚶 Occupied</text>
        </g>
      )}

      {/* Meeting room */}
      <rect x="28" y="138" width="274" height="50" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <text x="164" y="158" textAnchor="middle" fontSize="9" fill="#475569">Meeting Room</text>
      <rect x="80" y="148" width="170" height="24" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      {/* Status light */}
      <circle cx="290" cy="158" r="8"
        fill={statusLight ? '#60a5fa' : '#374151'}
        style={{ filter: statusLight ? 'drop-shadow(0 0 10px #60a5fa)' : 'none', transition: 'all 0.4s' }} />
      <text x="290" y="178" textAnchor="middle" fontSize="7" fill={statusLight ? '#93c5fd' : '#4b5563'}>Status</text>

      {/* Server room */}
      <rect x="318" y="22" width="200" height="80" rx="4" fill="#0c1a2e" stroke="#334155" strokeWidth="1" />
      <text x="418" y="36" textAnchor="middle" fontSize="9" fill="#64748b">Server Room</text>
      {[340, 380, 420, 460].map((x, i) => (
        <rect key={i} x={x} y="42" width="28" height="48" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      ))}

      {/* HVAC unit */}
      <g transform="translate(418, 150)">
        <rect x="-40" y="-20" width="80" height="36" rx="6"
          fill={hvacOn ? '#0c4a6e' : '#1e293b'} stroke={hvacOn ? '#0ea5e9' : '#334155'} strokeWidth="2"
          style={{ transition: 'all 0.3s' }} />
        <text textAnchor="middle" y="6" fontSize="12">{hvacOn ? '❄️' : '🔌'}</text>
        <text textAnchor="middle" y="24" fontSize="8" fill={hvacOn ? '#7dd3fc' : '#475569'}>
          {hvacOn ? 'HVAC ON' : 'HVAC OFF'}
        </text>
        {hvacOn && [0, 1, 2].map(i => (
          <path key={i} d={`M${-30 + i * 10},${-28} Q${-25 + i * 10},${-38} ${-20 + i * 10},${-28}`}
            fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur={`${0.8 + i * 0.2}s`} repeatCount="indefinite" />
          </path>
        ))}
      </g>

      {/* Status panel */}
      <rect x="545" y="15" width="145" height="180" rx="8" fill="rgba(15,23,42,0.92)" stroke="#334155" strokeWidth="1.5" />
      <text x="618" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#94a3b8">🏢 Office Status</text>

      {[
        { label: '💡 Main Lights',  on: mainLight,   color: '#fde68a' },
        { label: '🔵 Status Light', on: statusLight, color: '#93c5fd' },
        { label: '🚶 Occupancy',    on: occupied,    color: '#fb923c' },
        { label: '❄️ HVAC',         on: hvacOn,      color: '#7dd3fc' },
      ].map(({ label, on, color }, i) => (
        <g key={i} transform={`translate(556, ${54 + i * 28})`}>
          <circle cx="8" cy="0" r="6" fill={on ? color : '#374151'}
            style={{ filter: on ? `drop-shadow(0 0 5px ${color})` : 'none', transition: 'all 0.3s' }} />
          <text x="20" y="4" fontSize="9" fill={on ? color : '#6b7280'}>{label}</text>
          <text x="132" y="4" textAnchor="end" fontSize="9" fontWeight="bold" fill={on ? color : '#4b5563'}>
            {on ? 'ON' : 'OFF'}
          </text>
        </g>
      ))}

      <text x="556" y="168" fontSize="9" fill="#94a3b8">🌡 Temp: 22.1°C</text>
      <text x="556" y="182" fontSize="9" fill="#94a3b8">💦 Humidity: 48%</text>

      <text x="10" y="207" fontSize="9" fill="#4b5563">🏢 Smart Office — Lighting, HVAC & Occupancy Management</text>
    </svg>
  );
}
