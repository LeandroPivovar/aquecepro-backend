import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCitiesTable1700000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de cidades
    await queryRunner.createTable(
      new Table({
        name: 'cities',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 7,
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

    // Criar tabela de dados mensais
    await queryRunner.createTable(
      new Table({
        name: 'city_monthly_data',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'city_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'month',
            type: 'enum',
            enum: [
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ],
          },
          {
            name: 'temperature',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'solar_radiation',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'wind_speed',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
        ],
      }),
      true,
    );

    // Criar foreign key para city_id
    await queryRunner.query(`
      ALTER TABLE \`city_monthly_data\`
      ADD CONSTRAINT \`FK_city_monthly_data_city_id\`
      FOREIGN KEY (\`city_id\`)
      REFERENCES \`cities\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('city_monthly_data');
    await queryRunner.dropTable('cities');
  }
}

