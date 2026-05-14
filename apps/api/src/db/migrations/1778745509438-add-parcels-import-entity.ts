import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddParcelsImportEntity1778745509438 implements MigrationInterface {
  name = 'AddParcelsImportEntity1778745509438'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "parcels_import" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "isCommitted" boolean NOT NULL DEFAULT false,
                "parcelStatus" text NOT NULL,
                "committedAt" TIMESTAMP WITH TIME ZONE,
                "parsedData" jsonb NOT NULL,
                CONSTRAINT "PK_3f20b675f3e1b6e3f92317b3f5f" PRIMARY KEY ("id")
            )
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "parcels_import"
        `)
  }
}
