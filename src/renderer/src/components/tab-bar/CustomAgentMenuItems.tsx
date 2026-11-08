import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store'
import type { NewTabAgentMenuRow } from '../../../../shared/agent-launch/picker/agent-launch-picker-rows'
import type { TuiAgent } from '../../../../shared/agent-launch/catalog/tui-agent'
import { customAgentMenuRow, launchableCustomAgents } from '../agent/custom-agent-picker-rows'
import { CustomAgentMenuItem } from '../agent/CustomAgentMenuItem'
import type { AgentPickerInventorySource } from '../agent/agent-launch-picker-acquisition'

/** Custom agents in a menu built from rows; a menu with a picker inventory lists its own. */
export function CustomAgentMenuItems({
  rows,
  detectedIds,
  disabled,
  runLaunch,
  pickerInventory
}: {
  rows: readonly NewTabAgentMenuRow[]
  detectedIds: readonly TuiAgent[] | null
  disabled: boolean
  runLaunch: (row: NewTabAgentMenuRow) => unknown
  pickerInventory?: AgentPickerInventorySource
}): React.JSX.Element | null {
  const customAgents = useAppStore((state) => state.settings?.customTuiAgents)
  const launchable = launchableCustomAgents(customAgents, detectedIds)
  if (pickerInventory || launchable.length === 0) {
    return null
  }
  return (
    <>
      <DropdownMenuSeparator />
      {launchable.map((custom) => (
        <CustomAgentMenuItem
          key={custom.id}
          custom={custom}
          variant="launch"
          disabled={disabled}
          onSelect={() => runLaunch(customAgentMenuRow(custom, rows))}
        />
      ))}
    </>
  )
}
