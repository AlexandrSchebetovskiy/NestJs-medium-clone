import { MigrationInterface, QueryRunner } from "typeorm";

export class $npmConfigName1667483460688 implements MigrationInterface {
    name = '$npmConfigName1667483460688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" ("id" integer GENERATED BY DEFAULT AS IDENTITY NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tags"`);
    }

}