import type { TuiAgent } from '../../../../src/shared/agent-launch/catalog/tui-agent'
import { filterEnabledMobileTuiAgents } from '../../tasks/mobile-tui-agents'
import { isTuiAgent as isMobileTuiAgent } from '../../../../src/shared/agent-launch/catalog/tui-agent-config'
import { TUI_AGENT_AUTO_PICK_ORDER as MOBILE_TUI_AGENT_AUTO_PICK_ORDER } from '../../../../src/shared/agent-launch/catalog/tui-agent-selection'
import { TUI_AGENT_DISPLAY_NAMES as MOBILE_TUI_AGENT_LABELS } from '../../../../src/shared/agent-launch/catalog/tui-agent-display-names'
import {
  normalizeCustomTuiAgents,
  offerableCustomTuiAgents,
  readDefaultCustomTuiAgent
} from '../../../../src/shared/agent-launch/catalog/custom-tui-agents'

export type MobileNewTabAgentSettings = {
  defaultTuiAgent?: TuiAgent | 'blank' | null
  disabledTuiAgents?: unknown
  customTuiAgents?: unknown
  defaultCustomTuiAgentId?: unknown
}

export type MobileNewTabAgentOption = {
  agent: TuiAgent
  label: string
  /** A custom agent of the host's settings; the host starts its command in a terminal. */
  customAgentId?: string
}

export function orderMobileNewTabAgents(
  defaultAgent: TuiAgent | 'blank' | null | undefined,
  detectedAgents: Iterable<unknown>,
  disabledAgents?: unknown
): TuiAgent[] {
  const detected = new Set([...detectedAgents].filter(isMobileTuiAgent))
  const enabledDetected = filterEnabledMobileTuiAgents(
    MOBILE_TUI_AGENT_AUTO_PICK_ORDER,
    disabledAgents
  ).filter((agent) => detected.has(agent))

  if (defaultAgent && defaultAgent !== 'blank' && enabledDetected.includes(defaultAgent)) {
    return [defaultAgent, ...enabledDetected.filter((agent) => agent !== defaultAgent)]
  }
  return enabledDetected
}

export function buildMobileNewTabAgentOptions(
  settings: MobileNewTabAgentSettings | null | undefined,
  detectedAgentIds: Iterable<unknown> | null,
  /** Only callers that send a picked option's `customAgentId` list custom agents. */
  { includeCustomAgents = false }: { includeCustomAgents?: boolean } = {}
): MobileNewTabAgentOption[] {
  if (!detectedAgentIds) {
    return []
  }
  const agents = orderMobileNewTabAgents(
    settings?.defaultTuiAgent,
    detectedAgentIds,
    settings?.disabledTuiAgents
  )
  const custom = includeCustomAgents
    ? // Detection does not gate custom agents; their base agent only needs to be enabled.
      offerableCustomTuiAgents(
        normalizeCustomTuiAgents(settings?.customTuiAgents),
        settings?.disabledTuiAgents
      )
    : []
  const options: MobileNewTabAgentOption[] = [
    ...agents.map((agent) => ({ agent, label: MOBILE_TUI_AGENT_LABELS[agent] })),
    ...custom.map((entry) => ({ agent: entry.agent, label: entry.name, customAgentId: entry.id }))
  ]
  // The default agent leads; when the default is a custom agent, that custom agent leads instead.
  const leading = agents[0] === settings?.defaultTuiAgent ? agents[0] : null
  const defaultCustomId = includeCustomAgents
    ? readDefaultCustomTuiAgent(settings, leading)?.id
    : undefined
  const defaultCustom = options.find((option) => option.customAgentId === defaultCustomId)
  return defaultCustom ? [defaultCustom, ...options.filter((o) => o !== defaultCustom)] : options
}
