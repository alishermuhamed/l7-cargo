import { type RefObject, useEffect, useRef } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  enabled?: boolean
  onIntersect: (
    entry: IntersectionObserverEntry,
    observer: IntersectionObserver
  ) => void
}

export function useIntersectionObserver<T extends Element>({
  enabled = true,
  onIntersect,
  root,
  rootMargin,
  threshold,
}: UseIntersectionObserverOptions): RefObject<T | null> {
  const targetRef = useRef<T | null>(null)
  const onIntersectRef = useRef(onIntersect)

  useEffect(() => {
    onIntersectRef.current = onIntersect
  }, [onIntersect])

  useEffect(() => {
    const target = targetRef.current

    if (!enabled || !target || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(
      ([entry], observerInstance) => {
        if (entry?.isIntersecting) {
          onIntersectRef.current(entry, observerInstance)
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [enabled, root, rootMargin, threshold])

  return targetRef
}
