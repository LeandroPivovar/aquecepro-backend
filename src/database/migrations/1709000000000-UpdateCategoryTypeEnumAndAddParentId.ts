import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateCategoryTypeEnumAndAddParentId1709000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Update the 'type' enum column to support the new values
        await queryRunner.changeColumn(
            'categories',
            'type',
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: ['categoria 1', 'categoria 2'],
                default: "'categoria 1'",
            })
        );

        // 2. Add 'parentId' column
        await queryRunner.addColumn(
            'categories',
            new TableColumn({
                name: 'parentId',
                type: 'varchar',
                length: '36',
                isNullable: true,
            })
        );

        // 3. Add Foreign Key for parentId -> id
        await queryRunner.createForeignKey(
            'categories',
            new TableForeignKey({
                name: 'FK_Categories_ParentId',
                columnNames: ['parentId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('categories', 'FK_Categories_ParentId');
        await queryRunner.dropColumn('categories', 'parentId');

        await queryRunner.changeColumn(
            'categories',
            'type',
            new TableColumn({
                name: 'type',
                type: 'enum',
                enum: ['segmento', 'equipamento'],
                default: "'segmento'",
            })
        );
    }
}
