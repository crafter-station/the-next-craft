import { About } from "@/components/landing/about";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Schedule } from "@/components/landing/schedule";
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
      </main>
    </>
  );
}
