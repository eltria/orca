import {
  defaultCustomTuiAgentFor,
  type CustomTuiAgent,
  type CustomTuiAgentSettings
} from '../../../../../../shared/agent-launch/catalog/custom-tui-agents'
import type { TuiAgent } from '../../../../../../shared/agent-launch/catalog/tui-agent'

type DefaultAgentChoice = TuiAgent | 'blank' | null

/** The default-agent setting's handlers; this computer's settings also offer its custom agents. */
export function defaultAgentSettingHandlers(
  local:
    | {
        settings: CustomTuiAgentSettings
        updateSettings: (updates: CustomTuiAgentSettings) => void | Promise<void>
      }
    | undefined,
  defaultAgent: DefaultAgentChoice,
  setDefault: (agent: DefaultAgentChoice) => void
): {
  onSetDefault: (agent: DefaultAgentChoice) => void
  customAgents?: readonly CustomTuiAgent[]
  defaultCustomAgentId?: string
  onSetDefaultCustom?: (custom: CustomTuiAgent) => void
} {
  if (!local) {
    return { onSetDefault: setDefault }
  }
  return {
    onSetDefault: (agent) => {
      setDefault(agent)
      // Choosing a built-in default (or Auto/Blank) ends a custom one; '' clears it.
      if (local.settings.defaultCustomTuiAgentId) {
        void local.updateSettings({ defaultCustomTuiAgentId: '' })
      }
    },
    customAgents: local.settings.customTuiAgents ?? [],
    defaultCustomAgentId: defaultCustomTuiAgentFor(
      local.settings,
      defaultAgent === 'blank' ? null : defaultAgent
    )?.id,
    onSetDefaultCustom: (custom) => {
      setDefault(custom.agent)
      void local.updateSettings({ defaultCustomTuiAgentId: custom.id })
    }
  }
}
