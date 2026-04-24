'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
type DeviceType = 'router' | 'switch' | 'pc' | 'laptop' | 'ap' | 'server' | 'cloud';
interface NetDevice { id: string; type: DeviceType; name: string; ip: string; subnet: string; gateway: string; x: number; y: number; }
interface NetLink   { id: string; from: string; to: string; wireless?: boolean; }
interface Topology  { name: string; devices: NetDevice[]; links: NetLink[]; }

const ICONS: Record<DeviceType, string> = {
  router: '📡', switch: '🔀', pc: '🖥️', laptop: '💻', ap: '📶', server: '🗄️', cloud: '☁️',
};

// ── Preset topologies ────────────────────────────────────────────────────────
const HOME: Topology = {
  name: 'Home Network',
  devices: [
    { id: 'isp',    type: 'cloud',  name: 'Internet',     ip: '1.1.1.1',       subnet: '255.0.0.0',     gateway: '',            x: 200, y: 32  },
    { id: 'rtr',    type: 'router', name: 'Home Router',  ip: '192.168.1.1',   subnet: '255.255.255.0', gateway: '1.1.1.1',     x: 200, y: 105 },
    { id: 'sw',     type: 'switch', name: 'Switch',       ip: '192.168.1.2',   subnet: '255.255.255.0', gateway: '192.168.1.1', x: 120, y: 185 },
    { id: 'ap',     type: 'ap',     name: 'Wi-Fi AP',     ip: '192.168.1.3',   subnet: '255.255.255.0', gateway: '192.168.1.1', x: 290, y: 185 },
    { id: 'pc1',    type: 'pc',     name: 'Desktop PC',   ip: '192.168.1.100', subnet: '255.255.255.0', gateway: '192.168.1.1', x: 60,  y: 265 },
    { id: 'laptop', type: 'laptop', name: 'Laptop',       ip: '192.168.1.101', subnet: '255.255.255.0', gateway: '192.168.1.1', x: 185, y: 265 },
    { id: 'phone',  type: 'laptop', name: 'Phone',        ip: '192.168.1.102', subnet: '255.255.255.0', gateway: '192.168.1.1', x: 345, y: 265 },
  ],
  links: [
    { id: 'l1', from: 'isp', to: 'rtr' },
    { id: 'l2', from: 'rtr', to: 'sw'  },
    { id: 'l3', from: 'rtr', to: 'ap'  },
    { id: 'l4', from: 'sw',  to: 'pc1' },
    { id: 'l5', from: 'sw',  to: 'laptop' },
    { id: 'l6', from: 'ap',  to: 'phone', wireless: true },
  ],
};

const OFFICE: Topology = {
  name: 'Office Network',
  devices: [
    { id: 'isp',  type: 'cloud',  name: 'Internet',      ip: '8.8.8.8',      subnet: '255.0.0.0',   gateway: '',          x: 200, y: 25  },
    { id: 'rtr',  type: 'router', name: 'Edge Router',   ip: '10.0.0.1',     subnet: '255.255.0.0', gateway: '8.8.8.8',   x: 200, y: 95  },
    { id: 'csw',  type: 'switch', name: 'Core Switch',   ip: '10.0.0.2',     subnet: '255.255.0.0', gateway: '10.0.0.1',  x: 200, y: 170 },
    { id: 'fsw',  type: 'switch', name: 'Floor Switch',  ip: '10.0.1.1',     subnet: '255.255.0.0', gateway: '10.0.0.1',  x: 90,  y: 245 },
    { id: 'srv',  type: 'server', name: 'Server Rack',   ip: '10.0.0.10',    subnet: '255.255.0.0', gateway: '10.0.0.1',  x: 320, y: 245 },
    { id: 'pc1',  type: 'pc',     name: 'Workstation 1', ip: '10.0.1.100',   subnet: '255.255.0.0', gateway: '10.0.0.1',  x: 40,  y: 305 },
    { id: 'pc2',  type: 'pc',     name: 'Workstation 2', ip: '10.0.1.101',   subnet: '255.255.0.0', gateway: '10.0.0.1',  x: 145, y: 305 },
    { id: 'web',  type: 'server', name: 'Web Server',    ip: '10.0.0.20',    subnet: '255.255.0.0', gateway: '10.0.0.1',  x: 275, y: 305 },
    { id: 'db',   type: 'server', name: 'DB Server',     ip: '10.0.0.21',    subnet: '255.255.0.0', gateway: '10.0.0.1',  x: 365, y: 305 },
  ],
  links: [
    { id: 'l1', from: 'isp', to: 'rtr'  },
    { id: 'l2', from: 'rtr', to: 'csw'  },
    { id: 'l3', from: 'csw', to: 'fsw'  },
    { id: 'l4', from: 'csw', to: 'srv'  },
    { id: 'l5', from: 'fsw', to: 'pc1'  },
    { id: 'l6', from: 'fsw', to: 'pc2'  },
    { id: 'l7', from: 'srv', to: 'web'  },
    { id: 'l8', from: 'srv', to: 'db'   },
  ],
};

