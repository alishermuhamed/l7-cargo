import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameClientCodeAlias1792852621834 implements MigrationInterface {
  name = 'RenameClientCodeAlias1792852621834'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "legacy_client_code_alias" RENAME TO "client_code_alias"'
    )
    await queryRunner.query(
      'ALTER TABLE "client_code_alias" RENAME CONSTRAINT "PK_38123ec378542a8797e98c9d41e" TO "PK_86ffd84bc856e5e17b144b39eca"'
    )
    await queryRunner.query(
      'ALTER TABLE "client_code_alias" RENAME CONSTRAINT "CHK_23b5a5f7aabf1f3177337e2cb8" TO "CHK_5159aa58c46a24c3c721708b42"'
    )
    await queryRunner.query(
      'ALTER TABLE "client_code_alias" RENAME CONSTRAINT "FK_1a544f6fd0fc681d648161a7fa6" TO "FK_eecda0db1664d88d26de7daaa82"'
    )
    await queryRunner.query(
      'ALTER INDEX "IDX_5b2a44c29a2bff57fb0bc80942" RENAME TO "IDX_117b462c9877148674ce943875"'
    )
    await queryRunner.query(
      'ALTER INDEX "IDX_1a544f6fd0fc681d648161a7fa" RENAME TO "IDX_eecda0db1664d88d26de7daaa8"'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "client_code_alias" RENAME TO "legacy_client_code_alias"'
    )
    await queryRunner.query(
      'ALTER TABLE "legacy_client_code_alias" RENAME CONSTRAINT "PK_86ffd84bc856e5e17b144b39eca" TO "PK_38123ec378542a8797e98c9d41e"'
    )
    await queryRunner.query(
      'ALTER TABLE "legacy_client_code_alias" RENAME CONSTRAINT "CHK_5159aa58c46a24c3c721708b42" TO "CHK_23b5a5f7aabf1f3177337e2cb8"'
    )
    await queryRunner.query(
      'ALTER TABLE "legacy_client_code_alias" RENAME CONSTRAINT "FK_eecda0db1664d88d26de7daaa82" TO "FK_1a544f6fd0fc681d648161a7fa6"'
    )
    await queryRunner.query(
      'ALTER INDEX "IDX_117b462c9877148674ce943875" RENAME TO "IDX_5b2a44c29a2bff57fb0bc80942"'
    )
    await queryRunner.query(
      'ALTER INDEX "IDX_eecda0db1664d88d26de7daaa8" RENAME TO "IDX_1a544f6fd0fc681d648161a7fa"'
    )
  }
}
