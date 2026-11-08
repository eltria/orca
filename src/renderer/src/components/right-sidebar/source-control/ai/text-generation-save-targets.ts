import type { SourceControlAiWriteTarget } from '../../../../../../shared/source-control/ai/settings/source-control-ai-recipe-save'

export type SourceControlTextGenerationSaveTarget = {
  target: SourceControlAiWriteTarget
  label: string
  successMessage: string
}

export function sourceControlTextGenerationSaveTargetKey(
  target: SourceControlAiWriteTarget
): string {
  return target.type === 'repo' ? `repo:${target.repoId}` : 'global'
}

export function getDefaultSourceControlTextGenerationSaveTargetKey(
  saveTargets: SourceControlTextGenerationSaveTarget[]
): string {
  const defaultTarget =
    saveTargets.find((saveTarget) => saveTarget.target.type === 'global') ?? saveTargets[0]
  return defaultTarget ? sourceControlTextGenerationSaveTargetKey(defaultTarget.target) : 'global'
}
