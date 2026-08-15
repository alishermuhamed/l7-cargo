import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddClientEntity1786808443379 implements MigrationInterface {
  name = 'AddClientEntity1786808443379'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            TRUNCATE TABLE "parcel_status_history", "parcels_import", "parcel", "account", "session", "verification", "user" CASCADE
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel" DROP CONSTRAINT "FK_48f4fcb8a5cd2f5b29166912240"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_56f28841fe433cf13f8685f9bc"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_48f4fcb8a5cd2f5b2916691224"
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel"
                RENAME COLUMN "userId" TO "clientId"
        `)
    await queryRunner.query(`
            CREATE TABLE "client" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "code" integer NOT NULL,
                "legacyPhoneRaw" text,
                "legacyPhoneNormalized" text,
                CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_3331ba630bece961ed0e0ab1dc" ON "client" ("code")
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_dc5d00fcd1b6f826624077eff1" ON "client" ("legacyPhoneNormalized")
        `)
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "clientId"
        `)
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "clientId" uuid NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "UQ_56f28841fe433cf13f8685f9bc1" UNIQUE ("clientId")
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel"
            ALTER COLUMN "clientId"
            SET NOT NULL
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_429692a1adc5e3036878922d21" ON "parcel" ("clientId")
        `)
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "FK_56f28841fe433cf13f8685f9bc1" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel"
            ADD CONSTRAINT "FK_429692a1adc5e3036878922d211" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            TRUNCATE TABLE "parcel_status_history", "parcels_import", "parcel", "account", "session", "verification", "user" CASCADE
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel" DROP CONSTRAINT "FK_429692a1adc5e3036878922d211"
        `)
    await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "FK_56f28841fe433cf13f8685f9bc1"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_429692a1adc5e3036878922d21"
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel"
            ALTER COLUMN "clientId" DROP NOT NULL
        `)
    await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT "UQ_56f28841fe433cf13f8685f9bc1"
        `)
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "clientId"
        `)
    await queryRunner.query(`
            ALTER TABLE "user"
            ADD "clientId" SERIAL NOT NULL
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_dc5d00fcd1b6f826624077eff1"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_3331ba630bece961ed0e0ab1dc"
        `)
    await queryRunner.query(`
            DROP TABLE "client"
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel"
                RENAME COLUMN "clientId" TO "userId"
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_48f4fcb8a5cd2f5b2916691224" ON "parcel" ("userId")
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_56f28841fe433cf13f8685f9bc" ON "user" ("clientId")
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel"
            ADD CONSTRAINT "FK_48f4fcb8a5cd2f5b29166912240" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `)
  }
}
