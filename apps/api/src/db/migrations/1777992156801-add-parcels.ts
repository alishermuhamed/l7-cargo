import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddParcels1777992156801 implements MigrationInterface {
  name = 'AddParcels1777992156801'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "parcel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "trackingNumber" text NOT NULL,
                "userId" uuid,
                "status" text,
                "source" text,
                "description" text,
                "weightKg" numeric(7, 3),
                "deliveryFee" numeric(14, 4),
                "notes" text,
                CONSTRAINT "PK_c01e9fed31b7433a00942d506b1" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_ec90506711a499d2dc486bc4d3" ON "parcel" ("trackingNumber")
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_48f4fcb8a5cd2f5b2916691224" ON "parcel" ("userId")
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel"
            ADD CONSTRAINT "FK_48f4fcb8a5cd2f5b29166912240" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel" DROP CONSTRAINT "FK_48f4fcb8a5cd2f5b29166912240"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_48f4fcb8a5cd2f5b2916691224"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ec90506711a499d2dc486bc4d3"
        `)
    await queryRunner.query(`
            DROP TABLE "parcel"
        `)
  }
}
