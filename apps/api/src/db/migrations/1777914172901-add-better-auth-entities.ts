import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBetterAuthEntities1777914172901 implements MigrationInterface {
  name = 'AddBetterAuthEntities1777914172901'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "name" text NOT NULL,
                "email" text NOT NULL,
                "emailVerified" boolean NOT NULL DEFAULT false,
                "image" text,
                "phoneNumber" text,
                "phoneNumberVerified" boolean,
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email")
        `)
    await queryRunner.query(`
            CREATE TABLE "account" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "accountId" text NOT NULL,
                "providerId" text NOT NULL,
                "accessToken" text,
                "refreshToken" text,
                "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
                "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
                "scope" text,
                "idToken" text,
                "password" text,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE TABLE "session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "token" text NOT NULL,
                "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "ipAddress" text,
                "userAgent" text,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_232f8e85d7633bd6ddfad42169" ON "session" ("token")
        `)
    await queryRunner.query(`
            CREATE TABLE "verification" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "identifier" text NOT NULL,
                "value" text NOT NULL,
                "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id")
            )
        `)
    await queryRunner.query(`
            ALTER TABLE "account"
            ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
    await queryRunner.query(`
            ALTER TABLE "session"
            ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"
        `)
    await queryRunner.query(`
            ALTER TABLE "account" DROP CONSTRAINT "FK_60328bf27019ff5498c4b977421"
        `)
    await queryRunner.query(`
            DROP TABLE "verification"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_232f8e85d7633bd6ddfad42169"
        `)
    await queryRunner.query(`
            DROP TABLE "session"
        `)
    await queryRunner.query(`
            DROP TABLE "account"
        `)
    await queryRunner.query(`
            DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"
        `)
    await queryRunner.query(`
            DROP TABLE "user"
        `)
  }
}
