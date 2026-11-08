import {
  defaultCustomTuiAgentFor,
  type CustomTuiAgentSettings
} from '../../../../../../shared/agent-launch/catalog/custom-tui-agents'
import type {
  DirectWorkItemLaunchInputs,
  LaunchWorkItemDirectArgs
} from './launch-work-item-direct-types'

/** With no picked agent, the default agent's default custom agent starts in its place, in a terminal. */
export function withDefaultCustomAgentInputs(
  args: LaunchWorkItemDirectArgs,
  settings: CustomTuiAgentSettings | null | undefined
): LaunchWorkItemDirectArgs {
  if (args.agentOverride || !settings?.defaultCustomTuiAgentId) {
    return args
  }
  const resolveInputs = args.resolveLaunchInputs
  return {
    ...args,
    resolveLaunchInputs: (agent) => {
      // The same inputs the launch derives itself when no resolver is given.
      const inputs: DirectWorkItemLaunchInputs = resolveInputs
        ? resolveInputs(agent)
        : {
            agentArgs: args.resolveAgentArgs ? args.resolveAgentArgs(agent) : args.agentArgs,
            sessionOptions: args.resolveSessionOptions
              ? args.resolveSessionOptions(agent)
              : args.sessionOptions,
            chatSessionOptions: args.chatSessionOptions
          }
      const custom = defaultCustomTuiAgentFor(settings, agent)
      return custom ? { ...inputs, customAgentId: custom.id, requestedSurface: 'terminal' } : inputs
    }
  }
}
