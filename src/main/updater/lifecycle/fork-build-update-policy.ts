/** Substituted by electron.vite.config.ts in every fork build; absent (updates on) in tests. */
declare const ORCA_FORK_UPDATES_OFF: boolean | undefined

/** eltria/orca fork builds never take official updates: installing one would drop the fork's patches. */
export const FORK_BUILD_UPDATES_DISABLED =
  // oxlint-disable-next-line unicorn/no-typeof-undefined -- undeclared outside electron-vite builds; a bare read throws.
  typeof ORCA_FORK_UPDATES_OFF !== 'undefined' && ORCA_FORK_UPDATES_OFF === true
