import type { TuiAgent } from './tui-agent'
import { isTuiAgent } from './tui-agent-config'
import { isTuiAgentEnabled, normalizeDisabledTuiAgents } from './tui-agent-selection'

/** A named launch entry backed by an installed agent: its command (such as a wrapper that execs the
 *  agent) replaces the agent's Settings command, while the agent's status, prompts and resume stay. */
export type CustomTuiAgent = {
  id: string
  name: string
  agent: TuiAgent
  command: string
}

export const MAX_CUSTOM_TUI_AGENTS = 50
const MAX_ID_LENGTH = 80
const MAX_NAME_LENGTH = 80
const MAX_COMMAND_LENGTH = 4000

export type CustomTuiAgentSettings = {
  /** Named launch entries backed by an installed agent, each with its own command (e.g. a wrapper). */
  customTuiAgents?: CustomTuiAgent[]
  /** The default is this custom agent; `defaultTuiAgent` names its base agent. */
  defaultCustomTuiAgentId?: string
}

/** The custom agent a default launch of `agent` starts: the default custom agent, when `agent` is its base. */
export function defaultCustomTuiAgentFor(
  settings: CustomTuiAgentSettings | null | undefined,
  agent: TuiAgent | null | undefined
): CustomTuiAgent | null {
  const id = settings?.defaultCustomTuiAgentId
  return id && agent ? findCustomTuiAgent(settings?.customTuiAgents, agent, id) : null
}

/** `defaultCustomTuiAgentFor` over settings another host sent, before their fields are trusted. */
export function readDefaultCustomTuiAgent(
  settings: { customTuiAgents?: unknown; defaultCustomTuiAgentId?: unknown } | null | undefined,
  agent: TuiAgent | null | undefined
): CustomTuiAgent | null {
  return defaultCustomTuiAgentFor(
    {
      customTuiAgents: normalizeCustomTuiAgents(settings?.customTuiAgents),
      defaultCustomTuiAgentId: normalizeDefaultCustomTuiAgentId(settings?.defaultCustomTuiAgentId)
    },
    agent
  )
}

/** A stored default custom agent id; anything else reads as none. */
export function normalizeDefaultCustomTuiAgentId(input: unknown): string | undefined {
  const id = typeof input === 'string' ? input.trim().slice(0, MAX_ID_LENGTH) : ''
  return id || undefined
}

/** The custom agent a launch names; null when it was deleted or now backs another agent. */
export function findCustomTuiAgent(
  customAgents: readonly CustomTuiAgent[] | null | undefined,
  agent: TuiAgent,
  customAgentId: string
): CustomTuiAgent | null {
  return (
    customAgents?.find((custom) => custom.id === customAgentId && custom.agent === agent) ?? null
  )
}

/** Custom agents whose base agent is enabled. Detection does not gate them: a custom agent runs its
 *  own command (a wrapper that execs or ships the agent), so the base agent need not be detected. */
export function offerableCustomTuiAgents(
  customAgents: readonly CustomTuiAgent[] | null | undefined,
  disabledTuiAgents?: unknown
): CustomTuiAgent[] {
  const disabled = normalizeDisabledTuiAgents(disabledTuiAgents)
  return (customAgents ?? []).filter((custom) => isTuiAgentEnabled(custom.agent, disabled))
}

/** The custom agent a recorded launch command started: its command, alone or before arguments. */ export function customTuiAgentForCommand(
  customAgents: readonly CustomTuiAgent[] | null | undefined,
  agent: TuiAgent,
  recordedCommand: string | undefined
): CustomTuiAgent | null {
  const command = recordedCommand?.trim()
  const matches = (customAgents ?? []).filter(
    (custom) =>
      custom.agent === agent &&
      (command === custom.command || command?.startsWith(`${custom.command} `))
  )
  // The longest command wins when one custom agent's command extends another's.
  return matches.toSorted((a, b) => b.command.length - a.command.length)[0] ?? null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

/** Drops incomplete or duplicate entries; a command stays one shell line. */
export function normalizeCustomTuiAgents(input: unknown): CustomTuiAgent[] {
  if (!Array.isArray(input)) {
    return []
  }
  const seen = new Set<string>()
  const normalized: CustomTuiAgent[] = []
  for (const item of input) {
    if (normalized.length >= MAX_CUSTOM_TUI_AGENTS) {
      break
    }
    if (!isRecord(item)) {
      continue
    }
    const id = readText(item.id, MAX_ID_LENGTH)
    const name = readText(item.name, MAX_NAME_LENGTH)
    // A line break would run the rest as a separate shell command.
    const command =
      typeof item.command === 'string'
        ? readText(item.command.replace(/\s*[\r\n]+\s*/g, ' '), MAX_COMMAND_LENGTH)
        : ''
    if (!id || seen.has(id) || !name || !command || !isTuiAgent(item.agent)) {
      continue
    }
    seen.add(id)
    normalized.push({ id, name, agent: item.agent, command })
  }
  return normalized
}
