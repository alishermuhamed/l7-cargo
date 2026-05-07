/* eslint-disable simple-import-sort/imports */
import { DataSourceOptions } from 'typeorm'

import type { EnvConfig } from '../config/env-config'
import { User } from '../users/entities/user.entity'
import { Account } from '../authentication/entities/account.entity'
import { Session } from '../authentication/entities/session.entity'
import { Verification } from '../authentication/entities/verification.entity'
import { Parcel } from '../parcels/entities/parcel.entity'

// Migrations
import { AddBetterAuthEntities1777914172901 } from './migrations/1777914172901-add-better-auth-entities'
import { AddParcels1777992156801 } from './migrations/1777992156801-add-parcels'

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
    entities: [User, Account, Session, Verification, Parcel],
    migrations: [AddBetterAuthEntities1777914172901, AddParcels1777992156801],
  }
}
