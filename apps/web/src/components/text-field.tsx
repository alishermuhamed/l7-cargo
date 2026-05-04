import { TextField as RadixTextField } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

function Root(props: ComponentProps<typeof RadixTextField.Root>) {
  return <RadixTextField.Root size={{ initial: '3', xs: '2' }} {...props} />
}

export const TextField = Object.assign(Root, {
  Root,
  Slot: RadixTextField.Slot,
})
