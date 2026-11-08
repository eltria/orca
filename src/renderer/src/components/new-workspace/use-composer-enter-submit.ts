import { useEffect } from 'react'
import { addAppKeyListener, removeAppKeyListener } from '@/lib/app-keyboard-router'
import { isScreenSubmitShortcut } from '@/lib/screen-submit-shortcut'
import { shouldAllowComposerEnterSubmitTarget } from '@/lib/new-workspace-enter-guard'

/** Enter submits the composer unless a nested dialog or the sparse-preset editor owns input. */
export function useComposerEnterSubmit(args: {
  active: boolean
  nestedDialogOpen: boolean
  createDisabled: boolean
  composerRef: React.RefObject<HTMLDivElement | null>
  onCreate: () => void
}): void {
  const { active, nestedDialogOpen, createDisabled, composerRef, onCreate } = args
  useEffect(() => {
    if (!active || nestedDialogOpen) {
      return
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!isScreenSubmitShortcut(event)) {
        return
      }
      const target = event.target
      if (!(target instanceof HTMLElement)) {
        return
      }
      if (!shouldAllowComposerEnterSubmitTarget(target, composerRef.current)) {
        return
      }
      if (createDisabled || composerRef.current?.hasAttribute('data-sparse-preset-editing')) {
        return
      }
      event.preventDefault()
      onCreate()
    }
    addAppKeyListener('keydown', onKeyDown)
    return () => removeAppKeyListener('keydown', onKeyDown)
  }, [active, nestedDialogOpen, createDisabled, composerRef, onCreate])
}
