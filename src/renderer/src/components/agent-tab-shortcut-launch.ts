import { toast } from 'sonner'
import { launchAgentInNewTab } from '@/lib/agent-session/launch/new-tab/launch-agent-in-new-tab'
import { defaultCustomAgentLaunch } from '@/lib/default-custom-agent-launch'
import { newAgentLaunchRequestId } from '@/lib/agent-session/launch/routing/agent-launch-request-id'
import { translate } from '@/i18n/i18n'
import { selectFloatingWorkspacePanelVisible } from '@/store/workspaces/floating/floating-workspace-panel-selector'
import { useAppStore } from '../store'
import { FLOATING_TERMINAL_WORKTREE_ID } from '../../../shared/constants'
import type { TuiAgent } from '../../../shared/agent-launch/catalog/tui-agent'
import {
  captureAgentTabLaunchContext,
  type AgentTabLaunchContext
} from './agent-tab-launch-context'
import type { TerminalAgentTabShortcut } from './terminal-agent-tab-shortcut'

function launchAgentTab(
  worktreeId: string,
  agent: TuiAgent,
  { groupId, focusIntent }: AgentTabLaunchContext,
  /** The new-agent shortcut starts the default, which may be a custom agent; agent chords never do. */
  isDefault: boolean
): void {
  launchAgentInNewTab({
    requestId: newAgentLaunchRequestId(),
    focusIntent,
    agent,
    ...(isDefault ? defaultCustomAgentLaunch(agent) : {}),
    worktreeId,
    groupId,
    launchSource: 'shortcut'
  })
}

/** Launch a resolved new-agent-tab shortcut in the pane it was pressed in, waiting on detection if needed. */
export function launchAgentTabShortcut(
  worktreeId: string,
  {
    agent,
    pendingAgent,
    actionId
  }: Pick<TerminalAgentTabShortcut, 'agent' | 'pendingAgent'> & {
    actionId?: TerminalAgentTabShortcut['actionId']
  },
  isTargetCurrent: () => boolean
): void {
  const context = captureAgentTabLaunchContext(worktreeId)
  const isDefault = actionId === 'tab.newAgent'
  if (agent) {
    launchAgentTab(worktreeId, agent, context, isDefault)
    return
  }
  void pendingAgent?.then((settledAgent) => {
    // Why: a slow host probe must not open a tab in a pane (or on a host) the user has since left.
    const targetCurrent = isTargetCurrent()
    if (settledAgent && targetCurrent) {
      launchAgentTab(worktreeId, settledAgent, context, isDefault)
      return
    }
    context.focusIntent.cancel()
    if (targetCurrent) {
      toast.message(
        translate(
          'auto.components.Terminal.5b2c1a9e44',
          'No agent CLI detected — install one or pick a default agent in Settings.'
        )
      )
    }
  })
}

export function launchFloatingWorkspaceAgentShortcut(
  shortcut: Pick<TerminalAgentTabShortcut, 'agent' | 'pendingAgent'>
): void {
  launchAgentTabShortcut(FLOATING_TERMINAL_WORKTREE_ID, shortcut, () =>
    selectFloatingWorkspacePanelVisible(useAppStore.getState())
  )
}
