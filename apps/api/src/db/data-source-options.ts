/* eslint-disable simple-import-sort/imports */
import { DataSourceOptions } from 'typeorm'

import type { EnvConfig } from '../config/env-config'
import { User } from '../users/entities/user.entity'
import { Account } from '../authentication/entities/account.entity'
import { Session } from '../authentication/entities/session.entity'
import { Verification } from '../authentication/entities/verification.entity'

// Migrations
import { AddBetterAuthEntities1777914172901 } from './migrations/1777914172901-add-better-auth-entities'

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
    entities: [User, Account, Session, Verification],
    migrations: [AddBetterAuthEntities1777914172901],
  }
}
