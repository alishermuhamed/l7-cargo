import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAchievedAtToParcelsImport1783197115439 implements MigrationInterface {
  name = 'AddAchievedAtToParcelsImport1783197115439'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcels_import"
            ADD "achievedAt" TIMESTAMP WITH TIME ZONE
        `)
    await queryRunner.query(`
            UPDATE "parcels_import"
            SET "achievedAt" = COALESCE("committedAt", "createdAt")
            WHERE "achievedAt" IS NULL
        `)
    await queryRunner.query(`
            ALTER TABLE "parcels_import"
            ALTER COLUMN "achievedAt" SET NOT NULL
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcels_import" DROP COLUMN "achievedAt"
        `)
  }
}
