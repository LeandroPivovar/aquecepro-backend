import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeCategorySegmentType1708800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'categories',
            'segment',
            new TableColumn({
                name: 'segment',
                type: 'varchar',
                length: '255',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'categories',
            'segment',
            new TableColumn({
                name: 'segment',
                type: 'enum',
                enum: ['Residencial', 'Comercial'],
            })
        );
    }
}
