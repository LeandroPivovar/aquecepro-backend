import { createConnection } from 'mysql2/promise';
import { config } from 'dotenv';
import { resolve, join } from 'path';

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto backend
const envPath = process.env.NODE_ENV === 'production' 
  ? join(process.cwd(), '.env')
  : resolve(__dirname, '../../../.env');
  
config({ path: envPath });

async function createDatabase() {
  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const databaseName = process.env.DB_NAME || 'aquecepro';

  try {
    // Criar o banco de dados se não existir
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`✅ Banco de dados '${databaseName}' criado ou já existe!`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar banco de dados:', error);
    await connection.end();
    process.exit(1);
  }
}

createDatabase();

