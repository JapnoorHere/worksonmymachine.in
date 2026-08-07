import type { Metadata } from "next";
import { SignupFlow } from "@/components/signup/SignupFlow";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Six steps. Every one of your answers will be questioned. At least one will be rejected on principle.",
};

export default function SignupPage() {
  return <SignupFlow />;
}
