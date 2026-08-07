import type { Metadata } from "next";
import Link from "next/link";
import { Container, Card, Eyebrow, Badge } from "@/components/ui/Primitives";
import { CHANGELOG } from "@/lib/content";
import { KevinAside } from "@/components/gags/KevinAside";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Everything we've shipped, and the several things we shipped twice.",
};

const TAG_TONE = {
  stable: "moss",
  hotfix: "ember",
  deprecated: "warn",
  legacy: "smoke",
} as const;

export default function ChangelogPage() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <Eyebrow>Changelog</Eyebrow>
        <h1 className="mt-3 text-[clamp(2rem,5vw,3.2rem)]">What&apos;s new, allegedly.</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
          Every release, in reverse order, with dates we&apos;ve chosen not to be precise
          about. Entries are written by the same people who caused them.
        </p>
      </div>

      <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-line sm:before:left-[9px]">
        {CHANGELOG.map((release, i) => (
          <li key={release.version} className="relative pl-8 sm:pl-10">
            <span
              className={`absolute top-6 left-0 size-[15px] rounded-full border-[3px] border-bg ${
                i === 0 ? "bg-ember" : "bg-line-strong"
              } sm:size-[19px]`}
              aria-hidden
            />
            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-[21px] font-bold tracking-tight">
                  v{release.version}
                </h2>
                <Badge tone={TAG_TONE[release.tag as keyof typeof TAG_TONE] ?? "neutral"}>
                  {release.tag}
                </Badge>
                <span className="ml-auto font-mono text-[11px] text-ink-faint">
                  {release.date}
                </span>
              </div>

              <ul className="mt-4 space-y-2.5">
                {release.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-[14px] leading-relaxed text-ink-soft"
                  >
                    <span className="mt-[9px] size-1 shrink-0 rounded-full bg-ember" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ol>

      <KevinAside surface="changelog" align="center" className="mt-10" />

      <p className="mt-3 text-center text-[13px] text-ink-faint">
        Want a line in the next release?{" "}
        <Link href="/contribute" className="text-ember underline-offset-2 hover:underline">
          Submit a joke →
        </Link>
      </p>
    </Container>
  );
}
