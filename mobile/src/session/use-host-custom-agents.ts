import { useEffect, useState } from 'react'
import type { RpcClient } from '../transport/rpc/rpc-client-contract'
import { optionalSettingsRead } from '../settings/mobile-settings-read-operations'
import {
  normalizeCustomTuiAgents,
  type CustomTuiAgent
} from '../../../src/shared/agent-launch/catalog/custom-tui-agents'

/** The custom agents of the paired host's settings, read while `enabled`; empty until they arrive. */
export function useHostCustomAgents(client: RpcClient | null, enabled: boolean): CustomTuiAgent[] {
  const [customAgents, setCustomAgents] = useState<CustomTuiAgent[]>([])
  useEffect(() => {
    if (!client || !enabled) {
      return
    }
    let stale = false
    void optionalSettingsRead
      .request(client)
      .then((response) => {
        const result = optionalSettingsRead.interpret(response)
        const settings = result.accepted ? result.value : null
        if (!stale && settings && typeof settings === 'object' && 'customTuiAgents' in settings) {
          setCustomAgents(normalizeCustomTuiAgents(settings.customTuiAgents))
        }
      })
      // A host that cannot answer lists no custom agents; the built-in ones still work.
      .catch(() => {})
    return () => {
      stale = true
    }
  }, [client, enabled])
  return customAgents
}
