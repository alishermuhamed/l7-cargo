import './search-field.css'

import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import classNames from 'classnames'

import i18n from '../../lib/i18n'
import { IconButton } from '../icon-button'
import { TextField } from '../text-field'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <TextField.Root
      placeholder={i18n.t('common:search')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon />
      </TextField.Slot>

      <TextField.Slot>
        <IconButton
          className={classNames('search-field-cross', !value && 'hidden')}
          tooltip={i18n.t('common:clear')}
          aria-label={i18n.t('common:clear')}
          size="1"
          variant="ghost"
          color="gray"
          onClick={() => onChange('')}
        >
          <Cross1Icon width={12} height={12} />
        </IconButton>
      </TextField.Slot>
    </TextField.Root>
  )
}
