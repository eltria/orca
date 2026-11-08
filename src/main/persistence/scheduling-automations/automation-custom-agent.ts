import type {
  Automation,
  AutomationCreateInput,
  AutomationUpdateInput
} from '../../../shared/automations/automation-definition'

/** A new automation's custom agent; its command runs in a terminal. */
export function customAgentFields(
  input: Pick<AutomationCreateInput, 'customAgentId'>
): Pick<Automation, 'customAgentId' | 'surface'> {
  return input.customAgentId ? { customAgentId: input.customAgentId, surface: 'terminal' } : {}
}

/** The update without its custom agent, which `applyCustomAgent` applies after the merge. */
export function withoutCustomAgent<T extends { customAgentId?: unknown }>(
  updates: T
): Omit<T, 'customAgentId'> {
  const { customAgentId: _customAgentId, ...rest } = updates
  return rest
}

/** null clears the custom agent; picking another agent without naming one drops it too. */
export function applyCustomAgent(
  merged: Automation,
  current: Automation,
  requested: AutomationUpdateInput['customAgentId']
): void {
  const customAgentId =
    requested !== undefined
      ? requested
      : merged.agentId === current.agentId
        ? current.customAgentId
        : undefined
  if (!customAgentId) {
    delete merged.customAgentId
    return
  }
  merged.customAgentId = customAgentId
  // A custom agent's command runs in a terminal.
  merged.surface = 'terminal'
}
