import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddClientDeletedAtToParcel1791713298338 implements MigrationInterface {
  name = 'AddClientDeletedAtToParcel1791713298338'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel"
            ADD "clientDeletedAt" TIMESTAMP WITH TIME ZONE
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel" DROP COLUMN "clientDeletedAt"
        `)
  }
}
