"use client";

/**
 * MY ACCOUNT — posting to an account route from the page's buttons.
 */

import type { AuthResponse } from "@/lib/auth/validation";

const NETWORK_ERROR = "We couldn’t reach the server. Check your connection and try again.";

/** Posts JSON to an account route and returns its answer (or a network
    failure, worded for the visitor). */
export async function postAuth(url: string, body: object): Promise<AuthResponse> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as AuthResponse;
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}
