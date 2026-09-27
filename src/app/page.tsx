import { EventDetails } from "@/components/EventDetails";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { LocationCard } from "@/components/LocationCard";
import { RSVPCard } from "@/components/RSVPCard";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <a
        href="#confirmar"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-gold-400 focus:px-5 focus:py-3 focus:text-night-900"
      >
        Ir a confirmar asistencia
      </a>
      <SiteHeader />
      <main>
        <Hero />
        <Experience />
        <EventDetails />
        <LocationCard />
        <RSVPCard />
      </main>
      <Footer />
    </>
  );
}
