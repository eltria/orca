import type {
  Automation,
  AutomationCreateInput,
  AutomationUpdateInput
} from '../../../../shared/automations/automation-definition'

/** The update's custom agent, only while the agent or the custom agent itself was edited. */
export function customAgentUpdateFor(
  current: Automation | null,
  draftCustomAgentId: string | undefined,
  edited: (key: 'customAgentId' | 'agentId') => boolean
): Pick<AutomationUpdateInput, 'customAgentId'> {
  return current && (edited('customAgentId') || edited('agentId'))
    ? { customAgentId: draftCustomAgentId ?? null }
    : {}
}

/** A stored automation drops a null custom agent, so only a set one reaches the create payload. */
export function customAgentCreateField(
  draftCustomAgentId: string | undefined
): Pick<AutomationCreateInput, 'customAgentId'> {
  return draftCustomAgentId ? { customAgentId: draftCustomAgentId } : {}
}

/** The update without its custom agent, which the create payload carries from the draft instead. */
export function withoutCustomAgent<T extends { customAgentId?: string | null }>(
  updates: T
): Omit<T, 'customAgentId'> {
  const { customAgentId: _cleared, ...rest } = updates
  return rest
}
