import type { NewTabAgentMenuRow } from '../../../../shared/agent-launch/picker/agent-launch-picker-rows'
import type { TuiAgent } from '../../../../shared/agent-launch/catalog/tui-agent'
import type { CustomTuiAgent } from '../../../../shared/agent-launch/catalog/custom-tui-agents'

/** The menu row that launches a custom agent: its base agent in a terminal, with its own command. */
export function customAgentMenuRow(
  custom: CustomTuiAgent,
  rows: readonly NewTabAgentMenuRow[]
): NewTabAgentMenuRow {
  const executionHostId = rows.find((row) => row.agent === custom.agent)?.executionHostId
  return {
    kind: 'cli',
    agent: custom.agent,
    custom,
    ...(executionHostId ? { executionHostId } : {})
  }
}

/** Custom agents whose base agent this workspace's host can run (all of them while detection is pending). */
export function launchableCustomAgents(
  customAgents: readonly CustomTuiAgent[] | undefined,
  detectedIds: readonly TuiAgent[] | null
): CustomTuiAgent[] {
  return (customAgents ?? []).filter(
    (custom) => detectedIds === null || detectedIds.includes(custom.agent)
  )
}
