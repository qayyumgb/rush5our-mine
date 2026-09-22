/**
 * INTRO GATE — the handoff between the preloader and the hero.
 *
 * The preloader and the hero are separate components, but the hero's first
 * frame has to land while the loader is still wiping away, otherwise the page
 * reads as two disconnected events. This tiny gate lets the preloader say
 * "start now" without either component importing the other.
 *
 * If the preloader is disabled, absent, or reduced motion is on, the gate is
 * opened immediately so the hero never waits on something that will not come.
 */

type Resolver = () => void;

let resolvers: Resolver[] = [];
let opened = false;

/** Resolves as soon as the hero is cleared to start its entrance. */
export function whenIntroReady(): Promise<void> {
  if (opened) return Promise.resolve();
  return new Promise<void>((resolve) => {
    resolvers.push(resolve);
  });
}

/** Called by the preloader at the moment its wipe begins. */
export function openIntroGate() {
  if (opened) return;
  opened = true;
  resolvers.forEach((r) => r());
  resolvers = [];
}

/**
 * Resets the gate. Only needed for client-side remounts (fast refresh,
 * route changes back to the homepage) so a second visit still animates.
 */
export function resetIntroGate() {
  opened = false;
  resolvers = [];
}
