import { MigrationInterface, QueryRunner } from 'typeorm'

export class ConvertAchievedAtToDateOnly1783368829744 implements MigrationInterface {
  name = 'ConvertAchievedAtToDateOnly1783368829744'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel_status_history"
            ALTER COLUMN "achievedAt" TYPE DATE
            USING ("achievedAt" AT TIME ZONE 'UTC')::date
        `)
    await queryRunner.query(`
            ALTER TABLE "parcels_import"
            ALTER COLUMN "achievedAt" TYPE DATE
            USING ("achievedAt" AT TIME ZONE 'UTC')::date
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcels_import"
            ALTER COLUMN "achievedAt" TYPE TIMESTAMP WITH TIME ZONE
            USING ("achievedAt"::timestamp AT TIME ZONE 'UTC')
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel_status_history"
            ALTER COLUMN "achievedAt" TYPE TIMESTAMP WITH TIME ZONE
            USING ("achievedAt"::timestamp AT TIME ZONE 'UTC')
        `)
  }
}
