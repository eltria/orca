/** Substituted by electron.vite.config.ts in fork builds; absent in tests and other bundlers. */
declare const ORCA_FORK_CUSTOM_TUI_AGENTS: unknown

/** The custom agents a fork build starts with, until the person saves their own list. */
export const FORK_CUSTOM_TUI_AGENT_SEED: unknown =
  // oxlint-disable-next-line unicorn/no-typeof-undefined -- undeclared outside electron-vite builds; a bare read throws.
  typeof ORCA_FORK_CUSTOM_TUI_AGENTS !== 'undefined' ? ORCA_FORK_CUSTOM_TUI_AGENTS : undefined
