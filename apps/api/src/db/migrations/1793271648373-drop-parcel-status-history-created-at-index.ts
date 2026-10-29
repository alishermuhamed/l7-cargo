import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropParcelStatusHistoryCreatedAtIndex1793271648373 implements MigrationInterface {
  name = 'DropParcelStatusHistoryCreatedAtIndex1793271648373'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f89c1907ed60f3bbfa054327f5"
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE INDEX "IDX_f89c1907ed60f3bbfa054327f5" ON "parcel_status_history" ("createdAt", "parcelId")
        `)
  }
}
