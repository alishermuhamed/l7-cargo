import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddClientId1778411635666 implements MigrationInterface {
  name = 'AddClientId1778411635666'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "clientId" SERIAL NOT NULL
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_56f28841fe433cf13f8685f9bc" ON "user" ("clientId")
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_56f28841fe433cf13f8685f9bc"
        `)
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "clientId"
        `)
  }
}
