import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategories1709200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Helper function to insert Categoria 1 and return its generated ID
        const insertCat1 = async (name: string, segment: string) => {
            // Create UUID first using TypeORM or let DB generate it via uuid()
            const newIdRaw = await queryRunner.query(`SELECT UUID() as id`);
            const newId = newIdRaw[0].id;

            await queryRunner.query(
                `INSERT INTO categories (id, name, type, segment, status, createdAt, updatedAt) 
         VALUES (?, ?, 'categoria 1', ?, 'active', NOW(), NOW())`,
                [newId, name, segment]
            );

            return newId;
        };

        // Helper function to insert Categoria 2 linked to a Parent ID
        const insertCat2 = async (name: string, segment: string, parentId: string) => {
            await queryRunner.query(
                `INSERT INTO categories (id, name, type, segment, parentId, status, createdAt, updatedAt) 
         VALUES (UUID(), ?, 'categoria 2', ?, ?, 'active', NOW(), NOW())`,
                [name, segment, parentId]
            );
        };

        // --- SEGMENTO RESIDENCIAL ---
        // Categoria 1: Equipamentos
        const equipResId = await insertCat1('Equipamentos', 'Residencial');
        // Categoria 2 for Equipamentos
        const equipamentosRes = [
            'Aquecedor a gás',
            'Bombas de circulacao',
            'Bomba de Calor',
            'Coletor solar',
            'Controlador digital',
            'Kit pressurizacao indireto',
            'Motobombas',
            'Pressurizador',
            'Reservatório',
        ];
        for (const cat2 of equipamentosRes) {
            await insertCat2(cat2, 'Residencial', equipResId);
        }

        // Categoria 1: Serviços
        const servicosResId = await insertCat1('Serviços', 'Residencial');
        // Categoria 2 for Serviços
        await insertCat2('Execução', 'Residencial', servicosResId);

        // --- SEGMENTO PISCINA ---
        const piscinaCategories = [
            'Aquecedores Solares',
            'Aquecedores a Gás',
            'Bombas de Calor',
            'Acessórios'
        ];
        for (const cat1 of piscinaCategories) {
            // By default they didn't have defined subcategories in the original code, but we must add them as Categoria 1
            await insertCat1(cat1, 'Piscina');
        }

        // --- SEGMENTO COMERCIAL (Optional addition from defaultCategories2) ---
        const defaultComercial = ["Baixa Pressão", "Alta Pressão", "Compacto", "Acumulação"];
        for (const cat1 of defaultComercial) {
            await insertCat1(cat1, 'Comercial');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove all seeded categories (DANGEROUS if users added their own, but since it's a seeder it's okay for now)
        await queryRunner.query(`DELETE FROM categories WHERE name IN (
      'Equipamentos', 'Serviços', 'Aquecedores Solares', 'Aquecedores a Gás', 'Bombas de Calor', 'Acessórios',
      'Aquecedor a gás', 'Bombas de circulacao', 'Coletor solar', 'Controlador digital', 
      'Kit pressurizacao indireto', 'Motobombas', 'Pressurizador', 'Reservatório', 'Execução',
      'Baixa Pressão', 'Alta Pressão', 'Compacto', 'Acumulação'
    )`);
    }
}
