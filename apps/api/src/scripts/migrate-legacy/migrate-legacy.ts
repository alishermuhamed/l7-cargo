import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

import BigNumber from 'bignumber.js'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { DataSource, QueryRunner } from 'typeorm'

import { PARCEL_STATUSES } from '../../parcels/parcel-status'

type Row = Record<string, string | number | boolean | Date | null>
type Issue = { kind: string; id: string }
type Table = { name: string; rows: Row[] }
type Summary = {
  name: string
  columns: string[]
  count: number
  digest: string
}
type Manifest = { version: number; importedAt: string; tables: Summary[] }
type UnresolvedClient = {
  profileId: string
  clientId: string
  code: number
  parcelCount: number
  hasPhone: boolean
  hasPassword: boolean
}
const statuses = new Map([
  ['Выехал из Китая', 'left_china'],
  ['Прошел таможенный пост', 'cleared_customs'],
  ['Готов к выдаче', 'ready_for_pickup'],
  ['Выдан', 'picked_up'],
])
const ranks: readonly string[] = PARCEL_STATUSES
// Explicitly approved exclusion: legacy parcel with an empty tracking number.
const skippedParcelIds = new Set(['53411'])
const tables = [
  'client',
  'client_code_alias',
  'user',
  'account',
  'parcel',
  'parcel_status_history',
]
const targetTables = [...tables, 'session', 'verification', 'parcels_import']

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name}`)
  return value
}
function string(value: Row[string]): string {
  return value == null ? '' : String(value)
}
function uuid(kind: string, id: string): string {
  const hex = createHash('sha256')
    .update(`l7-cargo:supabase:v1:${kind}:${id}`)
    .digest('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}
function phone(value: Row[string]): string | null {
  // Legacy data uses +7, bare 7, domestic 8, and national KZ formats.
  // Parse the whole field so text containing digits cannot claim a client.
  const parsed = parsePhoneNumberFromString(string(value).trim(), {
    defaultCountry: 'KZ',
    extract: false,
  })
  return parsed?.isValid() ? parsed.number : null
}
function base(
  kind: string,
  id: string,
  created: Row[string],
  now: string
): Row {
  return {
    id: uuid(kind, id),
    createdAt: created || now,
    updatedAt: created || now,
  }
}
function canonical(row: Row, columns: string[]): string {
  return JSON.stringify(
    columns.map((column): Row[string] => {
      const value = row[column] ?? null
      if (value instanceof Date) return value.toISOString()
      if (column.endsWith('At') && typeof value === 'string')
        return new Date(value).toISOString()
      return value
    })
  )
}
function summary(
  name: string,
  rows: Row[],
  columns = Object.keys(rows[0] ?? {}).sort()
): Summary {
  const hashes = rows
    .map((row): string =>
      createHash('sha256').update(canonical(row, columns)).digest('hex')
    )
    .sort()
  return {
    name,
    columns,
    count: rows.length,
    digest: createHash('sha256').update(hashes.join('\n')).digest('hex'),
  }
}
function identifier(value: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value))
    throw new Error('Invalid SQL identifier')
  return `"${value}"`
}
async function save(path: string, value: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(value, null, 2) + '\n', {
    mode: 0o600,
    flag: 'wx',
  })
}
function connection(url: string): DataSource {
  return new DataSource({
    type: 'postgres',
    url,
    logging: false,
    applicationName: 'l7-legacy-migration',
    connectTimeoutMS: 15000,
    installExtensions: false,
    entities: [],
    extra: { max: 1, query_timeout: 300000 },
  })
}
async function readRows(
  runner: QueryRunner,
  sql: string,
  parameters: string[] = []
): Promise<Row[]> {
  const value: unknown = await runner.query(sql, parameters)
  if (!Array.isArray(value)) throw new Error('Unexpected query result')
  return value.map((item: unknown): Row => {
    if (!item || typeof item !== 'object') throw new Error('Unexpected row')
    const row: Row = {}
    for (const [key, cell] of Object.entries(item as Record<string, unknown>)) {
      if (
        cell !== null &&
        typeof cell !== 'string' &&
        typeof cell !== 'number' &&
        typeof cell !== 'boolean' &&
        !(cell instanceof Date)
      )
        throw new Error('Unexpected cell')
      row[key] = cell
    }
    return row
  })
}
async function readLegacyRows(
  runner: QueryRunner,
  table: string,
  columns: string
): Promise<Row[]> {
  const rows: Row[] = []
  const batchSize = 10000
  let lastId: string | undefined
  while (true) {
    const batch = await readRows(
      runner,
      `SELECT ${columns} FROM public.${identifier(table)} ${lastId === undefined ? '' : 'WHERE id > $1'} ORDER BY ${identifier(table)}.id LIMIT ${batchSize}`,
      lastId === undefined ? [] : [lastId]
    )
    rows.push(...batch)
    if (batch.length < batchSize) return rows
    lastId = string(batch[batch.length - 1].id)
    if (rows.length % 20000 === 0)
      console.log(`Read ${rows.length} rows from ${table}.`)
  }
}
async function verify(runner: QueryRunner, expected: Summary[]): Promise<void> {
  for (const entry of expected) {
    if (!tables.includes(entry.name)) throw new Error('Invalid manifest table')
    const selection = entry.columns.length
      ? entry.columns
          .map((column): string => {
            const name = identifier(column)
            // Preserve calendar dates instead of parsing them in the local timezone.
            return entry.name === 'parcel_status_history' &&
              column === 'achievedAt'
              ? `${name}::text AS ${name}`
              : name
          })
          .join(',')
      : 'id'
    const rows = await readRows(
      runner,
      `SELECT ${selection} FROM public.${identifier(entry.name)}`
    )
    const actual = summary(entry.name, rows, entry.columns)
    if (actual.count !== entry.count || actual.digest !== entry.digest)
      throw new Error(`Verification failed: ${entry.name}`)
  }
}
async function main(): Promise<void> {
  const [mode, output, ...options] = process.argv.slice(2)
  const clearTarget = options.includes('--clear-target')
  if (
    !['analyze', 'dry-run', 'import', 'verify'].includes(mode) ||
    !output ||
    options.length > 1 ||
    options.some((option): boolean => option !== '--clear-target') ||
    (clearTarget && mode !== 'import')
  ) {
    throw new Error(
      'Usage: npx ts-node src/scripts/migrate-legacy/migrate-legacy.ts analyze|dry-run|import|verify /absolute/private/report.json [--clear-target (import only)]'
    )
  }
  const writesTarget = mode === 'import' || mode === 'dry-run'
  const targetUrl = required('LEGACY_TARGET_DATABASE_URL')
  const target = connection(targetUrl)
  await target.initialize()
  const destination = target.createQueryRunner()
  await destination.connect()
  console.log('Connected to target.')
  try {
    if (mode === 'verify') {
      const manifest: Manifest = JSON.parse(
        await readFile(output, 'utf8')
      ) as Manifest
      if (
        manifest.version !== 1 ||
        manifest.tables.length !== tables.length ||
        new Set(manifest.tables.map((table): string => table.name)).size !==
          tables.length ||
        manifest.tables.some((table): boolean => !tables.includes(table.name))
      )
        throw new Error('Invalid manifest')
      await destination.startTransaction('REPEATABLE READ')
      await destination.query('SET TRANSACTION READ ONLY')
      await verify(destination, manifest.tables)
      await destination.commitTransaction()
      console.log('Verification passed for all migrated fields and rows.')
      return
    }
    const sourceUrl = required('LEGACY_SOURCE_DATABASE_URL')
    if (new URL(sourceUrl).hostname === new URL(targetUrl).hostname)
      throw new Error('Source and target hosts must differ')
    if (
      writesTarget &&
      required('LEGACY_TARGET_HOST_CONFIRM') !== new URL(targetUrl).hostname
    )
      throw new Error('Target host confirmation does not match')
    const source = connection(sourceUrl)
    await source.initialize()
    const origin = source.createQueryRunner()
    await origin.connect()
    console.log('Connected to source; reading a consistent snapshot.')
    const issues: Issue[] = []
    const warnings: Issue[] = []
    const now = new Date().toISOString()
    const result: Table[] = tables.map((name): Table => ({ name, rows: [] }))
    const [clients, aliases, users, accounts, parcels, histories] = result
    try {
      await origin.startTransaction('REPEATABLE READ')
      await origin.query('SET TRANSACTION READ ONLY')
      const telegram = await readRows(
        origin,
        'SELECT id::text, created_at, phone FROM public.telegram_users ORDER BY telegram_users.id'
      )
      console.log(`Read ${telegram.length} legacy clients.`)
      const profiles = await readRows(
        origin,
        `SELECT user_id, created_at, first_name, last_name, email, phone, (password IS NOT NULL AND password <> '') AS password_present${writesTarget ? ', password' : ''} FROM public.profiles ORDER BY user_id`
      )
      console.log(`Read ${profiles.length} profiles.`)
      const oldParcels = await readLegacyRows(
        origin,
        'parcels',
        'id::text, created_at, track_number, description, user_id, product_link, is_hidden, weight::text, sum::text, info'
      )
      console.log(`Read ${oldParcels.length} parcels.`)
      const oldHistory = await readLegacyRows(
        origin,
        'status_history',
        'id::text, created_at, parcel_id::text, status, date::text'
      )
      console.log(`Read ${oldHistory.length} history rows.`)
      const oldRoles = await readRows(
        origin,
        'SELECT user_id, role FROM public.user_roles'
      )
      await origin.commitTransaction()
      const roles = new Map<string, string>()
      const profileIds = new Set(
        profiles.map((row): string => string(row.user_id))
      )
      for (const row of oldRoles) {
        const id = string(row.user_id)
        const role = string(row.role)
        if (!['admin', 'customer'].includes(role) || !profileIds.has(id)) {
          issues.push({ kind: 'unknown-or-orphan-user-role', id })
        } else if (role === 'admin' || !roles.has(id)) {
          roles.set(id, role === 'admin' ? 'admin' : 'client')
        }
      }
      const byPhone = new Map<string, string>()
      const profileClients = new Map<string, string>()
      const seenProfiles = new Set<string>()
      const seenProfilePhones = new Set<string>()
      const seenEmails = new Set<string>()
      const unresolvedClients = new Map<string, UnresolvedClient>()
      let plannedAccounts = 0
      for (const row of telegram) {
        const id = string(row.id)
        const code = Number(id)
        if (!Number.isSafeInteger(code) || code < 1 || code > 2147483647)
          issues.push({ kind: 'invalid-client-code', id })
        const normalized = phone(row.phone)
        const existing = normalized ? byPhone.get(normalized) : undefined
        if (existing)
          aliases.rows.push({
            ...base('alias', id, row.created_at, now),
            code,
            clientId: existing,
          })
        else {
          const clientId = uuid('client', id)
          clients.rows.push({
            ...base('client', id, row.created_at, now),
            code,
            legacyPhoneRaw: row.phone,
            legacyPhoneNormalized: normalized,
          })
          if (normalized) byPhone.set(normalized, clientId)
          else warnings.push({ kind: 'client-phone-not-normalizable', id })
        }
      }
      const { hashPassword } = await import('better-auth/crypto')
      for (const row of profiles) {
        const id = string(row.user_id)
        const normalized = phone(row.phone)
        if (!row.password_present)
          warnings.push({
            kind: normalized
              ? 'missing-password-use-otp'
              : 'missing-password-requires-phone-recovery',
            id,
          })
        if (!normalized)
          warnings.push({ kind: 'profile-phone-not-normalizable', id })
        if (normalized && seenProfilePhones.has(normalized))
          issues.push({ kind: 'duplicate-profile-phone', id })
        if (normalized) seenProfilePhones.add(normalized)
        let clientId = normalized ? byPhone.get(normalized) : undefined
        if (!clientId) {
          // The source query orders profiles by UUID, so the same snapshot
          // produces the same negative codes. UUIDs remain stable across snapshots.
          clientId = uuid('unresolved-client', id)
          const code = -(unresolvedClients.size + 1)
          if (code < -2147483648)
            issues.push({ kind: 'unresolved-client-code-overflow', id })
          clients.rows.push({
            ...base('unresolved-client', id, row.created_at, now),
            code,
            legacyPhoneRaw: row.phone,
            legacyPhoneNormalized: normalized,
          })
          unresolvedClients.set(clientId, {
            profileId: id,
            clientId,
            code,
            parcelCount: 0,
            hasPhone: normalized !== null,
            hasPassword: Boolean(row.password_present),
          })
          warnings.push({ kind: 'client-code-unresolved', id })
        }
        if (seenProfiles.has(clientId))
          issues.push({ kind: 'multiple-profiles-for-client', id })
        seenProfiles.add(clientId)
        const email = (
          string(row.email).trim() ||
          `${normalized ?? `legacy-${id}`}@phone.local`
        ).toLowerCase()
        if (seenEmails.has(email)) issues.push({ kind: 'duplicate-email', id })
        seenEmails.add(email)
        profileClients.set(id, clientId)
        users.rows.push({
          ...base('user', id, row.created_at, now),
          id,
          clientId,
          name: [row.first_name, row.last_name]
            .filter(Boolean)
            .join(' ')
            .trim(),
          email,
          emailVerified: false,
          phoneNumber: normalized,
          phoneNumberVerified: false,
          role: roles.get(id) ?? 'client',
        })
        if (row.password_present) plannedAccounts += 1
        if (writesTarget) {
          const password = string(row.password)
          row.password = null
          if (password) {
            accounts.rows.push({
              ...base('account', id, row.created_at, now),
              accountId: id,
              providerId: 'credential',
              userId: id,
              password: await hashPassword(password),
            })
            if (accounts.rows.length % 250 === 0)
              console.log(
                `Prepared ${accounts.rows.length} credential accounts.`
              )
          }
        }
      }
      const parcelIds = new Set(oldParcels.map((row): string => string(row.id)))
      const historyByKey = new Map<string, Row>()
      let skippedHistory = 0
      for (const row of oldHistory) {
        if (skippedParcelIds.has(string(row.parcel_id))) {
          skippedHistory += 1
          continue
        }
        const id = string(row.id)
        const status = statuses.get(string(row.status))
        if (!status || !row.date || !parcelIds.has(string(row.parcel_id))) {
          issues.push({ kind: 'invalid-history', id })
          continue
        }
        const key = `${string(row.parcel_id)}:${status}`
        const previous = historyByKey.get(key)
        if (!previous || string(row.date) >= string(previous.achievedAt))
          historyByKey.set(key, {
            ...base('history', key, row.created_at, now),
            parcelId: uuid('parcel', string(row.parcel_id)),
            status,
            achievedAt: row.date,
          })
      }
      for (const row of historyByKey.values()) histories.rows.push(row)
      const latestStage = new Map<string, Row>()
      for (const row of histories.rows) {
        const key = string(row.parcelId)
        const prior = latestStage.get(key)
        if (
          !prior ||
          ranks.indexOf(string(row.status)) >
            ranks.indexOf(string(prior.status))
        )
          latestStage.set(key, row)
      }
      const tracks = new Set<string>()
      function decimal(
        value: Row[string],
        precision: number,
        scale: number,
        id: string
      ): string | null {
        if (value == null) return null
        const number = new BigNumber(string(value))
        if (
          !number.isFinite() ||
          (number.decimalPlaces() ?? Infinity) > scale ||
          number.abs().gte(new BigNumber(10).pow(precision - scale))
        ) {
          issues.push({ kind: 'incompatible-decimal', id })
          return null
        }
        return number.toFixed(scale)
      }
      for (const row of oldParcels) {
        const id = string(row.id)
        if (skippedParcelIds.has(id)) {
          warnings.push({ kind: 'parcel-skipped-by-user', id })
          continue
        }
        const track = string(row.track_number)
        if (!track || tracks.has(track))
          issues.push({ kind: 'missing-or-duplicate-tracking-number', id })
        tracks.add(track)
        const clientId = row.user_id
          ? profileClients.get(string(row.user_id))
          : null
        if (row.user_id && !clientId)
          issues.push({ kind: 'parcel-without-matched-profile', id })
        const unresolved = clientId
          ? unresolvedClients.get(clientId)
          : undefined
        if (unresolved) unresolved.parcelCount += 1
        parcels.rows.push({
          ...base('parcel', id, row.created_at, now),
          trackingNumber: track,
          clientId: clientId ?? null,
          status: latestStage.get(uuid('parcel', id))?.status ?? null,
          source: null,
          description:
            [row.description, row.product_link].filter(Boolean).join('\n') ||
            null,
          weightKg: decimal(row.weight, 7, 3, id),
          deliveryFee: decimal(row.sum, 14, 4, id),
          comments: row.info,
          clientDeletedAt: row.is_hidden ? now : null,
        })
      }
      const issueCounts: Record<string, number> = {}
      for (const issue of issues)
        issueCounts[issue.kind] = (issueCounts[issue.kind] ?? 0) + 1
      await save(`${output}.analysis.json`, {
        importedAt: now,
        sourceCounts: {
          clients: telegram.length,
          profiles: profiles.length,
          parcels: oldParcels.length,
          history: oldHistory.length,
          roles: oldRoles.length,
        },
        targetCounts: result.map((table): object => ({
          table: table.name,
          count:
            table.name === 'account' && mode === 'analyze'
              ? plannedAccounts
              : table.rows.length,
        })),
        skippedParcelIds: oldParcels
          .map((row): string => string(row.id))
          .filter((id): boolean => skippedParcelIds.has(id)),
        skippedHistory,
        collapsedHistory:
          oldHistory.length - skippedHistory - histories.rows.length,
        issueCounts,
        issues,
        warnings,
        unresolvedClients: [...unresolvedClients.values()],
      })
      if (issues.length)
        throw new Error(
          `Blocked by ${issues.length} exceptions (${Object.entries(issueCounts)
            .map(([kind, count]): string => `${kind}: ${count}`)
            .join(', ')}); inspect ${output}.analysis.json`
        )
      await destination.startTransaction('SERIALIZABLE')
      if (writesTarget)
        await destination.query(
          `LOCK TABLE ${targetTables.map((name): string => `public.${identifier(name)}`).join(',')} IN ACCESS EXCLUSIVE MODE`
        )
      if (clearTarget) {
        const backup: Array<{ name: string; rowsJson: string }> = []
        for (const name of targetTables) {
          const snapshot = await readRows(
            destination,
            `SELECT COALESCE(jsonb_agg(to_jsonb(t)), '[]'::jsonb)::text AS rows FROM public.${identifier(name)} t`
          )
          backup.push({ name, rowsJson: string(snapshot[0]?.rows) })
        }
        await save(`${output}.target-backup.json`, {
          version: 1,
          backedUpAt: new Date().toISOString(),
          targetHost: new URL(targetUrl).hostname,
          tables: backup,
        })
        await destination.query(
          `TRUNCATE TABLE ${targetTables.map((name): string => `public.${identifier(name)}`).join(',')}`
        )
        console.log(
          'Target data backed up and cleared inside the import transaction.'
        )
      }
      for (const name of targetTables) {
        const count = await readRows(
          destination,
          `SELECT count(*)::text AS count FROM public.${identifier(name)}`
        )
        if (count[0]?.count !== '0')
          throw new Error(`Target is not empty: ${name}`)
      }
      for (const table of result) {
        if (table.rows.length)
          await destination.query(
            `SELECT ${Object.keys(table.rows[0]).map(identifier).join(',')} FROM public.${identifier(table.name)} LIMIT 0`
          )
      }
      if (mode === 'analyze') {
        await destination.rollbackTransaction()
        console.log(
          'Analysis passed; passwords are hashed only during import or dry run.'
        )
        return
      }
      for (const table of result) {
        const columns = Object.keys(table.rows[0] ?? {})
          .map(identifier)
          .join(',')
        for (let offset = 0; offset < table.rows.length; offset += 1000) {
          await destination.query(
            `INSERT INTO public.${identifier(table.name)} (${columns}) SELECT ${columns} FROM jsonb_populate_recordset(NULL::public.${identifier(table.name)}, $1::jsonb)`,
            [JSON.stringify(table.rows.slice(offset, offset + 1000))]
          )
        }
      }
      const manifest: Manifest = {
        version: 1,
        importedAt: now,
        tables: result.map((table): Summary => summary(table.name, table.rows)),
      }
      await verify(destination, manifest.tables)
      if (mode === 'dry-run') {
        await destination.rollbackTransaction()
        await save(output, {
          mode: 'dry-run',
          committed: false,
          verified: true,
          importedAt: now,
          tables: manifest.tables,
        })
        console.log(
          'Dry run verified all migrated fields and rows; target writes rolled back.'
        )
        return
      }
      // Persist before COMMIT so a disk failure cannot leave an unreviewable import.
      await save(output, manifest)
      await destination.commitTransaction()
      console.log(
        'Import committed and verified. Run verify again with this manifest.'
      )
    } finally {
      if (origin.isTransactionActive) await origin.rollbackTransaction()
      await origin.release()
      await source.destroy()
    }
  } finally {
    if (destination.isTransactionActive) await destination.rollbackTransaction()
    await destination.release()
    await target.destroy()
  }
}
void main().catch((error: unknown): void => {
  // SQL errors can contain row values / credentials: never log driver messages.
  const driverError =
    error instanceof Error && 'driverError' in error ? error.driverError : error
  let databaseFailure =
    'Migration failed. Database error details suppressed to protect personal data.'
  if (
    driverError instanceof Error &&
    driverError.message === 'Query read timeout'
  ) {
    databaseFailure = 'Migration failed: database query read timed out.'
  } else if (
    driverError instanceof Error &&
    'code' in driverError &&
    typeof driverError.code === 'string' &&
    /^[A-Z0-9]{5}$/.test(driverError.code)
  ) {
    databaseFailure = `Migration failed: database error ${driverError.code}. Row details suppressed.`
  }
  console.error(
    error instanceof Error && error.constructor === Error
      ? error.message
      : databaseFailure
  )
  process.exitCode = 1
})
