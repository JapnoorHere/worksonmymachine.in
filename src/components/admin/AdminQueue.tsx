"use client";

import { useCallback, useEffect, useState } from "react";
import { Container, Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { PreviewSurface } from "@/components/contribute/PreviewSurface";
import { TYPE_LABELS, TRIGGER_LABELS, type ContentType, type Trigger } from "@/lib/content";
import { LIMITS } from "@/lib/sanitize";
import { cn } from "@/lib/cn";

/**
 * The review queue. Intentionally plain — this page is not part of the bit, and
 * a reviewer deciding what a stranger's text does to the live site shouldn't
 * have to squint through a joke to do it.
 *
 * Each row renders the submission through the *same* PreviewSurface the
 * contributor saw, so what you approve is literally what ships.
 */

interface Row {
  id: string;
  type: ContentType;
  text: string;
  trigger: Trigger;
  author: string;
  status: "pending" | "approved" | "rejected";
  votes: number;
  createdAt: string;
  editedFrom: string | null;
}

type Filter = "pending" | "approved" | "rejected" | "all";
const FILTERS: Filter[] = ["pending", "approved", "rejected", "all"];

export function AdminQueue() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [filter, setFilter] = useState<Filter>("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(
    async (f: Filter) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/submissions?status=${f}`);
        if (res.status === 401) {
          setAuthed(false);
          return;
        }
        const data = (await res.json()) as { ok: boolean; submissions?: Row[] };
        setRows(data.submissions ?? []);
        setAuthed(true);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Probe the session on mount; a valid cookie skips the login screen.
  useEffect(() => {
    void load("pending");
  }, [load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setLoginError(data.error ?? "Incorrect password.");
        return;
      }
      setPassword("");
      await load(filter);
    } catch {
      setLoginError("Login request failed.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setRows([]);
  };

  const act = async (row: Row, action: "approve" | "reject") => {
    setWorking(row.id);
    const text = edits[row.id];
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, action, ...(text ? { text } : {}) }),
      });
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.id !== row.id || filter === "all"));
        setEdits((prev) => {
          const next = { ...prev };
          delete next[row.id];
          return next;
        });
        if (filter === "all") await load(filter);
      }
    } finally {
      setWorking(null);
    }
  };

  if (authed === null) {
    return (
      <Container className="py-20">
        <p className="text-center text-[13px] text-ink-faint">Checking session…</p>
      </Container>
    );
  }

  if (!authed) {
    return (
      <Container className="py-20">
        <Card className="mx-auto max-w-sm p-6">
          <h1 className="text-[20px]">Review queue</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Password required. Set <code className="font-mono text-[12px]">ADMIN_PASSWORD</code>{" "}
            in your environment.
          </p>
          <form onSubmit={login} className="mt-5 space-y-4">
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              message={loginError}
              tone={loginError ? "error" : "idle"}
            />
            <Button type="submit" className="w-full" loading={busy} disabled={!password}>
              Sign in
            </Button>
          </form>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px]">Review queue</h1>
          <p className="mt-1 text-[13px] text-ink-soft">
            Approved items are merged into the live content pool immediately.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              void load(f);
            }}
            className={cn(
              "cursor-pointer rounded-lg border px-3 py-1.5 text-[13px] capitalize transition-colors",
              filter === f
                ? "border-ink bg-ink text-bg"
                : "border-line bg-surface text-ink-soft hover:bg-surface-2",
            )}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => void load(filter)}
          className="cursor-pointer rounded-lg border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-soft hover:bg-surface-2"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-[13px] text-ink-faint">Loading…</p>
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-[14px] text-ink-soft">Nothing in “{filter}”.</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => {
            const value = edits[row.id] ?? row.text;
            const dirty = value !== row.text;
            return (
              <li key={row.id}>
                <Card className="overflow-hidden">
                  <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
                    {/* Controls */}
                    <div className="p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-ink-faint">
                        <span className="rounded bg-surface-2 px-2 py-1">
                          {TYPE_LABELS[row.type] ?? row.type}
                        </span>
                        <span className="rounded bg-surface-2 px-2 py-1">
                          {TRIGGER_LABELS[row.trigger] ?? row.trigger}
                        </span>
                        <span className="rounded bg-surface-2 px-2 py-1">
                          ▲ {row.votes}
                        </span>
                        <span
                          className={cn(
                            "rounded px-2 py-1",
                            row.status === "approved"
                              ? "bg-moss-wash text-moss"
                              : row.status === "rejected"
                                ? "bg-ember-wash text-ember"
                                : "bg-warn-wash text-warn",
                          )}
                        >
                          {row.status}
                        </span>
                        <span className="ml-auto">@{row.author}</span>
                      </div>

                      <label
                        htmlFor={`edit-${row.id}`}
                        className="mb-1.5 block text-[12.5px] font-semibold"
                      >
                        Text {dirty && <span className="text-warn">(edited)</span>}
                      </label>
                      <textarea
                        id={`edit-${row.id}`}
                        value={value}
                        rows={3}
                        maxLength={LIMITS.text.max}
                        onChange={(e) =>
                          setEdits((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                        className="w-full resize-y rounded-lg border border-line-strong bg-surface p-3 text-[14px] outline-none focus:border-ember"
                      />

                      {row.editedFrom && (
                        <p className="mt-2 text-[11.5px] text-ink-faint">
                          Originally: “{row.editedFrom}”
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => act(row, "approve")}
                          loading={working === row.id}
                        >
                          {dirty ? "Save & approve" : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => act(row, "reject")}
                          disabled={working === row.id}
                        >
                          Reject
                        </Button>
                        {dirty && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setEdits((prev) => {
                                const next = { ...prev };
                                delete next[row.id];
                                return next;
                              })
                            }
                          >
                            Undo edit
                          </Button>
                        )}
                        <span className="ml-auto self-center font-mono text-[10.5px] text-ink-faint">
                          {new Date(row.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Exactly what will ship */}
                    <div className="border-t border-line bg-bg-tint p-5 lg:border-t-0 lg:border-l">
                      <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
                        Renders as
                      </p>
                      <PreviewSurface type={row.type} text={value} author={row.author} />
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
