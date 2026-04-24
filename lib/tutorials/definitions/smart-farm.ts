import type { TutorialDefinition } from '../types';
import { useProjectStore } from '@/stores/projectStore';
import { getComponentDefinition } from '@/lib/components';

const uid = () => Math.random().toString(36).slice(2, 9);

const FARM_CODE = `import time, random
from gpiozero import OutputDevice, LED
from Adafruit_DHT import read_retry, DHT22

PUMP_PIN   = 27   # Relay → water pump
STATUS_PIN = 17   # Green LED → pump running indicator
DHT_PIN    = 22   # DHT22 → temperature + humidity
MOISTURE_THRESHOLD = 40  # % — water when soil is below this

pump   = OutputDevice(PUMP_PIN, active_high=True)
status = LED(STATUS_PIN)

print('🌱 Smart Farm Controller starting...')
print(f'  Soil moisture threshold: {MOISTURE_THRESHOLD}%')
print(f'  Pump (relay) on GPIO {PUMP_PIN}')
print(f'  DHT22 on GPIO {DHT_PIN}')

try:
    cycle = 0
    while True:
        cycle += 1
        # Simulate soil moisture sensor (0-100%). 
        # In a real build, use an ADC + resistive sensor.
        moisture = random.uniform(15, 85)

        # Read climate sensor
        humidity, temperature = read_retry(DHT22, DHT_PIN)
        if humidity is None:    humidity    = random.uniform(40, 80)
        if temperature is None: temperature = random.uniform(18, 35)

        print(f'\\n📊 Cycle {cycle}')
        print(f'   Soil moisture : {moisture:.1f}%')
        print(f'   Temperature   : {temperature:.1f} °C')
        print(f'   Humidity      : {humidity:.1f} %')

        if moisture < MOISTURE_THRESHOLD:
            pump.on()
            status.on()
            print(f'💧 Moisture LOW — pump ON for 2 s')
            time.sleep(2)
            pump.off()
            status.off()
            print('⏹  Pump cycle complete')
        else:
            pump.off()
            status.off()
            print(f'✅ Moisture OK — pump resting')

        if temperature > 30:
            print(f'🌡️  Heat alert: {temperature:.1f} °C  — consider shade / extra watering')

        time.sleep(1)

except KeyboardInterrupt:
    pump.off()
    status.off()
    print('\\n🛑 Farm controller stopped')
`;

function setupSmartFarmCircuit() {
  useProjectStore.setState({ components: {}, wires: {}, breadboards: {}, past: [], future: [] });

  const { addComponent, addWire, boardPosition: bp, boardModel } = useProjectStore.getState();
  const boardId = boardModel;

  const dht22Id  = addComponent(getComponentDefinition('dht22')!,     { x: bp.x + 310, y: bp.y });
  const relayId  = addComponent(getComponentDefinition('relay')!,     { x: bp.x + 310, y: bp.y + 90 });
  const ledId    = addComponent(getComponentDefinition('led-green')!, { x: bp.x + 310, y: bp.y + 175 });

  const w = (color: string, pinNum: number, compId: string, pinId: string) =>
    addWire({ id: uid(), color: color as never, path: [], validated: true, warnings: [],
      startPinRef: { type: 'board', boardId, pinNumber: pinNum },
      endPinRef:   { type: 'component', componentId: compId, pinId } });

  // DHT22: data→GPIO22 (pin15), vcc→3V3 (pin1), gnd→GND (pin6)
  w('yellow', 15, dht22Id, 'data');
  w('red',    1,  dht22Id, 'vcc');
  w('black',  6,  dht22Id, 'gnd');

  // Relay: signal→GPIO27 (pin13), vcc→5V (pin2), gnd→GND (pin14)
  w('orange', 13, relayId, 'signal');
  w('red',    2,  relayId, 'vcc');
  w('black',  14, relayId, 'gnd');

  // LED: anode→GPIO17 (pin11), cathode→GND (pin9)
  w('green',  11, ledId, 'anode');
  w('black',  9,  ledId, 'cathode');

  useProjectStore.getState().setCode(FARM_CODE);
}

export const smartFarmTutorial: TutorialDefinition = {
  id: 'smart-farm-tutorial',
  title: '🌱 Smart Farm Automation',
  description: 'Automate a farm: soil moisture monitoring, automated water pump relay, climate tracking with DHT22, and a pump status LED. Full working code is auto-loaded.',
  difficulty: 'intermediate',
  estimatedMinutes: 15,
  onStart: setupSmartFarmCircuit,
  steps: [
    {
      id: 'welcome',
      title: '🌱 Farm Circuit Ready!',
      content: 'Your farm circuit is wired and code is loaded:\n\n• 🌡️ DHT22 → GPIO22 (temperature + humidity)\n• ⚡ Relay → GPIO27 (water pump control)\n• 🟢 Green LED → GPIO17 (pump status indicator)\n\nThe Pi monitors soil moisture and auto-triggers the pump when levels drop below 40%.',
      completionCondition: { type: 'manual' },
      hints: ['Scroll the canvas to see all three components connected to the Pi.'],
      tourTarget: 'canvas',
    },
    {
      id: 'understand-sensors',
      title: '🔬 How the Farm Sensors Work',
      content: 'Real farms use capacitive or resistive soil moisture sensors (via an ADC chip like MCP3008). In this simulation:\n\n• **Soil moisture** — simulated as a random 15–85% reading each cycle\n• **DHT22** — reads real-style temperature + humidity via GPIO22\n• **Relay** — acts as the water pump switch (turns on when moisture < 40%)\n• **LED** — glows when the pump is running',
      completionCondition: { type: 'manual' },
      hints: ['In a real build, connect an MCP3008 ADC via SPI to read the moisture sensor voltage.'],
      tourTarget: 'canvas',
    },
    {
      id: 'run',
      title: '▶ Run the Farm!',
      content: 'Click ▶ Play. Watch the console:\n\n• 📊 Soil moisture % printed every cycle\n• 💧 Pump ON when moisture < 40% → runs 2 s then off\n• ✅ Pump resting when soil is wet enough\n• 🌡️ Heat alert when temp > 30°C\n\nThe LED status indicator mirrors the pump relay state.',
      completionCondition: { type: 'simulation-started' },
      hints: ['First run downloads Python runtime (~6 MB). Wait for the console to say it\'s ready.'],
      tourTarget: 'run-btn',
    },
  ],
};
