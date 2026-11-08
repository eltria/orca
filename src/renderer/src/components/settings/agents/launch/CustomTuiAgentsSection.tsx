import { useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { AgentIcon, getAgentLabel } from '@/lib/agent-catalog'
import { useTranslate } from '@/i18n/use-translate'
import { useUiLanguageRevision } from '@/i18n/use-ui-language-revision'
import { cn } from '@/lib/utils'
import { createNonSecureContextUuid } from '../../../../../../shared/non-secure-context-uuid'
import type { GlobalSettings } from '../../../../../../shared/global-settings-types'
import type { CustomTuiAgent } from '../../../../../../shared/agent-launch/catalog/custom-tui-agents'
import { Button } from '../../../ui/button'
import { SettingsBadge, SettingsSubsectionHeader } from '../../form-controls/SettingsFormControls'
import { CustomTuiAgentDialog } from './CustomTuiAgentDialog'

type Editing = { mode: 'add' | 'edit'; agent: CustomTuiAgent }

export function CustomTuiAgentsSection({
  settings,
  updateSettings
}: {
  settings: GlobalSettings
  updateSettings: (updates: Partial<GlobalSettings>) => void | Promise<void>
}): React.JSX.Element {
  const t = useTranslate()
  useUiLanguageRevision()
  const [editing, setEditing] = useState<Editing | null>(null)
  // Deleting asks twice in place: the first press arms the row, the second deletes.
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null)
  const customAgents = settings.customTuiAgents ?? []
  const save = (next: CustomTuiAgent[]): void => {
    void updateSettings({ customTuiAgents: next })
  }
  const upsert = (agent: CustomTuiAgent): void => {
    save(
      customAgents.some((entry) => entry.id === agent.id)
        ? customAgents.map((entry) => (entry.id === agent.id ? agent : entry))
        : [...customAgents, agent]
    )
    setEditing(null)
  }
  const move = (index: number, offset: -1 | 1): void => {
    const next = [...customAgents]
    const [moved] = next.splice(index, 1)
    next.splice(index + offset, 0, moved)
    save(next)
  }
  return (
    <section className="mt-8">
      <SettingsSubsectionHeader
        className="mb-3"
        title={
          <span className="flex items-center gap-2">
            {t('settings.agents.customAgents.title', 'Custom agents')}
            <SettingsBadge tone="accent">{customAgents.length}</SettingsBadge>
          </span>
        }
        description={t(
          'settings.agents.customAgents.description',
          'Extra entries for an installed agent that start it with your own command, such as a wrapper. Status, prompts and resume work as usual; pick them from the + menu.'
        )}
        action={
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() =>
              setEditing({
                mode: 'add',
                agent: {
                  id: `custom-agent-${createNonSecureContextUuid()}`,
                  name: '',
                  agent: 'claude',
                  command: ''
                }
              })
            }
          >
            <Plus className="size-3" />
            {t('settings.agents.customAgents.add', 'Add')}
          </Button>
        }
      />
      {customAgents.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/50 px-3 py-3 text-sm text-muted-foreground">
          {t(
            'settings.agents.customAgents.empty',
            'No custom agents yet. Add one to start Claude or another agent with your own command.'
          )}
        </div>
      ) : (
        customAgents.map((agent, index) => (
          <div
            key={agent.id}
            className={cn('flex items-center gap-3 py-3', index > 0 && 'border-t border-border/40')}
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/50">
              <AgentIcon agent={agent.agent} size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium leading-none">{agent.name}</span>
                <SettingsBadge tone="muted">{getAgentLabel(agent.agent)}</SettingsBadge>
              </div>
              <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                {agent.command}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <RowAction
                label={t('settings.agents.customAgents.moveUp', 'Move up')}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-3.5" />
              </RowAction>
              <RowAction
                label={t('settings.agents.customAgents.moveDown', 'Move down')}
                disabled={index === customAgents.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-3.5" />
              </RowAction>
              <RowAction
                label={t('settings.agents.customAgents.edit', 'Edit')}
                onClick={() => setEditing({ mode: 'edit', agent })}
              >
                <Pencil className="size-3.5" />
              </RowAction>
              {armedDeleteId === agent.id ? (
                <Button
                  type="button"
                  variant="destructive-chip"
                  size="xs"
                  autoFocus
                  onBlur={() => setArmedDeleteId(null)}
                  onKeyDown={(event) => event.key === 'Escape' && setArmedDeleteId(null)}
                  onClick={() => {
                    setArmedDeleteId(null)
                    save(customAgents.filter((entry) => entry.id !== agent.id))
                  }}
                >
                  {t('settings.agents.customAgents.confirmDelete', 'Delete')}
                </Button>
              ) : (
                <RowAction
                  label={t('settings.agents.customAgents.delete', 'Delete {{name}}', {
                    name: agent.name
                  })}
                  onClick={() => setArmedDeleteId(agent.id)}
                >
                  <Trash2 className="size-3.5" />
                </RowAction>
              )}
            </div>
          </div>
        ))
      )}
      {editing ? (
        <CustomTuiAgentDialog
          key={editing.agent.id}
          mode={editing.mode}
          initial={editing.agent}
          settingsCommands={settings.agentCmdOverrides}
          onOpenChange={(open) => !open && setEditing(null)}
          onSave={upsert}
        />
      ) : null}
    </section>
  )
}

function RowAction({
  label,
  disabled,
  onClick,
  children
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
