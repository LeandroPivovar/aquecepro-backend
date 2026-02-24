import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTypeToCategories1708700000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'categories',
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: ['segmento', 'equipamento'],
                default: "'segmento'",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('categories', 'type');
    }
}
