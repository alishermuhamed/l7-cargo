import type { ExtractSubjectType, MongoAbility } from '@casl/ability'

import { Parcel } from '../parcels/entities/parcel.entity'

export type Action = 'create' | 'read' | 'update' | 'delete'

export type Subject = Parcel | typeof Parcel

export type SubjectClass = ExtractSubjectType<Subject>

export type Ability = MongoAbility<[Action, Subject]>
