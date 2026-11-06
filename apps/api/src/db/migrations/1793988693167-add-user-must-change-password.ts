import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserMustChangePassword1793988693167 implements MigrationInterface {
  name = 'AddUserMustChangePassword1793988693167'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "mustChangePassword" boolean NOT NULL DEFAULT false
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "mustChangePassword"
        `)
  }
}
