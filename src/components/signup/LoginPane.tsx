"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { StepShell } from "./StepShell";

interface LoginError {
  field: "email" | "password" | "general";
  message: string;
}

/**
 * The real half of the same page. Lives inside `/signup` behind the mode
 * toggle rather than its own route — same posture as `/admin`: deliberately
 * plain, not part of the joke. Real errors only.
 */
export function LoginPane() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok: boolean; field?: string; error?: string };
      if (!data.ok) {
        setError({
          field: (data.field as LoginError["field"]) ?? "general",
          message: data.error ?? "Something went wrong.",
        });
        return;
      }
      router.push("/dashboard");
    } catch {
      setError({ field: "general", message: "Couldn't reach the server. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <StepShell
      eyebrow="Log in"
      title="Welcome back."
      subtitle="Your actual account. Nothing on this screen is a bit."
      footer={
        <Button
          type="submit"
          form="login-form"
          size="lg"
          className="w-full"
          loading={busy}
          disabled={busy}
        >
          Log in
        </Button>
      }
    >
      <form id="login-form" onSubmit={submit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          tone={error?.field === "email" ? "error" : "idle"}
          message={error?.field === "email" ? error.message : null}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          tone={error?.field === "password" ? "error" : "idle"}
          message={error?.field === "password" ? error.message : null}
        />
        {error?.field === "general" && <p className="text-[12.5px] text-ember">{error.message}</p>}
      </form>
    </StepShell>
  );
}
