import type { AutomationDraft } from './automation-draft'
import type { AutomationRunScope } from './use-automation-runs'
import type { MobileAutomationRow, MobileAutomationRun } from './automation-reply-schema'

export type AutomationView =
  | { kind: 'list' }
  | { kind: 'detail'; row: MobileAutomationRow }
  | { kind: 'editor'; row?: MobileAutomationRow; initialDraft?: AutomationDraft }
  | { kind: 'run'; run: MobileAutomationRun; scope: AutomationRunScope }

export const ACTION_OPTIONS = { failWhenDisconnected: true }
