import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SharedSvgDefs } from "@/components/Ornaments";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kevyn Dávila · Te invito a mi cumpleaños",
  description:
    "Sábado 10 de octubre de 2026, 3:00 pm · Villa Doña Martha. Será un placer compartir este momento contigo.",
  openGraph: {
    title: "Kevyn Dávila · Te invito a mi cumpleaños",
    description: "Sábado 10.10.2026 · 3:00 pm · Villa Doña Martha",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#061525",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Las animaciones de entrada solo se activan si hay JS: sin JS todo es visible. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        <SharedSvgDefs />
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
