export type NullableKeys<T> = {
  [Key in keyof T]-?: null extends T[Key] ? Key : never
}[keyof T]

export type MakeNullableFieldsOptional<T> = Omit<T, NullableKeys<T>> &
  Partial<Pick<T, NullableKeys<T>>>
