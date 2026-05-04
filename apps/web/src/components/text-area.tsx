import { TextArea as RadixTextArea } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

export function TextArea(props: ComponentProps<typeof RadixTextArea>) {
  return <RadixTextArea size={{ initial: '3', xs: '2' }} {...props} />
}
