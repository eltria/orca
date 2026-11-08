import { useMemo } from 'react'
import {
  defaultCustomTuiAgentFor,
  type CustomTuiAgentSettings
} from '../../../../shared/agent-launch/catalog/custom-tui-agents'
import {
  customAgentPickerDraft,
  type AgentPickerDraft
} from '../../../../shared/agent-launch/picker/agent-launch-picker'
import type { TuiAgent } from '../../../../shared/agent-launch/catalog/tui-agent'

/** Unpicked, the default agent starts as the default custom agent, as every default launch does. */
export function useDefaultCustomAgentDraft(
  settings: CustomTuiAgentSettings | null | undefined,
  agent: TuiAgent | null,
  pickedAgent: TuiAgent | null | undefined
): AgentPickerDraft | undefined {
  const custom = pickedAgent === undefined ? defaultCustomTuiAgentFor(settings, agent) : null
  return useMemo(() => (custom ? customAgentPickerDraft(custom) : undefined), [custom])
}
