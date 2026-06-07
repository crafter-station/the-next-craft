import { About } from "@/components/landing/about";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { Sponsors } from "@/components/landing/sponsors";
import { Tldr } from "@/components/landing/tldr";
import { Tracks } from "@/components/landing/tracks";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Tldr />
        <Tracks />
        <Schedule />
        <Prizes />
        <Sponsors />
      </main>
    </>
  );
}
