import type { TuiAgent } from '../../../src/shared/agent-launch/catalog/tui-agent'
import {
  normalizeCustomTuiAgents,
  offerableCustomTuiAgents
} from '../../../src/shared/agent-launch/catalog/custom-tui-agents'
import { translate } from '../i18n/mobile-i18n'
import { MOBILE_AGENT_CATALOG } from '../tasks/mobile-agent-catalog'
import { isMobileTuiAgentEnabled } from '../tasks/mobile-tui-agents'
import {
  parseCustomWorkspaceAgentChoice,
  pickWorkspaceAgent
} from '../tasks/workspace-agent-selection'

export type NewWorktreeRuntimeSettings = {
  defaultTuiAgent?: TuiAgent | 'blank' | null
  disabledTuiAgents?: TuiAgent[]
  customTuiAgents?: unknown
  defaultCustomTuiAgentId?: unknown
}

export type NewWorktreeAgentOption = {
  id: TuiAgent | '__blank__'
  label: string
  faviconDomain?: string
  /** A custom agent of the host backed by `id`; the host starts its command in a terminal. */
  customAgentId?: string
  /** The custom agent's command, shown under its name. */
  detail?: string
}

/** Unique among the options: a custom agent shares its base agent's `id`. */
export function newWorktreeAgentOptionKey(option: NewWorktreeAgentOption): string {
  return option.customAgentId ? `custom-agent:${option.customAgentId}` : option.id
}

/** The host's custom agents whose base agent is enabled; detection does not gate them. */
export function newWorktreeCustomAgentOptions(
  settings: NewWorktreeRuntimeSettings | null
): NewWorktreeAgentOption[] {
  return offerableCustomTuiAgents(
    normalizeCustomTuiAgents(settings?.customTuiAgents),
    settings?.disabledTuiAgents
  ).map((custom) => ({
    id: custom.agent,
    label: custom.name,
    customAgentId: custom.id,
    detail: custom.command
  }))
}

export const NEW_WORKTREE_AGENT_OPTIONS: NewWorktreeAgentOption[] = MOBILE_AGENT_CATALOG

export const NEW_WORKTREE_BLANK_AGENT: NewWorktreeAgentOption = {
  id: '__blank__',
  get label() {
    return translate('components.newWorktreeAgentSelection.blankTerminal', 'Blank Terminal')
  }
}

export function newWorktreeAgentOptionFor(id: string | null | undefined): NewWorktreeAgentOption {
  if (id === 'blank' || id === '__blank__') {
    return NEW_WORKTREE_BLANK_AGENT
  }
  return NEW_WORKTREE_AGENT_OPTIONS.find((agent) => agent.id === id) ?? NEW_WORKTREE_BLANK_AGENT
}

export function pickPreferredNewWorktreeAgent(
  settings: NewWorktreeRuntimeSettings | null,
  detectedAgentIds: Set<string> | null
): NewWorktreeAgentOption {
  const choice = pickWorkspaceAgent(settings ?? {}, detectedAgentIds)
  const custom = parseCustomWorkspaceAgentChoice(choice)
  return (
    (custom &&
      newWorktreeCustomAgentOptions(settings).find(
        (option) => option.customAgentId === custom.customAgentId
      )) ||
    newWorktreeAgentOptionFor(custom ? custom.agent : choice)
  )
}

function isSelectableAgent(
  agent: NewWorktreeAgentOption,
  settings: NewWorktreeRuntimeSettings | null,
  detectedAgentIds: Set<string> | null
): boolean {
  if (agent.id === '__blank__') {
    return true
  }
  if (!isMobileTuiAgentEnabled(agent.id, settings?.disabledTuiAgents)) {
    return false
  }
  return detectedAgentIds === null || detectedAgentIds.has(agent.id)
}

export function resolveNewWorktreeAgentSelection({
  visible,
  selectedAgent,
  agentOverridden,
  runtimeSettings,
  detectedAgentIds
}: {
  visible: boolean
  selectedAgent: NewWorktreeAgentOption
  agentOverridden: boolean
  runtimeSettings: NewWorktreeRuntimeSettings | null
  detectedAgentIds: Set<string> | null
}): { selectedAgent: NewWorktreeAgentOption; agentOverridden: boolean } {
  if (!visible) {
    return { selectedAgent, agentOverridden }
  }

  const preferred = pickPreferredNewWorktreeAgent(runtimeSettings, detectedAgentIds)
  if (!agentOverridden) {
    return { selectedAgent: preferred, agentOverridden: false }
  }

  if (
    detectedAgentIds !== null &&
    !isSelectableAgent(selectedAgent, runtimeSettings, detectedAgentIds)
  ) {
    return { selectedAgent: preferred, agentOverridden: false }
  }

  return { selectedAgent, agentOverridden: true }
}
