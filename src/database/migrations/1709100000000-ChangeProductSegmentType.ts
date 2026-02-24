import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChangeProductSegmentType1709100000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'products',
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
            'products',
            'segment',
            new TableColumn({
                name: 'segment',
                type: 'enum',
                enum: ['Residencial', 'Comercial'],
            })
        );
    }
}
