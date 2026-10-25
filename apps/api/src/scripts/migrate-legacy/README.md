# Supabase → Neon migration history

Migration date: October 25, 2026.

This directory preserves `migrate-legacy.ts` and the migration notes for historical
reference. The script imported legacy clients, profiles, accounts, parcels and
status history from Supabase into the application's PostgreSQL schema in Neon.
It was a standalone, one-time data migration, separate from application startup
and schema migrations.

## Import decisions

The import populated `client`, `client_code_alias`, `user`, `account`, `parcel`
and `parcel_status_history`.

- Parcel `53411`, which had an empty tracking number, was explicitly excluded,
  together with its history.
- Profiles without a matching Telegram client were retained under negative client
  codes and reported as unresolved. No positive code was guessed.
- Missing passwords and unparseable phone numbers were warnings. Profiles without
  passwords were retained without credential accounts; raw client phone values
  were preserved.
- Duplicate profile ownership, normalized profile phones or emails, invalid
  history, unknown statuses, incompatible numeric values, duplicate or missing
  tracking numbers and unresolved parcel ownership blocked the import.

## Mapping

- Clients are processed in numeric code order. The first (smallest) code per
  normalized phone is primary; other codes become aliases. Phone parsing uses the
  `libphonenumber-js` with Kazakhstan as the default country for legacy national
  formats: `+7…`, `7…`, `8…`, and valid ten-digit national numbers normalize to
  E.164. The whole field must parse as a phone; arbitrary text is not extracted.
  Explicit international numbers retain their country code.
- Each unmatched profile gets its own client with a negative primary code:
  `-1`, `-2`, etc., in source `user_id` UUID order. No positive code is guessed or
  allocated, including for possible phone-match candidates. Negative codes never
  become aliases. The same snapshot produces the same codes; changed source data
  may change their numbering. The client UUID is independently derived from
  `unresolved-client:<profiles.user_id>` and remains stable across snapshots.
  Preserve the profile's raw and normalized phone on this client, and connect
  its user and parcels through the normal `clientId` foreign keys. The report's
  `unresolvedClients` lists profile UUID, client UUID, code, imported parcel count,
  and phone/password availability. Duplicate normalized profile phones still
  block import, including when neither profile matches a Telegram client.
- Profiles retain `user_id` as the new user UUID. Explicit legacy `user_roles.admin` becomes `admin`; `customer` or no role
  becomes `client`. Unknown roles or roles without profiles block import. Neither their phone nor email is marked verified. Missing email uses
  `<normalized-phone>@phone.local`, or `legacy-<user_id>@phone.local` when the
  phone is also unavailable. Unparseable or missing profile phones become NULL
  and produce `profile-phone-not-normalizable`; no number is invented. These
  accounts and parcels are retained, but phone login requires manual recovery.
  Names concatenate first and last names.
- Original passwords are hashed using the installed `better-auth/crypto`
  `hashPassword`; credential accounts use `accountId = user.id`. No raw password
  is written to files or logs. Hashes are inserted only in the target account
  table; the manifest stores an aggregate digest, not individual password hashes.
- Parcels map `weight → weightKg`, `sum → deliveryFee`, `info → comments`.
  `product_link` is appended to the existing description on a new line.
  Hidden parcels receive the single import timestamp as `clientDeletedAt`.
  Parcels whose original `user_id` is NULL remain unassigned.
- History retains the latest achievement date per parcel/status, with larger
  numeric source history ID breaking equal-date ties. Current parcel status is
  the furthest delivery stage present in history, regardless of achievement
  dates, using the application's `PARCEL_STATUSES` order: left China, customs,
  ready for pickup, picked up. Parcels without history have NULL status.
- Original creation timestamps are retained; `updatedAt` starts at `createdAt`.
  For missing creation timestamps the import timestamp is used.
- Other IDs are deterministic from SHA-256 of
  `l7-cargo:supabase:v1:<kind>:<source-id>` using the UUID layout in `uuid()`.
  Kinds are `client`, `unresolved-client`, `alias`, `account`, `parcel`, and `history`; history source
  keys are `<legacy-parcel-id>:<new-status>`. This mapping is stable across runs
  and target branches. No random mapping file is needed.
- Legacy `telegram_id`, Telegram display names, and the separate `profiles.id`
  have no destination fields and are not imported. Keep the original database
  backed up if these need archival retention.

## Issued-parcel reconciliation after import

Immediately after the database migration, only one parcel had the “Получена”
(`picked_up`) status. Excel spreadsheets containing information about issued
parcels were also used to reconcile delivery statuses. In addition, all parcels
whose “Готова к выдаче” (`ready_for_pickup`) status was dated on or before
June 30, inclusive, were changed to “Получена” (`picked_up`).

These were separate post-import data updates. This script reads only the legacy
PostgreSQL tables: it does not read Excel files or apply the June 30 cutoff.

## Verification implemented by the script

The source was read in a consistent, read-only snapshot. Target inserts and
read-back verification were performed in a single transaction. Verification
compared row counts and SHA-256 digests of all imported fields, including
ownership, dates, decimal values, statuses, descriptions, aliases and password
hashes. History achievement dates were compared as calendar dates.

The verification manifest describes the initial import. The subsequent parcel
status corrections described above change that data, so the original manifest
no longer represents the corrected state. These checks cover stored data; they
do not validate application sign-in or authorization behavior.
