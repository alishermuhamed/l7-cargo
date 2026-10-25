import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLegacyClientCodeAlias1792260357130 implements MigrationInterface {
  name = 'AddLegacyClientCodeAlias1792260357130'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "legacy_client_code_alias" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "code" integer NOT NULL,
                "clientId" uuid NOT NULL,
                CONSTRAINT "CHK_23b5a5f7aabf1f3177337e2cb8" CHECK ("code" > 0),
                CONSTRAINT "PK_38123ec378542a8797e98c9d41e" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_5b2a44c29a2bff57fb0bc80942" ON "legacy_client_code_alias" ("code")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_1a544f6fd0fc681d648161a7fa" ON "legacy_client_code_alias" ("clientId")
        `)
    await queryRunner.query(`
            ALTER TABLE "legacy_client_code_alias"
            ADD CONSTRAINT "FK_1a544f6fd0fc681d648161a7fa6" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "legacy_client_code_alias" DROP CONSTRAINT "FK_1a544f6fd0fc681d648161a7fa6"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_1a544f6fd0fc681d648161a7fa"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5b2a44c29a2bff57fb0bc80942"
        `)
    await queryRunner.query(`
            DROP TABLE "legacy_client_code_alias"
        `)
  }
}
