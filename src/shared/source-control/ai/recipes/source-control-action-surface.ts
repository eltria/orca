import type { TuiAgent } from '../../../agent-launch/catalog/tui-agent'
import type { SourceControlActionRecipe } from './source-control-ai-actions'

/** Saved Terminal is strict; saved Chat uses supported routing with Terminal fallback. */
export function resolveSourceControlActionRequestedSurface(
  recipe: Pick<SourceControlActionRecipe, 'agentId' | 'surface'>,
  agent: TuiAgent
): 'terminal' | undefined {
  return recipe.surface === 'terminal' && recipe.agentId === agent ? 'terminal' : undefined
}

export function resolveSourceControlActionPreferredSurface(
  recipe: Pick<SourceControlActionRecipe, 'agentId' | 'surface'>,
  agent: TuiAgent
): 'chat' | undefined {
  return recipe.agentId === agent && recipe.surface === 'chat' ? 'chat' : undefined
}

/** Launch fields of a recipe's custom agent for `agent`: its command runs in a terminal. */
export function sourceControlActionCustomAgentLaunch(
  recipe: Pick<SourceControlActionRecipe, 'agentId' | 'customAgentId'>,
  agent: TuiAgent
): { customAgentId?: string; requestedSurface?: 'terminal'; preferredSurface?: undefined } {
  return recipe.customAgentId && recipe.agentId === agent
    ? {
        customAgentId: recipe.customAgentId,
        requestedSurface: 'terminal',
        preferredSurface: undefined
      }
    : {}
}

/** The surface and custom agent an agent pick saves; a custom agent opens a terminal. */
export function pickedActionAgentFields(
  surface: SourceControlActionRecipe['surface'],
  customAgentId: string | undefined
): Pick<SourceControlActionRecipe, 'surface' | 'customAgentId'> {
  // An undefined custom agent replaces the one the selection held.
  return customAgentId
    ? { customAgentId, surface: 'terminal' }
    : { customAgentId: undefined, ...(surface ? { surface } : {}) }
}
