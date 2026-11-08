import { isTuiAgent } from '../../../src/shared/agent-launch/catalog/tui-agent-config'
import type { RpcClient } from '../transport/rpc/rpc-client-contract'
import type { MobileNewTabAgentOption } from '../session/agent-launch/mobile-new-tab-agent-options'
import { useHostCustomAgents } from '../session/use-host-custom-agents'
import {
  customWorkspaceAgentChoice,
  parseCustomWorkspaceAgentChoice
} from '../tasks/workspace-agent-selection'
import type { AutomationDraft } from './automation-draft'
import { mobileTuiAgentLabel } from '../tasks/mobile-tui-agents'

/** The agents an automation can run, with the desktop's custom agents once its agents are discovered. */
export function useAutomationAgentOptions(
  client: RpcClient,
  agents: readonly MobileNewTabAgentOption[],
  offerCustomAgents = false
): { value: string; label: string }[] {
  // Discovery fails for hosts it cannot reach; reading settings then would ask the wrong computer.
  const customAgents = useHostCustomAgents(client, offerCustomAgents && agents.length > 0)
  return [
    ...agents.map((option) => ({ value: option.agent, label: option.label })),
    // Detection does not gate custom agents; the host already filtered its enabled ones.
    ...customAgents.map((custom) => ({
      value: customWorkspaceAgentChoice(custom.agent, custom.id),
      label: custom.name
    }))
  ]
}

/** The draft's agent choice among `options`; a saved agent missing from them is offered as saved. */
export function automationAgentChoice(
  options: { value: string; label: string }[],
  draft: Pick<AutomationDraft, 'agentId' | 'customAgentId'>,
  savedLabel: (agent: string) => string
): { options: { value: string; label: string }[]; value: string; label?: string } {
  const value = automationAgentValue(draft)
  const offered = options.find((option) => option.value === value)
  if (offered || !draft.agentId) {
    return { options, value, label: offered?.label }
  }
  const label = savedLabel(draft.customAgentId ?? mobileTuiAgentLabel(draft.agentId))
  return { options: [{ value, label }, ...options], value, label }
}

/** The picker value of a draft's agent; a custom agent is its own choice. */
export function automationAgentValue(
  draft: Pick<AutomationDraft, 'agentId' | 'customAgentId'>
): string {
  return isTuiAgent(draft.agentId) && draft.customAgentId
    ? customWorkspaceAgentChoice(draft.agentId, draft.customAgentId)
    : (draft.agentId ?? '')
}

/** The draft fields a picked value sets; a custom agent sets its base agent too. */
export function automationAgentPatch(value: string): Partial<AutomationDraft> {
  const custom = parseCustomWorkspaceAgentChoice(value)
  return custom
    ? { agentId: custom.agent, customAgentId: custom.customAgentId }
    : { agentId: value, customAgentId: undefined }
}

/** The editor's agent picker state: the draft's choice plus a saved agent the host no longer lists. */
export function useAutomationAgentChoice(
  client: RpcClient,
  agents: readonly MobileNewTabAgentOption[],
  offerCustomAgents: boolean | undefined,
  draft: Pick<AutomationDraft, 'agentId' | 'customAgentId'>,
  savedLabel: (agent: string) => string
): { options: { value: string; label: string }[]; value: string; label?: string } {
  return automationAgentChoice(
    useAutomationAgentOptions(client, agents, offerCustomAgents),
    draft,
    savedLabel
  )
}
