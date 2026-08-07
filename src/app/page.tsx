import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { DailyBoard } from "@/components/landing/DailyBoard";
import { ScrollSentinel } from "@/components/gags/ScrollSentinel";
import { Container, Eyebrow } from "@/components/ui/Primitives";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="status" className="scroll-mt-24 py-8">
        <Container>
          <div className="mb-8 max-w-2xl">
            <Eyebrow>Today only</Eyebrow>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">
              This board changes every day.
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">
              Same for everyone, different tomorrow. Seeded from the date, so
              there&apos;s nothing to remember and nothing to save — come back and
              it will simply be something else.
            </p>
          </div>
          <DailyBoard />
        </Container>
      </section>

      <Features />
      <Pricing />
      <Testimonials />

      <Container>
        <ScrollSentinel />
      </Container>
    </>
  );
}
