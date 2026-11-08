import type { TuiAgent } from '../../agent-launch/catalog/tui-agent'

export type TerminalQuickCommandScope =
  | {
      type: 'global'
    }
  | {
      type: 'repo'
      repoId: string
    }

export type TerminalQuickCommandAction = 'terminal-command' | 'agent-prompt'

export type TerminalQuickCommandBase = {
  id: string
  label: string
  scope?: TerminalQuickCommandScope
}

export type TerminalCommandQuickCommand = TerminalQuickCommandBase & {
  action?: 'terminal-command'
  command: string
  appendEnter: boolean
}

export type TerminalAgentQuickCommand = TerminalQuickCommandBase & {
  action: 'agent-prompt'
  agent: TuiAgent
  prompt: string
  /** A custom agent of the running host's settings for `agent`; it starts its command in a terminal. */
  customAgentId?: string
}

export type TerminalQuickCommand = TerminalCommandQuickCommand | TerminalAgentQuickCommand
