import type {
  Automation,
  AutomationCreateInput,
  AutomationUpdateInput
} from '../../../../shared/automations/automation-definition'
import { automationCopyLaunchSetup } from './automation-launch-surface'
import { customAgentCreateField, withoutCustomAgent } from './automation-custom-agent-payload'

type CreateInputSources = {
  launchSetup: Pick<AutomationUpdateInput, 'launchSetupPatch' | 'extraAgentArgs'>
  precheck: AutomationCreateInput['precheck']
  runContext: AutomationCreateInput['runContext']
  setupDecision: AutomationCreateInput['setupDecision']
  setupTrustHash: AutomationCreateInput['setupTrustHash']
  timezone: string
  rrule: string
  dtstart: number
  missedRunGraceMinutes: number
}

/** The create payload for a new automation or a copy, carrying the draft's custom agent. */
export function automationCreateInputFor(
  current: Automation | null,
  updates: AutomationUpdateInput,
  draft: {
    name: string
    prompt: string
    agentId: AutomationCreateInput['agentId']
    customAgentId?: string
    projectId: string
    workspaceMode: AutomationCreateInput['workspaceMode']
    workspaceId?: string | null
    baseBranch: string
    reuseSession: boolean
  },
  sources: CreateInputSources
): AutomationCreateInput {
  const keep = <T>(chosen: (current: Automation) => T, fallback: T): T =>
    current ? chosen(current) : fallback
  return automationCopyLaunchSetup(current, updates, {
    name: keep((a) => a.name, draft.name),
    prompt: keep((a) => a.prompt, draft.prompt),
    precheck: keep((a) => a.precheck, sources.precheck),
    agentId: keep((a) => a.agentId, draft.agentId),
    ...customAgentCreateField(draft.customAgentId),
    ...sources.launchSetup,
    runContext: keep((a) => a.runContext, sources.runContext),
    projectId: keep((a) => a.projectId, draft.projectId),
    workspaceMode: keep((a) => a.workspaceMode, draft.workspaceMode),
    workspaceId: keep((a) => a.workspaceId, draft.workspaceId),
    baseBranch: keep((a) => a.baseBranch, draft.baseBranch.trim() || null),
    setupDecision: keep((a) => a.setupDecision, sources.setupDecision),
    setupTrustHash: keep((a) => a.setupTrustHash, sources.setupTrustHash),
    reuseSession: keep(
      (a) => a.reuseSession,
      draft.workspaceMode === 'existing' && draft.reuseSession
    ),
    timezone: sources.timezone,
    rrule: keep((a) => a.rrule, sources.rrule),
    dtstart: keep((a) => a.dtstart, sources.dtstart),
    missedRunGraceMinutes: keep((a) => a.missedRunGraceMinutes, sources.missedRunGraceMinutes),
    ...withoutCustomAgent(updates)
  })
}
