import { About } from "@/components/landing/about";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Tldr } from "@/components/landing/tldr";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Tldr />
      </main>
    </>
  );
}
