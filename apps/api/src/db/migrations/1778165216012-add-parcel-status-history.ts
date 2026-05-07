import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddParcelStatusHistory1778165216012 implements MigrationInterface {
  name = 'AddParcelStatusHistory1778165216012'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "parcel_status_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "parcelId" uuid NOT NULL,
                "status" text NOT NULL,
                CONSTRAINT "PK_698b7795752b64c6c530d048653" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE INDEX "IDX_f89c1907ed60f3bbfa054327f5" ON "parcel_status_history" ("parcelId", "createdAt")
        `)
    await queryRunner.query(`
            ALTER TABLE "parcel_status_history"
            ADD CONSTRAINT "FK_8865aa1f4ff9de1320d0a8a91ac" FOREIGN KEY ("parcelId") REFERENCES "parcel"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "parcel_status_history" DROP CONSTRAINT "FK_8865aa1f4ff9de1320d0a8a91ac"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_f89c1907ed60f3bbfa054327f5"
        `)
    await queryRunner.query(`
            DROP TABLE "parcel_status_history"
        `)
  }
}
