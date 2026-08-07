"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { readLS, writeLS } from "@/lib/storage";

/**
 * UI sound, synthesized with WebAudio rather than shipped as files.
 *
 * Two reasons: zero network cost for something purely decorative, and the
 * envelopes stay tweakable in code, which matters because comedic timing is the
 * point. Everything is short, quiet, and off until the user turns it on —
 * autoplaying audio at a stranger is a hostile act even on a joke site.
 */

export type SoundName =
  | "click"
  | "tick"
  | "success"
  | "error"
  | "whoosh"
  | "pop"
  | "thud"
  | "chime";

interface SoundCtx {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  play: (name: SoundName) => void;
  ready: boolean;
}

const Ctx = createContext<SoundCtx>({
  enabled: false,
  setEnabled: () => {},
  play: () => {},
  ready: false,
});

export const useSound = () => useContext(Ctx);

type Voice = {
  type: OscillatorType;
  freq: number;
  to?: number;
  dur: number;
  gain: number;
  delay?: number;
};

const VOICES: Record<SoundName, Voice[]> = {
  click: [{ type: "square", freq: 880, to: 660, dur: 0.035, gain: 0.05 }],
  tick: [{ type: "square", freq: 1500, dur: 0.018, gain: 0.028 }],
  pop: [{ type: "sine", freq: 420, to: 900, dur: 0.09, gain: 0.07 }],
  whoosh: [{ type: "sawtooth", freq: 200, to: 60, dur: 0.22, gain: 0.035 }],
  thud: [{ type: "sine", freq: 150, to: 48, dur: 0.18, gain: 0.11 }],
  error: [
    { type: "square", freq: 320, dur: 0.07, gain: 0.06 },
    { type: "square", freq: 220, dur: 0.11, gain: 0.06, delay: 0.08 },
  ],
  success: [
    { type: "triangle", freq: 523.25, dur: 0.1, gain: 0.06 },
    { type: "triangle", freq: 659.25, dur: 0.1, gain: 0.06, delay: 0.08 },
    { type: "triangle", freq: 783.99, dur: 0.22, gain: 0.06, delay: 0.16 },
  ],
  chime: [
    { type: "sine", freq: 1046.5, dur: 0.3, gain: 0.05 },
    { type: "sine", freq: 1567.98, dur: 0.42, gain: 0.032, delay: 0.05 },
  ],
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [ready, setReady] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setEnabledState(readLS<boolean>("sound", false));
    setReady(true);
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    writeLS("sound", v);
    if (v && !ctxRef.current) {
      try {
        ctxRef.current = new AudioContext();
      } catch {
        /* No WebAudio. The site is equally funny in silence. */
      }
    }
    // Unlock on the same user gesture that enabled it.
    ctxRef.current?.resume().catch(() => {});
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled) return;
      let ac = ctxRef.current;
      if (!ac) {
        try {
          ac = ctxRef.current = new AudioContext();
        } catch {
          return;
        }
      }
      if (ac.state === "suspended") ac.resume().catch(() => {});

      const now = ac.currentTime;
      for (const v of VOICES[name]) {
        const start = now + (v.delay ?? 0);
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = v.type;
        osc.frequency.setValueAtTime(v.freq, start);
        if (v.to !== undefined) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(v.to, 1), start + v.dur);
        }
        // Tiny attack avoids the click that a hard gain step produces.
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(v.gain, start + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + v.dur);
        osc.connect(gain).connect(ac.destination);
        osc.start(start);
        osc.stop(start + v.dur + 0.02);
      }
    },
    [enabled],
  );

  return <Ctx.Provider value={{ enabled, setEnabled, play, ready }}>{children}</Ctx.Provider>;
}
