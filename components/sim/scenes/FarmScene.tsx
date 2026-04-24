'use client';
import { useProjectStore } from '@/stores/projectStore';

function useGpioHigh(definitionId: string) {
  const components = useProjectStore((s) => s.components);
  const comp = Object.values(components).find((c) => c.definitionId === definitionId);
  return comp?.pinStates?.['anode']?.value === 1;
}

export default function FarmScene() {
  const pumpOn   = useGpioHigh('relay');
  const ledOn    = useGpioHigh('led-green');

  return (
    <svg viewBox="0 0 700 210" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pumpOn ? '#713f12' : '#92400e'} />
          <stop offset="100%" stopColor={pumpOn ? '#854d0e' : '#78350f'} />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="700" height="210" fill="url(#sky)" />

      {/* Ground */}
      <rect y="150" width="700" height="60" fill="#4ade80" opacity="0.4" />
      <rect y="165" width="700" height="45" fill="#16a34a" opacity="0.25" />

      {/* Greenhouse frame */}
      <rect x="20" y="30" width="480" height="135" rx="4" fill="rgba(220,252,231,0.35)" stroke="#86efac" strokeWidth="2" />
      <line x1="20" y1="80" x2="500" y2="80" stroke="#86efac" strokeWidth="1" strokeDasharray="6,4" />
      {/* Roof */}
      <polygon points="20,30 260,5 500,30" fill="rgba(187,247,208,0.4)" stroke="#4ade80" strokeWidth="2" />

      {/* Soil beds */}
      {[60, 180, 300].map((x, i) => (
        <g key={i}>
          <rect x={x} y="90" width="110" height="55" rx="4" fill="url(#soil)" />
          {/* Moisture level bar */}
          <rect x={x+4} y="94" width="102" height="6" rx="3" fill="#292524" />
          <rect x={x+4} y="94" width={pumpOn ? 90 : 35 + i * 18} height="6" rx="3"
            fill={pumpOn ? '#60a5fa' : '#b45309'} style={{ transition: 'width 1s ease' }} />
          {/* Plants */}
          {[0,1,2,3].map(p => (
            <g key={p}>
              <line x1={x+18+p*22} y1="145" x2={x+18+p*22} y2={pumpOn ? 108 : 118}
                stroke="#22c55e" strokeWidth="2" style={{ transition: 'y2 1s ease' }} />
              <ellipse cx={x+18+p*22} cy={pumpOn ? 105 : 115} rx="7" ry={pumpOn ? 9 : 6}
                fill="#4ade80" style={{ transition: 'all 1s ease' }} />
            </g>
          ))}
        </g>
      ))}

      {/* Drip irrigation pipe */}
      <rect x="40" y="85" width="440" height="5" rx="2" fill="#94a3b8" />
      {/* Water drops when pump on */}
      {pumpOn && [85, 135, 205, 255, 325, 375].map((x, i) => (
        <ellipse key={i} cx={x} cy={95 + (i % 3) * 12} rx="3" ry="5"
          fill="#60a5fa" opacity="0.85">
          <animate attributeName="cy" values="90;148;90" dur={`${0.8 + i * 0.15}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.3;1" dur={`${0.8 + i * 0.15}s`} repeatCount="indefinite" />
        </ellipse>
      ))}

      {/* Sensor/status panel */}
      <rect x="515" y="30" width="170" height="145" rx="8" fill="rgba(15,23,42,0.85)" stroke="#334155" strokeWidth="1.5" />
      <text x="600" y="50" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#94a3b8">📊 Farm Status</text>

      {/* Pump status */}
      <circle cx="540" cy="72" r="7" fill={pumpOn ? '#22c55e' : '#374151'}
        style={{ filter: pumpOn ? 'drop-shadow(0 0 6px #22c55e)' : 'none', transition: 'all 0.3s' }} />
      <text x="553" y="76" fontSize="9" fill={pumpOn ? '#4ade80' : '#6b7280'}>
        {pumpOn ? '💧 Pump ON' : '⏸ Pump OFF'}
      </text>

      {/* LED status */}
      <circle cx="540" cy="94" r="7" fill={ledOn ? '#86efac' : '#374151'}
        style={{ filter: ledOn ? 'drop-shadow(0 0 6px #86efac)' : 'none', transition: 'all 0.3s' }} />
      <text x="553" y="98" fontSize="9" fill={ledOn ? '#4ade80' : '#6b7280'}>
        {ledOn ? '🟢 Status ON' : '⚫ Status OFF'}
      </text>

      {/* Moisture */}
      <text x="530" y="118" fontSize="9" fill="#94a3b8">💧 Soil Moisture</text>
      <rect x="530" y="122" width="140" height="8" rx="4" fill="#1e293b" />
      <rect x="530" y="122" width={pumpOn ? 120 : 45} height="8" rx="4"
        fill={pumpOn ? '#3b82f6' : '#b45309'} style={{ transition: 'width 1.2s ease' }} />
      <text x="680" y="130" textAnchor="end" fontSize="8" fill="#60a5fa">
        {pumpOn ? '82%' : '28%'}
      </text>

      {/* Temp & Humidity */}
      <text x="530" y="150" fontSize="9" fill="#94a3b8">🌡 Temp</text>
      <text x="620" y="150" fontSize="10" fontWeight="bold" fill="#fbbf24">24.3°C</text>
      <text x="530" y="166" fontSize="9" fill="#94a3b8">💦 Humidity</text>
      <text x="620" y="166" fontSize="10" fontWeight="bold" fill="#60a5fa">62%</text>

      {/* Scene label */}
      <text x="10" y="207" fontSize="9" fill="#4b5563">🌱 Smart Farm — Greenhouse Irrigation Controller</text>
    </svg>
  );
}
