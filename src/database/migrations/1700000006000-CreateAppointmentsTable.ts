import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAppointmentsTable1700000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'time',
            type: 'time',
          },
          {
            name: 'store_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'seller_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'client_id',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'address',
            type: 'text',
          },
          {
            name: 'duration',
            type: 'int',
            default: 60,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['scheduled', 'pending', 'completed', 'cancelled'],
            default: "'scheduled'",
          },
          {
            name: 'channel',
            type: 'enum',
            enum: ['google', 'presencial'],
            default: "'presencial'",
          },
          {
            name: 'auto_assign',
            type: 'boolean',
            default: false,
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

    // Criar foreign keys
    await queryRunner.query(`
      ALTER TABLE \`appointments\`
      ADD CONSTRAINT \`FK_appointments_store_id\`
      FOREIGN KEY (\`store_id\`)
      REFERENCES \`stores\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`appointments\`
      ADD CONSTRAINT \`FK_appointments_seller_id\`
      FOREIGN KEY (\`seller_id\`)
      REFERENCES \`users\`(\`id\`)
      ON DELETE SET NULL
      ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE \`appointments\`
      ADD CONSTRAINT \`FK_appointments_client_id\`
      FOREIGN KEY (\`client_id\`)
      REFERENCES \`users\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('appointments');
  }
}

