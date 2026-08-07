"use client";

import { useEffect, useState } from "react";
import { deal, dealMany } from "./bag";

/**
 * Hydration-safe access to the shuffle bag.
 *
 * Dealing during render would break SSR — the server and the client would draw
 * different cards and React would scream. So the first render always uses a
 * deterministic slice (identical on both sides), and the real deal happens in
 * an effect after hydration. The swap is invisible because it lands in the same
 * frame budget as the entrance animation.
 */

/** `count` non-repeating items from `pool`, reshuffled on each mount. */
export function useDealtMany<T>(key: string, pool: readonly T[], count: number): T[] {
  const [items, setItems] = useState<T[]>(() => pool.slice(0, count));

  useEffect(() => {
    setItems(dealMany(key, pool, count));
  }, [key, pool, count]);

  return items;
}

/** A single non-repeating item from `pool`, redrawn on each mount. */
export function useDealtOne<T>(key: string, pool: readonly T[]): T {
  const [item, setItem] = useState<T>(() => pool[0]);

  useEffect(() => {
    setItem(deal(key, pool));
  }, [key, pool]);

  return item;
}

/**
 * A value that redraws every time `token` changes — for things that should
 * produce a fresh line on each interaction (hovering a card, opening a panel)
 * rather than once per mount.
 */
export function useDealtOnChange<T>(key: string, pool: readonly T[], token: unknown): T {
  const [item, setItem] = useState<T>(() => pool[0]);

  useEffect(() => {
    setItem(deal(key, pool));
  }, [key, pool, token]);

  return item;
}
