import './search-field.css'

import { Cross1Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import classNames from 'classnames'

import { useDebouncedInput } from '../../hooks/use-debounced-input'
import i18n from '../../lib/i18n'
import { IconButton } from '../icon-button'
import { TextField } from '../text-field'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  const [draft, setDraft] = useDebouncedInput(value, onChange)

  return (
    <TextField.Root
      placeholder={i18n.t('common:search')}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon />
      </TextField.Slot>

      <TextField.Slot>
        <IconButton
          className={classNames('search-field-cross', !draft && 'hidden')}
          tooltip={i18n.t('common:clear')}
          aria-label={i18n.t('common:clear')}
          size="1"
          variant="ghost"
          color="gray"
          onClick={() => setDraft('')}
        >
          <Cross1Icon width={12} height={12} />
        </IconButton>
      </TextField.Slot>
    </TextField.Root>
  )
}
