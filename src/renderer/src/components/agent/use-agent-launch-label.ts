import { getAgentLabel } from '@/lib/agent-catalog'
import { useAppStore } from '@/store'
import type { TuiAgent } from '../../../../shared/agent-launch/catalog/tui-agent'

/** The name of the custom agent a launch names, while it is still set up for `agent`. */
export function useCustomAgentName(agent?: TuiAgent, customAgentId?: string): string | undefined {
  return useAppStore((state) =>
    agent && customAgentId
      ? state.settings?.customTuiAgents?.find(
          (custom) => custom.id === customAgentId && custom.agent === agent
        )?.name
      : undefined
  )
}

/** The name a launch shows: its custom agent's, else the agent's own. */
export function useAgentLaunchLabel(agent: TuiAgent, customAgentId?: string): string {
  return useCustomAgentName(agent, customAgentId) ?? getAgentLabel(agent)
}
