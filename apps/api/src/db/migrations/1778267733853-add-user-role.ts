import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserRole1778267733853 implements MigrationInterface {
  name = 'AddUserRole1778267733853'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" ADD "role" text
        `)
    await queryRunner.query(`
            UPDATE "user"
            SET "role" = 'client'
            WHERE "role" IS NULL
        `)
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "role" SET DEFAULT 'client'
        `)
    await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "role" SET NOT NULL
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "role"
        `)
  }
}
