import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AgentIcon } from '@/lib/agent-catalog'
import type { CustomTuiAgent } from '../../../../shared/agent-launch/catalog/custom-tui-agents'

/** One custom agent in an agent menu: its base agent's icon, its name and its command. */
export function CustomAgentMenuItem({
  custom,
  variant,
  disabled,
  selected,
  onSelect
}: {
  custom: CustomTuiAgent
  /** `launch` matches the new tab menu's rows; pickers use the default rows. */
  variant?: 'launch'
  disabled?: boolean
  selected?: boolean
  onSelect: () => void
}): React.JSX.Element {
  return (
    <DropdownMenuItem
      variant={variant}
      disabled={disabled}
      title={custom.command}
      aria-current={selected || undefined}
      onSelect={onSelect}
    >
      <AgentIcon agent={custom.agent} size={14} />
      <span className="min-w-0 flex-1 truncate">{custom.name}</span>
      <span className="max-w-36 truncate font-mono text-[11px] font-normal text-muted-foreground">
        {custom.command}
      </span>
    </DropdownMenuItem>
  )
}
