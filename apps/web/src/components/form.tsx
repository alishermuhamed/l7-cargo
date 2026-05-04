'use client'

import { Flex, type FlexProps, Slot, Text } from '@radix-ui/themes'
import { createContext, type PropsWithChildren, useContext, useId } from 'react'
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form'

export const Form = FormProvider

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>({ name: '' })

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function useFormField() {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormFieldItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField must be used within FormField')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formFieldId: `${id}-form-field`,
    formFieldDescriptionId: `${id}-form-field-description`,
    formFieldErrorId: `${id}-form-field-error`,
    ...fieldState,
  }
}

interface FormFieldItemContextValue {
  id: string
}

const FormFieldItemContext = createContext<FormFieldItemContextValue>({
  id: '',
})

export function FormFieldItem(props: FlexProps) {
  const id = useId()

  return (
    <FormFieldItemContext.Provider value={{ id }}>
      <Flex direction="column" gap="2" {...props} />
    </FormFieldItemContext.Provider>
  )
}

export function FormFieldLabel({ children }: PropsWithChildren) {
  const { formFieldId } = useFormField()

  return (
    <Text as="label" htmlFor={formFieldId} weight="medium" size="2">
      {children}
    </Text>
  )
}

export function FormFieldControl(props: React.ComponentProps<typeof Slot>) {
  const {
    error,
    formFieldId,
    formFieldDescriptionId,
    formFieldErrorId: formFieldMessageId,
  } = useFormField()

  return (
    <Slot
      id={formFieldId}
      aria-describedby={
        !error
          ? `${formFieldDescriptionId}`
          : `${formFieldDescriptionId} ${formFieldMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

export function FormFieldDescription({ children }: PropsWithChildren) {
  const { formFieldDescriptionId } = useFormField()

  return (
    <Text id={formFieldDescriptionId} size="1" color="gray">
      {children}
    </Text>
  )
}

export function FormFieldError() {
  const { error, formFieldErrorId } = useFormField()

  if (!error || !error.message) {
    return null
  }

  return (
    <Text id={formFieldErrorId} as="p" color="red" size="1">
      {error.message}
    </Text>
  )
}
