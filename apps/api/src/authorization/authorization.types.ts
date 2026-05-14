import type { ExtractSubjectType, MongoAbility } from '@casl/ability'

import { Parcel } from '../parcels/entities/parcel.entity'
import { ParcelsImport } from '../parcels-imports/entities/parcels-import.entity'
import { User } from '../users/entities/user.entity'

export type Action = 'create' | 'read' | 'update' | 'delete'

export type Subject =
  | Parcel
  | typeof Parcel
  | User
  | typeof User
  | ParcelsImport
  | typeof ParcelsImport

export type SubjectClass = ExtractSubjectType<Subject>

export type Ability = MongoAbility<[Action, Subject]>
