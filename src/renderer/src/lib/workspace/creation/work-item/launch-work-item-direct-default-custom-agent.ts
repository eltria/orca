import {
  defaultCustomTuiAgentFor,
  type CustomTuiAgentSettings
} from '../../../../../../shared/agent-launch/catalog/custom-tui-agents'
import type {
  DirectWorkItemLaunchInputs,
  LaunchWorkItemDirectArgs
} from './launch-work-item-direct-types'

/** A picked custom agent, or with no picked agent the default custom agent, starts in a terminal. */
export function withCustomAgentInputs(
  args: LaunchWorkItemDirectArgs,
  settings: CustomTuiAgentSettings | null | undefined
): LaunchWorkItemDirectArgs {
  const pickedId = args.agentOverride ? args.customAgentId : undefined
  if (!pickedId && (args.agentOverride || !settings?.defaultCustomTuiAgentId)) {
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
      const customAgentId = pickedId
        ? agent === args.agentOverride
          ? pickedId
          : undefined
        : defaultCustomTuiAgentFor(settings, agent)?.id
      return customAgentId ? { ...inputs, customAgentId, requestedSurface: 'terminal' } : inputs
    }
  }
}
