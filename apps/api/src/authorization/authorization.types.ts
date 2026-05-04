import type { ExtractSubjectType, MongoAbility } from '@casl/ability'

export type Action = 'create' | 'read' | 'update' | 'delete'

// TODO remove
class SomeSubject {}

export type Subject = SomeSubject | typeof SomeSubject

export type SubjectClass = ExtractSubjectType<Subject>

export type Ability = MongoAbility<[Action, Subject]>
