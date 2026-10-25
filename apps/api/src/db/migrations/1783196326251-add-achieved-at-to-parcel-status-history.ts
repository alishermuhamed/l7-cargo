import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAchievedAtToParcelStatusHistory1783196326251
  implements MigrationInterface
{
  name = 'AddAchievedAtToParcelStatusHistory1783196326251'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel_status_history"
            ADD "achievedAt" TIMESTAMP WITH TIME ZONE
        `)
    await queryRunner.query(`
            UPDATE "parcel_status_history"
            SET "achievedAt" = "createdAt"
            WHERE "achievedAt" IS NULL
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel_status_history"
            ALTER COLUMN "achievedAt" SET NOT NULL
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel_status_history" DROP COLUMN "achievedAt"
        `)
  }
}
