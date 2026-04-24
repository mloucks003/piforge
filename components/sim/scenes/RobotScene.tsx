'use client';
import { useProjectStore } from '@/stores/projectStore';

function useGpioHigh(definitionId: string) {
  const components = useProjectStore((s) => s.components);
  const comp = Object.values(components).find((c) => c.definitionId === definitionId);
  return comp?.pinStates?.['anode']?.value === 1;
}

export default function RobotScene() {
  const components  = useProjectStore((s) => s.components);
  const compList    = Object.values(components);
  const motors      = compList.filter((c) => c.definitionId === 'dc-motor');
  const leftOn      = motors[0]?.pinStates?.['anode']?.value === 1;
  const rightOn     = motors[1]?.pinStates?.['anode']?.value === 1;
  const moving      = leftOn || rightOn;

  // Simulate obstacle: in a real run the code toggles motors based on distance
  // We derive "obstacle detected" from motors both being OFF during sim
  const hasObstacle = !moving;

  const estDist = hasObstacle ? 18 : 95; // cm

  return (
    <svg viewBox="0 0 700 210" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="floor2" cx="50%" cy="60%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 Z" fill="#4ade80" />
        </marker>
      </defs>

      <rect width="700" height="210" fill="url(#floor2)" />

      {/* Floor grid */}
      {Array.from({ length: 15 }, (_, i) => (
        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="210" stroke="#1e3a5f" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 52} x2="700" y2={i * 52} stroke="#1e3a5f" strokeWidth="0.5" />
      ))}

      {/* Obstacle wall */}
      {hasObstacle && (
        <g>
          <rect x="145" y="50" width="24" height="120" rx="2" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" />
          <rect x="169" y="50" width="24" height="120" rx="2" fill="#991b1b" stroke="#dc2626" strokeWidth="1.5" />
          <rect x="193" y="50" width="24" height="120" rx="2" fill="#7f1d1d" stroke="#dc2626" strokeWidth="2" />
          <text x="192" y="44" textAnchor="middle" fontSize="10" fill="#f87171">🧱 OBSTACLE</text>
        </g>
      )}

      {/* Robot body (top-down) */}
      <g transform="translate(340, 105)">
        {/* Chassis */}
        <rect x="-45" y="-38" width="90" height="76" rx="10"
          fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2.5" />

        {/* Left wheels */}
        {[-1, 1].map((s, i) => (
          <rect key={i} x="-55" y={s * 20} width="16" height="26" rx="5"
            fill={leftOn ? '#22c55e' : '#374151'} stroke={leftOn ? '#4ade80' : '#475569'} strokeWidth="1.5"
            style={{ transition: 'all 0.3s' }}>
            {leftOn && <animateTransform attributeName="transform" type="rotate"
              values="0 -47 10;10 -47 10;0 -47 10" dur="0.4s" repeatCount="indefinite" />}
          </rect>
        ))}

        {/* Right wheels */}
        {[-1, 1].map((s, i) => (
          <rect key={i} x="39" y={s * 20} width="16" height="26" rx="5"
            fill={rightOn ? '#22c55e' : '#374151'} stroke={rightOn ? '#4ade80' : '#475569'} strokeWidth="1.5"
            style={{ transition: 'all 0.3s' }}>
            {rightOn && <animateTransform attributeName="transform" type="rotate"
              values="0 47 10;-10 47 10;0 47 10" dur="0.4s" repeatCount="indefinite" />}
          </rect>
        ))}

        {/* Pi logo center */}
        <circle cx="0" cy="0" r="18" fill="#0f172a" stroke="#1d4ed8" strokeWidth="1.5" />
        <text textAnchor="middle" y="5" fontSize="16">🤖</text>

        {/* HC-SR04 sonar at front */}
        <rect x="-20" y="-50" width="40" height="14" rx="4" fill="#134e4a" stroke="#0d9488" strokeWidth="1.5" />
        <circle cx="-10" cy="-43" r="5" fill="#0f766e" stroke="#14b8a6" strokeWidth="1" />
        <circle cx="10"  cy="-43" r="5" fill="#0f766e" stroke="#14b8a6" strokeWidth="1" />
        <text textAnchor="middle" y="-55" fontSize="7" fill="#5eead4">HC-SR04</text>

        {/* Sonar cone */}
        {!hasObstacle && (
          <>
            {[30, 55, 80].map((w, i) => (
              <ellipse key={i} cx="0" cy={-60 - i * 22} rx={w} ry="10"
                fill="none" stroke="#0d9488" strokeWidth="1" opacity={0.6 - i * 0.15}>
                <animate attributeName="ry" values="10;14;10" dur={`${0.9 + i * 0.3}s`} repeatCount="indefinite" />
              </ellipse>
            ))}
          </>
        )}

        {/* Direction arrow when moving */}
        {moving && (
          <line x1="0" y1="-52" x2="0" y2="-85"
            stroke="#4ade80" strokeWidth="2" markerEnd="url(#arr)">
            <animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite" />
          </line>
        )}
      </g>

      {/* Status panel */}
      <rect x="550" y="15" width="140" height="180" rx="8" fill="rgba(15,23,42,0.92)" stroke="#334155" strokeWidth="1.5" />
      <text x="620" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#94a3b8">🤖 Robot Status</text>

      {[
        { label: '🚗 Left Motor',  on: leftOn,  color: '#4ade80' },
        { label: '🚗 Right Motor', on: rightOn, color: '#4ade80' },
        { label: '🧱 Obstacle',    on: hasObstacle, color: '#f87171' },
      ].map(({ label, on, color }, i) => (
        <g key={i} transform={`translate(558, ${54 + i * 28})`}>
          <circle cx="8" cy="0" r="6" fill={on ? color : '#374151'}
            style={{ filter: on ? `drop-shadow(0 0 5px ${color})` : 'none', transition: 'all 0.3s' }} />
          <text x="20" y="4" fontSize="9" fill={on ? color : '#6b7280'}>{label}</text>
          <text x="128" y="4" textAnchor="end" fontSize="9" fontWeight="bold" fill={on ? color : '#4b5563'}>
            {on ? 'ON' : 'OFF'}
          </text>
        </g>
      ))}

      <text x="558" y="148" fontSize="9" fill="#94a3b8">📡 Sonar Distance</text>
      <text x="558" y="164" fontSize="18" fontWeight="bold" fill={estDist < 25 ? '#f87171' : '#4ade80'}>
        {estDist} cm
      </text>
      <text x="558" y="180" fontSize="9" fill={estDist < 25 ? '#f87171' : '#6b7280'}>
        {estDist < 25 ? '⚠️ Too close — stopping' : '✅ Path clear'}
      </text>

      <text x="10" y="207" fontSize="9" fill="#4b5563">🤖 Obstacle Avoiding Robot — HC-SR04 Sonar + Dual DC Motors</text>
    </svg>
  );
}
