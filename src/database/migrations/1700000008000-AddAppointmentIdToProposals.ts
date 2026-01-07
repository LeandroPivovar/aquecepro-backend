import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddAppointmentIdToProposals1700000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna appointment_id
    await queryRunner.addColumn(
      'proposals',
      new TableColumn({
        name: 'appointment_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // Criar foreign key para appointment_id
    await queryRunner.createForeignKey(
      'proposals',
      new TableForeignKey({
        columnNames: ['appointment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'appointments',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key
    const table = await queryRunner.getTable('proposals');
    const foreignKey = table?.foreignKeys.find((fk) => fk.columnNames.indexOf('appointment_id') !== -1);
    if (foreignKey) {
      await queryRunner.dropForeignKey('proposals', foreignKey);
    }

    // Remover coluna
    await queryRunner.dropColumn('proposals', 'appointment_id');
  }
}


