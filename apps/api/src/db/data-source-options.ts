/* eslint-disable simple-import-sort/imports */
import { DataSourceOptions } from 'typeorm'

import type { EnvConfig } from '../config/env-config'
import { User } from '../users/entities/user.entity'
import { Account } from '../authentication/entities/account.entity'
import { Session } from '../authentication/entities/session.entity'
import { Verification } from '../authentication/entities/verification.entity'
import { Parcel } from '../parcels/entities/parcel.entity'
import { ParcelStatusHistory } from '../parcels/entities/parcel-status-history.entity'
import { ParcelsImport } from '../parcels-imports/entities/parcels-import.entity'

// Migrations
import { AddBetterAuthEntities1777914172901 } from './migrations/1777914172901-add-better-auth-entities'
import { AddParcels1777992156801 } from './migrations/1777992156801-add-parcels'
import { AddParcelStatusHistory1778165216012 } from './migrations/1778165216012-add-parcel-status-history'
import { AddUserRole1778267733853 } from './migrations/1778267733853-add-user-role'
import { AddClientId1778411635666 } from './migrations/1778411635666-add-client-id'
import { AddParcelsImportEntity1778745509438 } from './migrations/1778745509438-add-parcels-import-entity'
import { AddAchievedAtToParcelStatusHistory1783196326251 } from './migrations/1783196326251-add-achieved-at-to-parcel-status-history'
import { AddAchievedAtToParcelsImport1783197115439 } from './migrations/1783197115439-add-achieved-at-to-parcels-import'
import { ConvertAchievedAtToDateOnly1783368829744 } from './migrations/1783368829744-convert-achieved-at-to-date-only'
import { MakeParcelStatusHistoryUnique1786125107169 } from './migrations/1786125107169-make-parcel-status-history-unique'

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
      ParcelsImport,
    ],
    migrations: [
      AddBetterAuthEntities1777914172901,
      AddParcels1777992156801,
      AddParcelStatusHistory1778165216012,
      AddUserRole1778267733853,
      AddClientId1778411635666,
      AddParcelsImportEntity1778745509438,
      AddAchievedAtToParcelStatusHistory1783196326251,
      AddAchievedAtToParcelsImport1783197115439,
      ConvertAchievedAtToDateOnly1783368829744,
      MakeParcelStatusHistoryUnique1786125107169,
    ],
  }
}
