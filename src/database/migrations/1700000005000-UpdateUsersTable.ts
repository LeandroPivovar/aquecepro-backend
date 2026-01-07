import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateUsersTable1700000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna type
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'type',
        type: 'enum',
        enum: ['usuario', 'lead', 'cliente'],
        default: "'usuario'",
      }),
    );

    // Adicionar coluna store_id
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'store_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // Criar foreign key para store_id
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD CONSTRAINT \`FK_users_store_id\`
      FOREIGN KEY (\`store_id\`)
      REFERENCES \`stores\`(\`id\`)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key
    await queryRunner.query(`
      ALTER TABLE \`users\`
      DROP FOREIGN KEY \`FK_users_store_id\`
    `);

    // Remover colunas
    await queryRunner.dropColumn('users', 'store_id');
    await queryRunner.dropColumn('users', 'type');
  }
}

