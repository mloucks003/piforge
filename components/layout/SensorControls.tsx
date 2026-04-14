'use client';
import { useSensorStore } from '@/stores/sensorStore';
import { Activity, Thermometer, Droplets, Radio, Move, Sliders } from 'lucide-react';

function Slider({
  label, value, min, max, step = 1, unit, icon: Icon, color,
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  unit: string; icon: React.ElementType; color: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-3 w-3 ${color}`} />
          <span className="text-xs font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-xs font-mono font-bold ${color}`}>
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Move className="h-3 w-3 text-yellow-400" />
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-yellow-500' : 'bg-muted'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function SensorControls() {
  const {
    distanceCm, setDistanceCm,
    temperatureC, setTemperatureC,
    humidityPct, setHumidityPct,
    potentiometerPct, setPotentiometerPct,
    pirDetected, setPirDetected,
  } = useSensorStore();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 px-1 pb-1 border-b border-border">
        <Sliders className="h-3 w-3 text-blue-400" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sensor Controls</span>
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <Slider
          label="Distance (HC-SR04)" value={distanceCm} min={2} max={400} step={1}
          unit=" cm" icon={Activity} color="text-cyan-400"
          onChange={setDistanceCm}
        />
        <Slider
          label="Temperature (DHT22)" value={temperatureC} min={-10} max={60} step={0.5}
          unit="°C" icon={Thermometer} color="text-orange-400"
          onChange={setTemperatureC}
        />
        <Slider
          label="Humidity (DHT22)" value={humidityPct} min={0} max={100} step={1}
          unit="%" icon={Droplets} color="text-blue-400"
          onChange={setHumidityPct}
        />
        <Slider
          label="Potentiometer / Soil" value={potentiometerPct} min={0} max={100} step={1}
          unit="%" icon={Radio} color="text-yellow-400"
          onChange={setPotentiometerPct}
        />
        <Toggle
          label="PIR Motion Detected"
          value={pirDetected}
          onChange={setPirDetected}
        />
      </div>
    </div>
  );
}
