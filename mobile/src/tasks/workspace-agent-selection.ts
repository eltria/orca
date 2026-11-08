import type { TuiAgent } from '../../../src/shared/agent-launch/catalog/tui-agent'
import {
  readDefaultCustomTuiAgent,
  type CustomTuiAgent
} from '../../../src/shared/agent-launch/catalog/custom-tui-agents'
import { translate } from '../i18n/mobile-i18n'
import {
  filterEnabledMobileTuiAgents,
  isMobileTuiAgentEnabled,
  pickMobileTuiAgent
} from './mobile-tui-agents'
import { isTuiAgent as isMobileTuiAgent } from '../../../src/shared/agent-launch/catalog/tui-agent-config'
import { TUI_AGENT_AUTO_PICK_ORDER as MOBILE_TUI_AGENT_AUTO_PICK_ORDER } from '../../../src/shared/agent-launch/catalog/tui-agent-selection'
import { TUI_AGENT_DISPLAY_NAMES as MOBILE_TUI_AGENT_LABELS } from '../../../src/shared/agent-launch/catalog/tui-agent-display-names'

/** A custom agent of the host, named with its base agent so a choice alone tells what it starts. */
export type CustomWorkspaceAgentChoice = `custom-agent:${TuiAgent}:${string}`

export type WorkspaceAgentChoice = TuiAgent | 'blank' | CustomWorkspaceAgentChoice

const CUSTOM_CHOICE = /^custom-agent:([^:]+):(.+)$/

export function customWorkspaceAgentChoice(
  agent: TuiAgent,
  customAgentId: string
): CustomWorkspaceAgentChoice {
  return `custom-agent:${agent}:${customAgentId}`
}

/** The base agent and custom agent a choice names; null for a built-in agent or Blank. */
export function parseCustomWorkspaceAgentChoice(
  choice: unknown
): { agent: TuiAgent; customAgentId: string } | null {
  const match = typeof choice === 'string' ? CUSTOM_CHOICE.exec(choice) : null
  return match && isMobileTuiAgent(match[1]) ? { agent: match[1], customAgentId: match[2]! } : null
}

/** The agent a choice starts: its own, or a custom agent's base; null for Blank. */
export function workspaceChoiceAgent(choice: WorkspaceAgentChoice): TuiAgent | null {
  return isMobileTuiAgent(choice)
    ? choice
    : (parseCustomWorkspaceAgentChoice(choice)?.agent ?? null)
}

type WorkspaceAgentSettings = {
  defaultTuiAgent?: TuiAgent | 'blank' | null
  disabledTuiAgents?: unknown
  customTuiAgents?: unknown
  defaultCustomTuiAgentId?: unknown
}

export type WorkspaceAgentSelectionState = {
  agent: WorkspaceAgentChoice | null
  overridden: boolean
}

type ResolveWorkspaceAgentSelectionArgs = WorkspaceAgentSelectionState & {
  selectionActive: boolean
  settings: WorkspaceAgentSettings
  detectedAgentIds: Set<string> | null
}

export function workspaceAgentLabel(
  agent: WorkspaceAgentChoice,
  customAgents: readonly CustomTuiAgent[] = []
): string {
  if (agent === 'blank') {
    return translate('tasks.workspaceAgentSelection.blankTerminal', 'Blank Terminal')
  }
  const custom = parseCustomWorkspaceAgentChoice(agent)
  if (custom) {
    return (
      customAgents.find((entry) => entry.id === custom.customAgentId)?.name ??
      MOBILE_TUI_AGENT_LABELS[custom.agent]
    )
  }
  return isMobileTuiAgent(agent) ? MOBILE_TUI_AGENT_LABELS[agent] : agent
}

export function normalizeWorkspaceAgent(value: unknown): WorkspaceAgentChoice | null {
  if (value === 'blank' || value === '__blank__') {
    return 'blank'
  }
  const custom = parseCustomWorkspaceAgentChoice(value)
  if (custom) {
    return customWorkspaceAgentChoice(custom.agent, custom.customAgentId)
  }
  return isMobileTuiAgent(value) ? value : null
}

/** The default choice: the host's default custom agent when it backs the picked agent. */
export function pickWorkspaceAgent(
  settings: WorkspaceAgentSettings,
  detectedAgentIds: Set<string> | null
): WorkspaceAgentChoice {
  const picked = pickBuiltInWorkspaceAgent(settings, detectedAgentIds)
  const custom = picked === 'blank' ? null : readDefaultCustomTuiAgent(settings, picked)
  return custom ? customWorkspaceAgentChoice(custom.agent, custom.id) : picked
}

function pickBuiltInWorkspaceAgent(
  settings: WorkspaceAgentSettings,
  detectedAgentIds: Set<string> | null
): TuiAgent | 'blank' {
  const normalized = normalizeWorkspaceAgent(settings.defaultTuiAgent)
  const preferred =
    normalized === null || normalized === 'blank' ? normalized : workspaceChoiceAgent(normalized)
  if (preferred === 'blank') {
    return preferred
  }
  const disabled = settings.disabledTuiAgents
  const enabledAutoPickOrder = filterEnabledMobileTuiAgents(
    MOBILE_TUI_AGENT_AUTO_PICK_ORDER,
    disabled
  )
  if (detectedAgentIds === null) {
    return preferred && isMobileTuiAgentEnabled(preferred, disabled)
      ? preferred
      : (enabledAutoPickOrder[0] ?? 'blank')
  }
  const detectedAgents = enabledAutoPickOrder.filter((agent) => detectedAgentIds.has(agent))
  return pickMobileTuiAgent(preferred, detectedAgents, disabled) ?? 'blank'
}

export function filterWorkspaceAgents(agents: readonly TuiAgent[], disabled?: unknown): TuiAgent[] {
  return filterEnabledMobileTuiAgents(agents, disabled)
}

export function isWorkspaceAgentEnabled(agent: TuiAgent, disabled?: unknown): boolean {
  return isMobileTuiAgentEnabled(agent, disabled)
}

/** Whether a choice's agent (a custom agent's base) is enabled and, once known, detected here. */
export function isWorkspaceChoiceAvailable(
  choice: WorkspaceAgentChoice,
  disabled: unknown,
  detectedAgentIds: Set<string> | null
): boolean {
  const agent = workspaceChoiceAgent(choice)
  return (
    agent !== null &&
    isMobileTuiAgentEnabled(agent, disabled) &&
    (detectedAgentIds === null || detectedAgentIds.has(agent))
  )
}

export function resolveWorkspaceAgentSelection({
  selectionActive,
  settings,
  detectedAgentIds,
  agent,
  overridden
}: ResolveWorkspaceAgentSelectionArgs): WorkspaceAgentSelectionState {
  const current = { agent, overridden }
  if (!selectionActive) {
    return current
  }

  const pickedAgent = pickWorkspaceAgent(settings, detectedAgentIds)
  if (!overridden) {
    return agent === pickedAgent ? current : { agent: pickedAgent, overridden: false }
  }

  if (
    detectedAgentIds === null ||
    !agent ||
    agent === 'blank' ||
    isWorkspaceChoiceAvailable(agent, settings.disabledTuiAgents, detectedAgentIds)
  ) {
    return current
  }

  return { agent: pickedAgent, overridden: false }
}
