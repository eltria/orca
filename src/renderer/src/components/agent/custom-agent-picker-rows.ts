import { parseExecutionHostId } from '../../../../shared/execution-host'
import type { NewTabAgentMenuRow } from '../../../../shared/agent-launch/picker/agent-launch-picker-rows'
import type { AgentPickerEntry } from '../../../../shared/agent-launch/picker/agent-launch-picker'
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

/** A picker's custom agents, each with the entry of its base agent: only where that agent opens a
 *  terminal, and not on a paired Orca server, which resolves custom agents from its own settings. */
export function pickerCustomAgents(
  customAgents: readonly CustomTuiAgent[] | undefined,
  entries: readonly AgentPickerEntry[],
  query = ''
): { custom: CustomTuiAgent; entry: AgentPickerEntry }[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return (customAgents ?? []).flatMap((custom) => {
    const entry = entries.find(
      (candidate) =>
        candidate.agent === custom.agent &&
        candidate.surfaces.includes('terminal') &&
        parseExecutionHostId(candidate.rows[0]?.executionHostId)?.kind !== 'runtime'
    )
    const text = `${custom.name} ${custom.command} ${entry?.label ?? ''}`.toLowerCase()
    return entry && words.every((word) => text.includes(word)) ? [{ custom, entry }] : []
  })
}
