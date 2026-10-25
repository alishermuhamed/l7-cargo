import { useEffect, useEffectEvent, useState } from 'react'

// Keep typing synchronous while the parent persists the value asynchronously.
export function useDebouncedInput(
  value: string,
  onChange: (value: string) => void,
  delay = 300
) {
  const [state, setState] = useState({
    draft: value,
    source: value,
    submitted: [] as string[],
  })

  if (state.source !== value) {
    const acknowledgedIndex = state.submitted.indexOf(value)
    setState({
      source: value,
      // An older navigation finishing must not overwrite more recent typing.
      // A different external value (e.g. Back/Forward) replaces the draft.
      draft: acknowledgedIndex >= 0 ? state.draft : value,
      submitted:
        acknowledgedIndex >= 0
          ? state.submitted.slice(acknowledgedIndex + 1)
          : [],
    })
  }

  const commit = useEffectEvent((draft: string) => {
    setState((previous) => ({
      ...previous,
      submitted: [...previous.submitted, draft],
    }))
    onChange(draft)
  })

  useEffect(() => {
    const latestValue = state.submitted.at(-1) ?? state.source
    if (state.draft === latestValue) return

    const timer = setTimeout(() => commit(state.draft), delay)
    return () => clearTimeout(timer)
  }, [state.draft, state.source, state.submitted, delay])

  const setDraft = (draft: string) => {
    setState((previous) => ({ ...previous, draft }))
  }

  return [state.draft, setDraft] as const
}
