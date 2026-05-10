/* eslint-disable simple-import-sort/imports */
import { DataSourceOptions } from 'typeorm'

import type { EnvConfig } from '../config/env-config'
import { User } from '../users/entities/user.entity'
import { Account } from '../authentication/entities/account.entity'
import { Session } from '../authentication/entities/session.entity'
import { Verification } from '../authentication/entities/verification.entity'
import { Parcel } from '../parcels/entities/parcel.entity'
import { ParcelStatusHistory } from '../parcels/entities/parcel-status-history.entity'

// Migrations
import { AddBetterAuthEntities1777914172901 } from './migrations/1777914172901-add-better-auth-entities'
import { AddParcels1777992156801 } from './migrations/1777992156801-add-parcels'
import { AddParcelStatusHistory1778165216012 } from './migrations/1778165216012-add-parcel-status-history'
import { AddUserRole1778267733853 } from './migrations/1778267733853-add-user-role'
import { AddClientId1778411635666 } from './migrations/1778411635666-add-client-id'

export function buildDataSourceOptions(
  db: EnvConfig['database']
): DataSourceOptions {
  if (!db.host || !db.port || !db.username || !db.password || !db.name) {
    throw new Error('Missing required database configuration')
  }

  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.name,
    ssl: db.ssl ? { rejectUnauthorized: false } : undefined,
    synchronize: false,
    entities: [
      User,
      Account,
      Session,
      Verification,
      Parcel,
      ParcelStatusHistory,
    ],
    migrations: [
      AddBetterAuthEntities1777914172901,
      AddParcels1777992156801,
      AddParcelStatusHistory1778165216012,
      AddUserRole1778267733853,
      AddClientId1778411635666,
    ],
  }
}
