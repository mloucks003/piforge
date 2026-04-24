import type { Metadata } from "next";
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
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any (browser-based)",
      browserRequirements: "Requires JavaScript",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Raspberry Pi 4, 5, Zero 2W GPIO simulation",
        "Arduino Uno C++ simulation",
        "Pi Pico W MicroPython simulation",
        "Real Python execution via Pyodide",
        "Drag-and-drop circuit builder",
        "Smart Home and Office floor plan projects",
        "AI-powered code assistant",
        "11 guided interactive tutorials",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` }, "query-input": "required name=search_term_string" },
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
