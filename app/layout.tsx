import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = "https://getpiforge.com";
const SITE_NAME = "PiForge";
const TITLE = "PiForge — Free Online Raspberry Pi & Arduino Simulator";
const DESCRIPTION =
  "Simulate Raspberry Pi, Arduino Uno, and Pi Pico W in your browser. Drag-and-drop circuits, run real Python and C++ code, and build Smart Home IoT projects — no hardware required. Free during beta.";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',   // lets env(safe-area-inset-*) work on iOS notch/home-bar devices
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: [
    "raspberry pi simulator",
    "raspberry pi emulator online",
    "virtual raspberry pi",
    "raspberry pi browser simulator",
    "raspberry pi online lab",
    "gpio simulator online",
    "arduino simulator online",
    "arduino emulator browser",
    "pi pico simulator",
    "micropython simulator",
    "circuit simulator online free",
    "iot simulator browser",
    "learn raspberry pi online",
    "raspberry pi python tutorial",
    "raspberry pi for beginners",
    "virtual hardware lab",
    "breadboard simulator online",
    "smart home raspberry pi",
    "electronics simulator",
    "raspberry pi coding simulator",
  ],
  authors: [{ name: "PiForge", url: SITE_URL }],
  creator: "PiForge",
  publisher: "PiForge",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "PiForge — Virtual Raspberry Pi Laboratory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
  alternates: { canonical: SITE_URL },
  category: "technology",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/favicon.ico" },
};

// JSON-LD structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
      sameAs: ["https://github.com/mloucks003/piforge"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any (browser-based)",
      browserRequirements: "Requires JavaScript",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "312",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Raspberry Pi 4, 5, Zero 2W GPIO simulation",
        "Arduino Uno C++ simulation",
        "Pi Pico W MicroPython simulation",
        "Real Python execution via Pyodide",
        "Drag-and-drop circuit builder",
        "Smart Home and Office floor plan projects",
        "AI-powered code assistant",
        "Interactive wiring labs",
        "18+ guided project tutorials",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is PiForge?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "PiForge is a free online Raspberry Pi and Arduino simulator that runs entirely in your browser. You can build circuits with drag-and-drop components, write real Python or C++ code, and watch your projects run — no hardware required.",
          },
        },
        {
          "@type": "Question",
          name: "Can I simulate a Raspberry Pi online for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. PiForge lets you simulate Raspberry Pi 4, Pi 5, Pi Zero 2 W, Arduino Uno, and Pi Pico W entirely for free in your browser. You can wire GPIO pins, run Python with gpiozero and RPi.GPIO, and see real output in a live console.",
          },
        },
        {
          "@type": "Question",
          name: "Does PiForge run real Python code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. PiForge uses Pyodide — a full CPython runtime compiled to WebAssembly — so your Python code runs natively in the browser. Libraries like gpiozero, Adafruit_DHT, and RPi.GPIO are all supported.",
          },
        },
        {
          "@type": "Question",
          name: "What components can I add to my circuit?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "PiForge includes LEDs, buttons, buzzers, relays, PIR motion sensors, DHT22 temperature/humidity sensors, HC-SR04 ultrasonic sensors, DC motors, servo motors, OLED displays, LCD 16×2 displays, and more. New components are added regularly.",
          },
        },
        {
          "@type": "Question",
          name: "Is PiForge good for beginners?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absolutely. PiForge includes 18+ guided tutorials from beginner (Blink an LED) to advanced (Obstacle Avoiding Robot). The interactive wiring labs place components for you and give live ✅ feedback as you connect each wire — perfect for learning electronics without real hardware.",
          },
        },
        {
          "@type": "Question",
          name: "Can I build a smart home or IoT project in PiForge?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. PiForge has one-click Smart Home, Smart Farm, Smart Office, and Robot simulation worlds. Each loads a live floor plan scene that reacts to your GPIO pins in real time — lights glow, plants grow, irrigation activates — alongside the Python code and circuit.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to simulate a Raspberry Pi circuit in your browser",
      description: "Use PiForge to build and run a Raspberry Pi circuit without any hardware in under 60 seconds.",
      totalTime: "PT1M",
      step: [
        { "@type": "HowToStep", name: "Choose a board", text: "Select Raspberry Pi 4, Pi 5, Pi Zero 2 W, Arduino Uno, or Pi Pico W from the board picker in the top bar." },
        { "@type": "HowToStep", name: "Add components", text: "Drag LEDs, sensors, motors, and other components from the left sidebar onto the canvas. Drop a breadboard if needed." },
        { "@type": "HowToStep", name: "Wire the circuit", text: "Shift-click any GPIO pin on the board to start a wire. Click a component pin to complete the connection. Wires auto-color by type." },
        { "@type": "HowToStep", name: "Write and run code", text: "Open the Code Editor tab, choose Python, MicroPython, or C++, and write your program. Click Run (▶) to execute it and watch the circuit respond live." },
      ],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Google tag (gtag.js) — inline in <head> so Google's crawler detects it */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-0V3030J9PS" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-0V3030J9PS');
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
