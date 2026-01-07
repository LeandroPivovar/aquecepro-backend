import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProposalsTable1700000007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'proposals',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'segment',
            type: 'enum',
            enum: ['piscina', 'residencial'],
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'client_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'client_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'client_phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'is_new_client',
            type: 'boolean',
            default: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Criar foreign key para user_id
    await queryRunner.createForeignKey(
      'proposals',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key
    const table = await queryRunner.getTable('proposals');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('user_id') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('proposals', foreignKey);
    }

    await queryRunner.dropTable('proposals');
  }
}


