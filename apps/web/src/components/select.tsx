import { Select as RadixSelect } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

function Root(props: ComponentProps<typeof RadixSelect.Root>) {
  return <RadixSelect.Root size={{ initial: '3', xs: '2' }} {...props} />
}

export const Select = Object.assign(Root, {
  Root,
  Trigger: RadixSelect.Trigger,
  Content: RadixSelect.Content,
  Item: RadixSelect.Item,
  Group: RadixSelect.Group,
  Label: RadixSelect.Label,
  Separator: RadixSelect.Separator,
})
