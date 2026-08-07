import type { Metadata } from "next";
import { ContributeForm } from "@/components/contribute/ContributeForm";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Add your own joke to the site. No code required. A human reads every submission before it goes live.",
};

export default function ContributePage() {
  return <ContributeForm />;
}
