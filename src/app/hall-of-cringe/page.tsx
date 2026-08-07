import type { Metadata } from "next";
import { HallOfCringe } from "@/components/hall/HallOfCringe";

export const metadata: Metadata = {
  title: "Hall of Cringe",
  description:
    "Everyone who has made this site measurably worse, ranked by how much worse.",
};

export default function HallPage() {
  return <HallOfCringe />;
}
