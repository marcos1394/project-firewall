import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"; // Asegúrate de tener tu utilidad cn (de shadcn)

// 1. Tipografía: Inter para lectura (UI), JetBrains Mono para datos/código (Tech feeling)
const fontSans = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
});

const fontMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: "swap",
});

// 2. Viewport optimizado para móviles
export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// 3. SEO y Metadatos de Nivel Corporativo
export const metadata: Metadata = {
  metadataBase: new URL("https://security.kinetis.org"),
  title: {
    default: "Kinetis Security | Entrenamiento de Ciberseguridad con IA",
    template: "%s | Kinetis Security",
  },
  description: "Protege a tu empresa del Ransomware y la Ingeniería Social. Plataforma SaaS que simula ataques de phishing y entrena a tus empleados automáticamente.",
  keywords: ["ciberseguridad", "phishing", "ransomware", "entrenamiento empleados", "ISO 27001", "AI security", "SaaS"],
  authors: [{ name: "Kinetis Organization", url: "https://kinetis.org" }],
  creator: "Kinetis Venture Studio",
  publisher: "Kinetis Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX", // Enfoque inicial Latam
    url: "https://security.kinetis.org",
    title: "Kinetis Security | Defensa Activa con IA",
    description: "Tu equipo es tu mayor vulnerabilidad. Entrénalos antes de que sean hackeados.",
    siteName: "Kinetis Security",
    // images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Kinetis Security Dashboard' }], // (Pendiente: crear imagen)
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinetis Security",
    description: "Entrenamiento de seguridad automatizado para empresas modernas.",
    creator: "@kinetis_org", // (Pendiente: crear Twitter)
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-[#0B0F19] font-sans antialiased text-slate-50 selection:bg-indigo-500/30",
          fontSans.variable,
          fontMono.variable
        )}
      >
        {/* Aquí podrías poner <Providers> si usaras Contexto global */}
        {children}
        {/* Aquí iría Vercel Analytics <Analytics /> */}
      </body>
    </html>
  );
}