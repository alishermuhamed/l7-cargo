import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameParcelNotesToComments1786999166153 implements MigrationInterface {
  name = 'RenameParcelNotesToComments1786999166153'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel"
                RENAME COLUMN "notes" TO "comments"
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel"
                RENAME COLUMN "comments" TO "notes"
        `)
  }
}
