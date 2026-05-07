import { Button as RadixButton } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

export function Button(props: ComponentProps<typeof RadixButton>) {
  return <RadixButton size={{ initial: '3', xs: '2' }} {...props} />
}
