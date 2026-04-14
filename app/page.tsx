'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import {
  Cpu, Zap, Cable, Code, CircuitBoard, Users, Share2,
  BookOpen, Download, Wifi, Monitor, Layers, ArrowRight,
  GitFork, Star, Sparkles, GraduationCap, Globe,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function LandingPage() {
  const { user, openModal } = useAuthStore();
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Cpu className="h-6 w-6 text-green-500" />
            <span>PiForge</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#tutorials" className="hover:text-foreground transition-colors">Tutorials</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => openModal('signin')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-[10px] font-bold text-green-400">
                  {user.name[0].toUpperCase()}
                </div>
                {user.name.split(' ')[0]}
              </button>
            ) : (
              <button onClick={() => openModal('signin')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </button>
            )}
            <Link href="/lab" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors">
              Launch Lab
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-24 md:py-32 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 mb-6">
            <Sparkles className="h-4 w-4" /> Robotics &middot; Sensors &middot; Real Python &middot; Touchscreen
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            The Virtual{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Raspberry Pi
            </span>{' '}
            Laboratory
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Build obstacle-avoiding robots, weather stations, and touchscreen dashboards. Wire up real components, write genuine Python, and watch your circuits run — all in your browser. No hardware required.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/lab" className="rounded-xl bg-green-600 px-8 py-3.5 text-lg font-semibold text-white hover:bg-green-500 transition-all hover:scale-105 shadow-lg shadow-green-600/25 flex items-center gap-2">
              Start Building Free <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#pricing" className="rounded-xl border border-border px-8 py-3.5 text-lg font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              View Pricing
            </a>
          </motion.div>
        </motion.div>

        {/* Animated circuit traces */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5, duration: 1 }} className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 600">
            <motion.path d="M100,300 C200,100 400,500 600,300 S1000,100 1100,300" fill="none" stroke="#22c55e" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: 'easeInOut' }} />
            <motion.path d="M150,350 C250,150 450,550 650,350 S1050,150 1150,350" fill="none" stroke="#3b82f6" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3.5, ease: 'easeInOut', delay: 0.3 }} />
          </svg>
        </motion.div>
      </section>


      {/* ── Animated Lab Demo ── */}
      <section className="py-16 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Your lab, in the browser</h2>
            <p className="text-muted-foreground">Wire an obstacle-avoiding robot, write the Python, and watch it run — no hardware needed.</p>
          </motion.div>
          <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-background overflow-hidden shadow-2xl shadow-green-500/5">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/50">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
              <div className="flex-1 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] font-medium">Pi 5</span>
                <span>PiForge Lab — Obstacle Avoiding Robot</span>
                <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] animate-pulse">● Running</span>
              </div>
              <div className="w-16" />
            </div>
            <div className="grid grid-cols-12 h-[520px]">
              {/* Sidebar */}
              <div className="col-span-2 border-r border-border p-3 space-y-1.5 overflow-hidden">
                <div className="rounded-md border border-dashed border-border px-2 py-1.5 text-[10px] text-center text-muted-foreground mb-2">+ Breadboard</div>
                {[
                  { cat: 'Robotics', items: ['⚙️ Servo (SG90)', '🔄 DC Motor ×2'] },
                  { cat: 'Sensors',  items: ['📡 HC-SR04', '🌡️ DHT22', '👁️ PIR'] },
                  { cat: 'Output',   items: ['🔴 Red LED', '🟢 Green LED', '🌈 RGB LED'] },
                  { cat: 'Input',    items: ['⏺ Push Button'] },
                ].map(({cat,items}) => (
                  <div key={cat}>
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{cat}</div>
                    {items.map(item => (
                      <motion.div key={item} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.5}} className="text-[10px] text-foreground/70 px-2 py-1 rounded bg-muted/40 mb-0.5">{item}</motion.div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Canvas */}
              <div className="col-span-7 bg-[#0a0f14] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage:"radial-gradient(circle, #444 1px, transparent 1px)",backgroundSize:"16px 16px"}} />

                {/* Pi board */}
                <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:0.3,duration:0.6}}
                  className="absolute top-4 left-6 w-48 h-32 rounded-md border border-green-700/60"
                  style={{background:"linear-gradient(135deg, #166534 0%, #14532d 100%)"}}>
                  <div className="absolute top-1.5 left-2 text-[7px] font-mono text-green-300/40">Raspberry Pi 5</div>
                  <div className="absolute top-2 right-2 flex flex-col gap-[2px]">{Array.from({length:10}).map((_,i)=>(<div key={i} className="flex gap-[2px]"><div className="w-[4px] h-[4px] rounded-full bg-yellow-500/60" /><div className="w-[4px] h-[4px] rounded-full bg-blue-500/50" /></div>))}</div>
                  <div className="absolute top-8 left-8 w-10 h-10 rounded bg-[#111] border border-[#222] flex items-center justify-center"><span className="text-[5px] font-mono text-white/20">BCM2712</span></div>
                </motion.div>

                {/* Breadboard */}
                <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.7,duration:0.5}}
                  className="absolute top-[165px] left-6 w-[310px] h-[60px] rounded border border-[#d4cfc4]"
                  style={{background:"#f5f0e8"}}>
                  <div className="absolute top-1 left-2 right-2 h-[5px] flex items-center"><div className="w-full h-px bg-red-400/40" /></div>
                  <div className="absolute bottom-1 left-2 right-2 h-[5px] flex items-center"><div className="w-full h-px bg-blue-400/40" /></div>
                </motion.div>

                {/* HC-SR04 sensor */}
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}
                  className="absolute top-[175px] left-[240px] flex gap-1">
                  <div className="w-8 h-8 rounded-sm border border-gray-600 bg-[#1a1a2e] flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-500/60 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-500/40" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-sm border border-gray-600 bg-[#1a1a2e] flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-cyan-500/60 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-500/40" />
                    </div>
                  </div>
                </motion.div>

                {/* DC Motor left */}
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3}}
                  className="absolute bottom-[80px] left-[60px] w-10 h-10 rounded-full border-2 border-gray-500 bg-[#1a1a1a] flex items-center justify-center">
                  <motion.div animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:'linear'}} className="w-5 h-5 rounded-full border-2 border-green-500/70" style={{borderTopColor:'transparent'}} />
                </motion.div>
                {/* DC Motor right */}
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.4}}
                  className="absolute bottom-[80px] left-[130px] w-10 h-10 rounded-full border-2 border-gray-500 bg-[#1a1a1a] flex items-center justify-center">
                  <motion.div animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:'linear'}} className="w-5 h-5 rounded-full border-2 border-green-500/70" style={{borderTopColor:'transparent'}} />
                </motion.div>

                {/* Distance readout */}
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.5}}
                  className="absolute top-[120px] right-8 rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-center">
                  <div className="text-[8px] text-cyan-400/70 mb-0.5">HC-SR04 Distance</div>
                  <motion.div animate={{opacity:[1,0.4,1]}} transition={{duration:2,repeat:Infinity}} className="text-lg font-bold font-mono text-cyan-400">32 cm</motion.div>
                  <div className="text-[8px] text-cyan-400/50">← obstacle detected</div>
                </motion.div>

                {/* Wires */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.path d="M196,60 C196,130 200,165 200,165" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.7}} transition={{delay:1,duration:0.6}} />
                  <motion.path d="M186,64 C186,130 180,165 180,165" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.7}} transition={{delay:1.1,duration:0.6}} />
                  <motion.path d="M176,68 C176,140 240,160 240,175" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.7}} transition={{delay:1.2,duration:0.7}} />
                  <motion.path d="M166,72 C166,145 265,160 265,175" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.7}} transition={{delay:1.3,duration:0.7}} />
                  <motion.path d="M156,76 C156,150 75,170 75,310" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.7}} transition={{delay:1.5,duration:0.8}} />
                  <motion.path d="M146,80 C146,150 145,170 145,310" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.7}} transition={{delay:1.6,duration:0.8}} />
                </svg>
              </div>

              {/* Editor + Console */}
              <div className="col-span-3 border-l border-border flex flex-col">
                <div className="px-3 py-1.5 border-b border-border flex items-center gap-2">
                  <span className="text-[10px] text-foreground border-b border-green-500 pb-0.5">Editor</span>
                  <span className="text-[10px] text-muted-foreground">Properties</span>
                </div>
                <div className="flex-1 bg-[#1e1e1e] p-3 font-mono text-[10px] leading-relaxed overflow-hidden">
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
                    <div><span className="text-purple-400">from</span> <span className="text-green-400">gpiozero</span> <span className="text-purple-400">import</span></div>
                    <div className="pl-4"><span className="text-yellow-300">Robot, DistanceSensor</span></div>
                    <div className="h-2" />
                    <div>robot = <span className="text-yellow-300">Robot</span>(</div>
                    <div className="pl-4">left=(<span className="text-cyan-400">7</span>,<span className="text-cyan-400">8</span>),</div>
                    <div className="pl-4">right=(<span className="text-cyan-400">9</span>,<span className="text-cyan-400">10</span>))</div>
                    <div>sensor = <span className="text-yellow-300">DistanceSensor</span>(</div>
                    <div className="pl-4">echo=<span className="text-cyan-400">24</span>, trigger=<span className="text-cyan-400">23</span>)</div>
                    <div className="h-2" />
                    <div><span className="text-purple-400">while</span> <span className="text-cyan-400">True</span>:</div>
                    <div className="pl-2"><span className="text-purple-400">if</span> sensor.distance &lt; <span className="text-cyan-400">0.3</span>:</div>
                    <div className="pl-4">robot.<span className="text-yellow-300">backward</span>()</div>
                    <div className="pl-4"><span className="text-yellow-300">sleep</span>(<span className="text-cyan-400">0.5</span>)</div>
                    <div className="pl-4">robot.<span className="text-yellow-300">right</span>()</div>
                    <div className="pl-2"><span className="text-purple-400">else</span>:</div>
                    <div className="pl-4">robot.<span className="text-yellow-300">forward</span>()</div>
                  </motion.div>
                </div>
                <div className="h-[130px] border-t border-border shrink-0">
                  <div className="px-3 py-1 border-b border-border text-[10px] text-muted-foreground">Console</div>
                  <div className="p-2 font-mono text-[10px] space-y-0.5 overflow-hidden">
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}} className="text-muted-foreground italic">Pyodide 3.12 ready.</motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.2}} className="text-green-400">▶ Robot moving forward…</motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:[0,1,1,0.7]}} transition={{delay:3,duration:1.5,repeat:Infinity,repeatDelay:3}} className="text-yellow-400">⚠ Obstacle at 32 cm</motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:[0,0,1,0.7]}} transition={{delay:3.5,duration:1.5,repeat:Infinity,repeatDelay:3}} className="text-cyan-400">↩ Backing up + turning right</motion.div>
                    <motion.div initial={{opacity:0}} animate={{opacity:[0,0,0,1,0.7]}} transition={{delay:4,duration:2,repeat:Infinity,repeatDelay:3}} className="text-green-400">▶ Robot moving forward…</motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-10">
          {[
            { num: '40', label: 'GPIO Pins Simulated' },
            { num: '20+', label: 'Components' },
            { num: '60fps', label: 'Canvas Performance' },
            { num: '100%', label: 'Client-Side' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="text-center">
              <div className="text-3xl font-bold text-green-500">{s.num}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to prototype</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From realistic hardware to in-browser Python execution — PiForge gives you a complete electronics lab.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CircuitBoard, title: 'Pi 4 & Pi 5 Boards', desc: 'Toggle between accurate board models with correct GPIO pinouts, SoC chips, ports, and mounting holes.', color: 'text-green-500' },
              { icon: Cable, title: 'Smart Wiring', desc: 'Click-drag bezier wires that auto-color by type. Short-circuit detection warns you before you fry anything.', color: 'text-blue-500' },
              { icon: Code, title: 'Python in Browser', desc: 'GPIO Zero and RPi.GPIO run via Pyodide. No install, no server — your code executes instantly.', color: 'text-purple-500' },
              { icon: Zap, title: 'Real-Time I/O', desc: 'Set a pin HIGH and the LED glows. Click a button and your code reads the edge. Bidirectional, sub-50ms.', color: 'text-yellow-500' },
              { icon: Layers, title: 'Component Library', desc: 'LEDs, buttons, sensors, motors, displays, and touchscreens. JSON-based — add your own components.', color: 'text-orange-500' },
              { icon: Monitor, title: 'Programmable Displays', desc: 'Attach virtual touchscreens via simulated DSI/SPI. Render pygame output and send touch events back.', color: 'text-cyan-500' },
              { icon: Users, title: 'Collaborate', desc: 'Share projects with a link. Fork circuits from the community. Real-time multi-user editing coming soon.', color: 'text-pink-500' },
              { icon: BookOpen, title: 'Guided Tutorials', desc: 'Step-by-step lessons from blinking an LED to building a sensor dashboard. Perfect for beginners.', color: 'text-emerald-500' },
              { icon: Download, title: 'Export Anywhere', desc: 'Export as PNG, hardware build guide, or share link. Take your virtual prototype to real hardware.', color: 'text-red-500' },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="group rounded-xl border border-border bg-muted/20 p-6 hover:border-green-500/30 hover:bg-muted/40 transition-all">
                <f.icon className={`h-8 w-8 ${f.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 bg-muted/20 border-y border-border">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-center mb-16">Build a circuit in 60 seconds</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Place your board', desc: 'Drop a Pi 4 or Pi 5 onto the canvas. Add a breadboard and components from the palette.' },
              { step: '2', title: 'Wire it up', desc: 'Shift-click pins to draw wires. They auto-color and snap to connections. Short-circuit warnings keep you safe.' },
              { step: '3', title: 'Write & run code', desc: 'Pick a template or write your own Python. Hit Play and watch your circuit come alive in real-time.' },
            ].map((s) => (
              <motion.div key={s.step} variants={fadeUp} className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">{s.step}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Tutorials Preview ── */}
      <section id="tutorials" className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 mb-4">
              <GraduationCap className="h-4 w-4" /> Learn by doing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Guided tutorials for every level</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Step-by-step projects that teach you electronics and Python — from your first LED to full sensor dashboards.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Blink an LED', level: 'Beginner', time: '5 min', desc: 'Your first circuit — wire an LED to GPIO 17 and make it blink with Python.' },
              { title: 'Button + LED', level: 'Beginner', time: '8 min', desc: 'Read button input and control an LED. Learn digital I/O basics.' },
              { title: 'Traffic Light', level: 'Intermediate', time: '12 min', desc: 'Three LEDs with timed sequences. State machines made visual.' },
              { title: 'Sensor Dashboard', level: 'Intermediate', time: '15 min', desc: 'Read temperature and humidity from a DHT22. Display data in the console.' },
            ].map((t) => (
              <motion.div key={t.title} variants={fadeUp} className="rounded-xl border border-border bg-muted/20 p-6 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.level === 'Beginner' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {t.level}
                  </span>
                  <span className="text-xs text-muted-foreground">{t.time}</span>
                </div>
                <h3 className="font-semibold mb-2">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* ── Advanced Projects ── */}
      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 mb-4">
              <Sparkles className="h-4 w-4" /> Go beyond basics
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Build real-world projects</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From roaming robots to smart home controllers — prototype complete IoT systems before buying a single component.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Roaming Robot Chassis", tag: "Robotics", tagColor: "bg-red-500/10 text-red-400", desc: "Two DC motors, ultrasonic distance sensor, and a Pi 5. Write Python to navigate obstacles autonomously.", features: ["DC motor control via H-bridge", "HC-SR04 distance sensing", "Autonomous navigation logic"] },
              { title: "Smart Home Dashboard", tag: "IoT", tagColor: "bg-blue-500/10 text-blue-400", desc: "DHT22 temp sensor, PIR motion detector, and a 7-inch touchscreen displaying a live dashboard.", features: ["Multi-sensor data fusion", "Touchscreen UI with pygame", "MQTT event publishing"] },
              { title: "LED Matrix Display", tag: "Creative", tagColor: "bg-yellow-500/10 text-yellow-400", desc: "8x8 LED matrix driven via SPI. Scroll text, draw patterns, and react to button input.", features: ["SPI protocol simulation", "Pixel-level LED control", "Animation sequencing"] },
              { title: "Security Camera System", tag: "IoT", tagColor: "bg-blue-500/10 text-blue-400", desc: "PIR motion sensor triggers a camera capture and sends an alert. Simulated camera preview included.", features: ["Motion-triggered capture", "Simulated camera feed", "Alert notification system"] },
              { title: "Weather Station", tag: "Science", tagColor: "bg-green-500/10 text-green-400", desc: "DHT22 for temp/humidity, BMP280 for pressure. Log data and display trends on an OLED screen.", features: ["Multi-sensor reading", "Data logging to console", "OLED display output"] },
              { title: "Servo Arm Controller", tag: "Robotics", tagColor: "bg-red-500/10 text-red-400", desc: "Control multiple servos with a keypad or touchscreen. Build a pick-and-place arm prototype.", features: ["PWM servo control", "Keypad input mapping", "Multi-axis coordination"] },
            ].map((p) => (
              <motion.div key={p.title} variants={fadeUp} className="rounded-xl border border-border bg-muted/20 p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.tagColor}`}>{p.tag}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
                <ul className="space-y-1">
                  {p.features.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* ── AI Everywhere ── */}
      <section className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400 mb-4">
              <Sparkles className="h-4 w-4" /> AI-Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI built into every layer</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From generating circuits to debugging code — AI assists you at every step of your build.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Circuit Generator", desc: "Describe what you want to build and AI wires it up. Say 'roaming robot with ultrasonic sensor' and get a complete circuit.", tag: "Canvas" },
              { title: "Code Assistant", desc: "AI writes GPIO Zero code for your circuit. Explains what each line does. Suggests improvements and catches bugs.", tag: "Editor" },
              { title: "Debug Helper", desc: "Short circuit? Wrong pin? AI analyzes your wiring and code together, spots the issue, and suggests the fix.", tag: "Console" },
              { title: "Component Recommender", desc: "Not sure which sensor to use? Describe your project and AI suggests the right components from the library.", tag: "Sidebar" },
              { title: "Tutorial Guide", desc: "AI adapts tutorial difficulty to your pace. Stuck on a step? It gives personalized hints without spoiling the answer.", tag: "Tutorials" },
              { title: "Build Guide Writer", desc: "Export your virtual circuit and AI generates a complete shopping list, wiring guide, and assembly instructions for real hardware.", tag: "Export" },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="rounded-xl border border-border bg-muted/20 p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">{f.tag}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Community ── */}
      <section id="community" className="py-24 px-6 bg-muted/20 border-y border-border">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <Globe className="h-12 w-12 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for learners and makers</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              PiForge is built with passion for electronics education. Join thousands of students and hobbyists already building in the browser. Share your projects, ask questions, and help others learn.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://github.com" className="rounded-xl border border-border px-6 py-3 font-medium hover:border-foreground/30 transition-colors flex items-center gap-2">
              <GitFork className="h-5 w-5" /> GitHub
            </a>
            <a href="https://github.com" className="rounded-xl border border-border px-6 py-3 font-medium hover:border-foreground/30 transition-colors flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" /> Discord Community
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Projects Showcase ── */}
      <section className="py-24 px-6 bg-muted/10 border-y border-border">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-400 mb-4">
              <Zap className="h-4 w-4" /> 18 Ready-to-Run Projects
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From blinking LEDs to full robots</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every project includes wiring diagrams, step-by-step tutorials, and complete Python code — ready to run in one click.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              {e:'🤖',n:'Obstacle Avoiding Robot',d:'Advanced'},
              {e:'🦾',n:'Servo Arm Controller',d:'Advanced'},
              {e:'📡',n:'Servo Radar Scanner',d:'Advanced'},
              {e:'🚗',n:'RC Car Dashboard',d:'Advanced'},
              {e:'🎵',n:'Touchscreen Piano',d:'Advanced'},
              {e:'🖥️',n:'GPIO Dashboard',d:'Advanced'},
              {e:'🧠',n:'Simon Says Game',d:'Advanced'},
              {e:'🌡️',n:'Weather Station',d:'Intermediate'},
              {e:'🔒',n:'Security System',d:'Intermediate'},
              {e:'🌿',n:'Plant Monitor',d:'Intermediate'},
              {e:'🌈',n:'RGB Color Cycle',d:'Intermediate'},
              {e:'⚡',n:'Reaction Timer',d:'Intermediate'},
              {e:'📡',n:'Morse Code Blinker',d:'Intermediate'},
              {e:'🌅',n:'PWM LED Fade',d:'Intermediate'},
              {e:'🚦',n:'Traffic Light',d:'Beginner'},
              {e:'🔘',n:'Button Toggle LED',d:'Beginner'},
              {e:'💡',n:'Blink an LED',d:'Beginner'},
              {e:'🎵',n:'Musical Buzzer',d:'Intermediate'},
            ].map(({e,n,d}) => (
              <motion.div key={n} variants={fadeUp}
                className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/20 p-3 hover:border-green-500/30 hover:bg-muted/40 transition-all cursor-default">
                <span className="text-2xl">{e}</span>
                <span className="text-xs font-medium text-foreground leading-snug">{n}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full w-fit font-medium ${
                  d==='Beginner' ? 'bg-green-500/10 text-green-400' :
                  d==='Intermediate' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                }`}>{d}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Start free. Upgrade when you need robotics, advanced sensors, and classroom features.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name:'Free', price:'$0', period:'forever', border:'border-border', badge:'', cta:'Get Started', ctaClass:'border border-border hover:bg-accent',
                features:['3 Projects','LED, Button, Buzzer only','2 Tutorials','Community support'] },
              { name:'Pro', price:'$9', period:'/ month', border:'border-blue-500', badge:'Most Popular', cta:'Start Free Trial', ctaClass:'bg-blue-600 hover:bg-blue-500 text-white',
                features:['Unlimited Projects','All 15 components','Robotics (Servo, Motor, Robot)','18+ Tutorials + auto-tracking','Sensor simulation sliders','pygame Touchscreen','Priority support'] },
              { name:'Education', price:'$49', period:'/ month', border:'border-purple-500', badge:'For Schools', cta:'Contact Us', ctaClass:'bg-purple-600 hover:bg-purple-500 text-white',
                features:['Everything in Pro','Up to 30 student seats','Teacher dashboard','Assignment tracking','Bulk onboarding','Dedicated SLA support'] },
            ].map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}
                className={`relative rounded-2xl border-2 ${plan.border} bg-muted/10 p-8 flex flex-col gap-4`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-0.5 text-xs font-semibold text-white">{plan.badge}</div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-sm text-muted-foreground mb-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-green-500 mt-0.5 shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/lab"
                  className={`mt-2 rounded-xl px-6 py-3 text-sm font-semibold text-center transition-colors ${plan.ctaClass}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-muted/10 border-t border-border">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to build?</h2>
          <p className="text-lg text-muted-foreground mb-8">Start free with 3 projects. Upgrade to Pro for robotics, sensors, and 18+ tutorials.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/lab" className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-10 py-4 text-xl font-semibold text-white hover:bg-green-500 transition-all hover:scale-105 shadow-lg shadow-green-600/25">
              Start for Free <ArrowRight className="h-6 w-6" />
            </Link>
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-xl border border-border px-8 py-4 text-lg font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              See Plans
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-3">
                <Cpu className="h-5 w-5 text-green-500" /> PiForge
              </div>
              <p className="text-sm text-muted-foreground">The virtual Raspberry Pi lab. Build circuits, write code, learn electronics — all in your browser.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/lab" className="hover:text-foreground transition-colors">Launch Lab</Link></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Learn</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#tutorials" className="hover:text-foreground transition-colors">Tutorials</a></li>
                <li><a href="#community" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="https://github.com" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
            &copy; 2025 PiForge Contributors. Built with Next.js, React, and Pyodide.
          </div>
        </div>
      </footer>
    </div>
  );
}
