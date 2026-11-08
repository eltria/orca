import type { PersistedState } from '../../../shared/persisted-state-types'
import type { Automation } from '../../../shared/automations/automation-definition'
import { automationWithLaunchSetup } from '../../../shared/automations/launch/automation-launch-setup'
import { normalizeAutomationSessionReuse } from './automation-context-migration'

export function listAutomations(state: PersistedState): Automation[] {
  return (state.automations ?? [])
    .map((automation) => automationWithLaunchSetup(normalizeAutomationSessionReuse(automation)))
    .sort((left, right) => left.name.localeCompare(right.name))
}
