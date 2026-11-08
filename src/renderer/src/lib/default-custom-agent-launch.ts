import { useAppStore } from '@/store'
import { defaultCustomTuiAgentFor } from '../../../shared/agent-launch/catalog/custom-tui-agents'
import type { TuiAgent } from '../../../shared/agent-launch/catalog/tui-agent'

/** Launch fields for starting the default agent: its custom agent when the default is one. */
export function defaultCustomAgentLaunch(agent: TuiAgent | null): { customAgentId?: string } {
  const custom = defaultCustomTuiAgentFor(useAppStore.getState().settings, agent)
  return custom ? { customAgentId: custom.id } : {}
}
