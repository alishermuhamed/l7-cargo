import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeParcelClientNullable1792252874197 implements MigrationInterface {
  name = 'MakeParcelClientNullable1792252874197'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parcel" ALTER COLUMN "clientId" DROP NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parcel" ALTER COLUMN "clientId" SET NOT NULL`
    )
  }
}
