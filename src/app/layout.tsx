import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SharedSvgDefs } from "@/components/Ornaments";
import "./globals.css";

/*
 * Fuentes servidas desde el repositorio (src/app/fonts, licencia OFL).
 * Son los mismos archivos variables (subset latin) que entregaba Google Fonts.
 * Con next/font/google, cada build descarga las fuentes de fonts.gstatic.com y, si esa
 * descarga falla, Turbopack aborta con "Can't resolve '@vercel/turbopack-next/internal/font/google/font'".
 */
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-var.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-italic-var.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const manrope = localFont({
  src: "./fonts/manrope-latin-var.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-manrope",
  display: "swap",
  adjustFontFallback: "Arial",
});

const SITE_URL = "https://kevyndavila.com";
const TITLE = "Kevyn Dávila · Te invito a mi cumpleaños";
const SHARE_DESCRIPTION =
  "Celebremos juntos el cumpleaños de Kevyn Dávila. Revisa todos los detalles de la celebración y confirma tu asistencia.";

/*
 * La imagen para compartir (og:image / twitter:image, con dimensiones, tipo y alt) la
 * genera Next.js a partir de src/app/opengraph-image.jpg y src/app/twitter-image.jpg
 * (ver scripts/og_image.py). metadataBase convierte esas rutas en URLs absolutas.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description:
    "Sábado 10 de octubre de 2026, 3:00 pm · Villa Doña Martha. Será un placer compartir este momento contigo.",
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: SHARE_DESCRIPTION,
    url: "/",
    siteName: "Kevyn Dávila",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SHARE_DESCRIPTION,
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