// ── IP utilities ─────────────────────────────────────────────────────────────
function ipToInt(ip: string) { return ip.split('.').reduce((a, o) => (a << 8) + parseInt(o, 10), 0) >>> 0; }
function sameSubnet(a: string, b: string, mask: string) { const m = ipToInt(mask); return (ipToInt(a) & m) === (ipToInt(b) & m); }
function bfsPath(devices: NetDevice[], links: NetLink[], from: string, to: string): string[] {
  if (from === to) return [from];
  const visited = new Set<string>();
  const q: { id: string; path: string[] }[] = [{ id: from, path: [from] }];
  while (q.length) {
    const { id, path } = q.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const l of links) {
      const nbr = l.from === id ? l.to : l.to === id ? l.from : null;
      if (!nbr) continue;
      if (nbr === to) return [...path, nbr];
      if (!visited.has(nbr)) q.push({ id: nbr, path: [...path, nbr] });
    }
  }
  return [];
}

// ── Command processor ─────────────────────────────────────────────────────────
function runCmd(raw: string, devices: NetDevice[], links: NetLink[], src: NetDevice): string[] {
  const parts = raw.trim().split(/\s+/);
  const verb  = parts[0].toLowerCase();
  switch (verb) {
    case 'help':
      return ['📖 Commands:', '  ipconfig           — show IP config', '  ping <ip>          — test connectivity',
        '  traceroute <ip>    — trace route', '  arp -a             — show ARP table',
        '  show devices       — list all devices', '  show links         — list connections', '  clear              — clear screen',
        '', 'Click a device in the diagram to set it as your source.'];
    case 'ipconfig': case 'ifconfig':
      if (parts[1] === '/all' || parts[1] === '-a') {
        return ['Device'.padEnd(20) + 'IP'.padEnd(18) + 'Subnet'.padEnd(18) + 'Gateway',
          '─'.repeat(68), ...devices.map(d => d.name.padEnd(20) + d.ip.padEnd(18) + d.subnet.padEnd(18) + (d.gateway || '—'))];
      }
      return [`Device:   ${src.name}`, `IP Addr:  ${src.ip}`, `Subnet:   ${src.subnet}`, `Gateway:  ${src.gateway || '(none)'}`, `Type:     ${src.type}`];
    case 'ping': {
      const tgt = devices.find(d => d.ip === parts[1]);
      if (!parts[1]) return ['Usage: ping <ip-address>'];
      if (!tgt)      return [`ping: ${parts[1]}: No route to host`, 'Request timed out.'];
      const path = bfsPath(devices, links, src.id, tgt.id);
      if (!path.length) return [`ping: ${parts[1]}: Destination unreachable`];
      const rtt = 1 + (path.length - 1) * 3;
      const r = (v: number) => v + Math.floor(Math.random() * 3);
      return [`Pinging ${tgt.ip} (${tgt.name}) from ${src.ip}:`,
        `  Reply: bytes=32 time=${r(rtt)}ms TTL=${128 - path.length + 1}`,
        `  Reply: bytes=32 time=${r(rtt)}ms TTL=${128 - path.length + 1}`,
        `  Reply: bytes=32 time=${r(rtt)}ms TTL=${128 - path.length + 1}`,
        `  Reply: bytes=32 time=${r(rtt)}ms TTL=${128 - path.length + 1}`,
        '', `Packets: Sent=4, Received=4, Lost=0 (0%)  Avg RTT: ${rtt + 1}ms`];
    }
    case 'traceroute': case 'tracert': {
      const tgt = devices.find(d => d.ip === parts[1]);
      if (!parts[1]) return ['Usage: traceroute <ip-address>'];
      if (!tgt)      return [`traceroute: ${parts[1]}: No route to host`];
      const path = bfsPath(devices, links, src.id, tgt.id);
      if (!path.length) return [`traceroute: Network unreachable`];
      const out = [`Tracing route to ${tgt.name} [${tgt.ip}]:`, ''];
      path.slice(1).forEach((id, i) => {
        const dev = devices.find(d => d.id === id)!;
        const rtt = (i + 1) * 3 + Math.floor(Math.random() * 3);
        out.push(`  ${String(i + 1).padStart(2)}  ${rtt}ms  ${dev.ip} (${dev.name})`);
      });
      out.push('', 'Trace complete.');
      return out;
    }
    case 'arp': {
      const peers = devices.filter(d => d.id !== src.id && sameSubnet(src.ip, d.ip, src.subnet));
      if (!peers.length) return ['ARP cache empty.'];
      const out = [`ARP Table — ${src.name} (${src.ip}):`, '  IP'.padEnd(22) + 'MAC'.padEnd(22) + 'Type'];
      peers.forEach(d => {
        const mac = [...d.id].map((c, i) => ((c.charCodeAt(0) + i * 13) % 256).toString(16).padStart(2, '0')).join(':').slice(0, 17);
        out.push(`  ${d.ip.padEnd(20)}${mac.padEnd(22)}dynamic`);
      });
      return out;
    }
    case 'show':
      if (parts[1] === 'devices') return ['Name'.padEnd(20) + 'Type'.padEnd(10) + 'IP'.padEnd(18) + 'Gateway',
        '─'.repeat(60), ...devices.map(d => d.name.padEnd(20) + d.type.padEnd(10) + d.ip.padEnd(18) + (d.gateway || '—'))];
      if (parts[1] === 'links') return links.map(l => {
        const f = devices.find(d => d.id === l.from)?.name ?? l.from;
        const t = devices.find(d => d.id === l.to)?.name ?? l.to;
        return `  ${f} ──${l.wireless ? '~(wifi)~' : '──'}── ${t}`;
      });
      return ['Usage: show devices | show links'];
    case 'clear': return ['__CLEAR__'];
    default: return [`Command not found: ${verb}. Type 'help' for commands.`];
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NetworkLab() {
  const PRESETS = [HOME, OFFICE];
  const [topo, setTopo]       = useState<Topology>(HOME);
  const [selected, setSelected] = useState<NetDevice | null>(null);
  const [lines, setLines]     = useState<string[]>(['🌐 PiForge Network Lab  —  Cisco-style home & office networking',
    "Click a device to select it as your source, then type 'help' to see commands."]);
  const [input, setInput]     = useState('');
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => { termRef.current?.scrollTo(0, 999999); }, [lines]);

  const src = selected ?? topo.devices.find(d => d.type === 'pc') ?? topo.devices[0];

  const submit = useCallback(() => {
    if (!input.trim()) return;
    const result = runCmd(input, topo.devices, topo.links, src);
    if (result[0] === '__CLEAR__') { setLines([]); }
    else { setLines(prev => [...prev, `> ${input}`, ...result]); }
    setInput('');
  }, [input, topo, src]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Preset bar */}
      <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30">
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Topology:</span>
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => { setTopo(p); setSelected(null); setLines(['🌐 Loaded: ' + p.name]); }}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${topo.name === p.name ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {p.name}
          </button>
        ))}
        {selected && <span className="ml-auto text-[9px] text-blue-400 truncate">src: {selected.name} ({selected.ip})</span>}
      </div>

      {/* SVG Topology */}
      <div className="shrink-0 bg-muted/10 border-b border-border overflow-hidden" style={{ height: 220 }}>
        <svg viewBox="0 0 400 330" className="w-full h-full">
          {topo.links.map(l => {
            const f = topo.devices.find(d => d.id === l.from);
            const t = topo.devices.find(d => d.id === l.to);
            if (!f || !t) return null;
            return <line key={l.id} x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke={l.wireless ? '#60a5fa' : '#4b5563'} strokeWidth={l.wireless ? 1 : 1.5}
              strokeDasharray={l.wireless ? '5,3' : undefined} />;
          })}
          {topo.devices.map(dev => {
            const isSrc = src.id === dev.id;
            const isSel = selected?.id === dev.id;
            return (
              <g key={dev.id} onClick={() => setSelected(isSel ? null : dev)} style={{ cursor: 'pointer' }}>
                <circle cx={dev.x} cy={dev.y} r={19}
                  fill={isSrc ? '#1e3a5f' : '#1f2937'}
                  stroke={isSrc ? '#3b82f6' : isSel ? '#60a5fa' : '#374151'}
                  strokeWidth={isSrc || isSel ? 2 : 1} />
                <text x={dev.x} y={dev.y + 6} textAnchor="middle" fontSize="14" style={{ userSelect: 'none' }}>{ICONS[dev.type]}</text>
                <text x={dev.x} y={dev.y + 29} textAnchor="middle" fontSize="6.5" fill="#9ca3af" style={{ userSelect: 'none' }}>{dev.name}</text>
                <text x={dev.x} y={dev.y + 38} textAnchor="middle" fontSize="6" fill="#6b7280" style={{ userSelect: 'none' }}>{dev.ip}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Terminal */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="shrink-0 px-3 py-1 bg-muted/20 border-b border-border">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Network Terminal</span>
        </div>
        <div ref={termRef} className="flex-1 overflow-y-auto p-2 bg-black/40 font-mono text-[10px] leading-relaxed space-y-px">
          {lines.map((line, i) => (
            <div key={i} className={line.startsWith('>') ? 'text-white' : line.includes('Reply') || line.includes('✅') ? 'text-green-400' : line.includes('timed out') || line.includes('unreachable') ? 'text-red-400' : 'text-green-300'}>
              {line || '\u00a0'}
            </div>
          ))}
        </div>
        <div className="shrink-0 flex items-center gap-2 px-2 py-1.5 border-t border-border bg-black/30">
          <span className="text-[10px] font-mono text-blue-400 shrink-0">{src.name}@net:~$</span>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="flex-1 bg-transparent outline-none text-[10px] font-mono text-green-300 placeholder-green-900"
            placeholder="ping 192.168.1.1…" autoComplete="off" spellCheck={false} />
          <button onClick={submit} className="text-[9px] text-green-500 hover:text-green-300 shrink-0">↵</button>
        </div>
      </div>
    </div>
  );
}
