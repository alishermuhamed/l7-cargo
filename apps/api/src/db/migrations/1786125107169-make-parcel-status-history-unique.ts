import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeParcelStatusHistoryUnique1786125107169 implements MigrationInterface {
  name = 'MakeParcelStatusHistoryUnique1786125107169'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            WITH ranked_history AS (
                SELECT
                    "id",
                    ROW_NUMBER() OVER (
                        PARTITION BY "parcelId", "status"
                        ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
                    ) AS "rank"
                FROM "parcel_status_history"
            )
            DELETE FROM "parcel_status_history"
            WHERE "id" IN (
                SELECT "id"
                FROM ranked_history
                WHERE "rank" > 1
            )
        `)
    await queryRunner.query(`
            UPDATE "parcel" AS parcel
            SET "status" = current_status."status"
            FROM (
                SELECT DISTINCT ON ("parcelId")
                    "parcelId",
                    "status"
                FROM "parcel_status_history"
                ORDER BY
                    "parcelId",
                    CASE "status"
                        WHEN 'left_china' THEN 1
                        WHEN 'cleared_customs' THEN 2
                        WHEN 'ready_for_pickup' THEN 3
                        WHEN 'picked_up' THEN 4
                        ELSE 0
                    END DESC
            ) AS current_status
            WHERE parcel."id" = current_status."parcelId"
        `)
    await queryRunner.query(`
            UPDATE "parcel"
            SET "status" = NULL
            WHERE NOT EXISTS (
                SELECT 1
                FROM "parcel_status_history"
                WHERE "parcelId" = "parcel"."id"
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a4a46c4fee651d6644a85369b8" ON "parcel_status_history" ("parcelId", "status")
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_a4a46c4fee651d6644a85369b8"
        `)
  }
}
