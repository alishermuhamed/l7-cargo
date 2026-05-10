import './select.css'

import { Select as RadixSelect } from '@radix-ui/themes'
import { type ComponentProps, type ReactNode } from 'react'

export interface SelectItem<TValue extends string = string> {
  label: ReactNode
  value: TValue
  disabled?: boolean
}

export interface SelectProps<TValue extends string = string> {
  value: TValue
  onValueChange: (value: TValue) => void
  placeholder?: ComponentProps<typeof RadixSelect.Trigger>['placeholder']
  items: SelectItem<TValue>[]
}

export function Select<TValue extends string = string>({
  value,
  onValueChange,
  placeholder,
  items,
}: SelectProps<TValue>) {
  return (
    <RadixSelect.Root
      size={{ initial: '3', xs: '2' }}
      value={value}
      onValueChange={onValueChange}
    >
      <RadixSelect.Trigger
        className="select-trigger"
        placeholder={placeholder}
      />

      <RadixSelect.Content>
        {items.map((item) => (
          <RadixSelect.Item
            key={item.value}
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </RadixSelect.Item>
        ))}
      </RadixSelect.Content>
    </RadixSelect.Root>
  )
}
