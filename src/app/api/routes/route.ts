import { NextResponse } from 'next/server';
// O pacote 'mysql2/promise' é ideal para usar com async/await.
import mysql from 'mysql2/promise';

// Esta é a rota da API que se conectará ao seu banco de dados MySQL.
// O pacote `mysql2` foi adicionado ao seu `package.json`.

export async function GET(request: Request) {
  try {
    // =======================================================================
    // PASSO 1: CONEXÃO COM O MYSQL
    // =======================================================================
    // As credenciais são lidas de forma segura a partir de variáveis de ambiente.
    // Crie um arquivo chamado `.env.local` na raiz do seu projeto e
    // adicione as suas credenciais, como no arquivo `.env.example`.
    
    /*
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    */

    // =======================================================================
    // PASSO 2: CONSULTA SQL
    // =======================================================================
    // Execute a consulta para buscar as rotas.
    // Você pode querer filtrar por ID do motorista, etc.
    /*
    const [rows, fields] = await connection.execute('SELECT * FROM rotas WHERE status = "pendente"');
    */

    // =======================================================================
    // PASSO 3: RETORNAR OS DADOS
    // =======================================================================
    // Após buscar os dados, feche a conexão.
    // await connection.end();

    // Por enquanto, vamos retornar dados de exemplo para que o frontend possa funcionar.
    // Descomente o código acima e substitua `mockData` por `rows` da sua consulta.
    const mockData = [
      { id: 1, title: "Nova Rota Atribuída (Exemplo)", description: "Entrega para o centro da cidade às 14h.", time: "5 min atrás", read: false },
      { id: 2, title: "Manutenção Agendada (Exemplo)", description: "Lembrete: Troca de óleo para amanhã.", time: "2 horas atrás", read: false },
      { id: 3, title: "Rota Concluída (Exemplo)", description: "Entrega #1024 foi concluída.", time: "1 dia atrás", read: true },
    ];

    // Quando a conexão com o banco de dados estiver pronta, troque `mockData` por `rows`.
    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Erro na API ao buscar rotas:', error);
    // Em caso de erro, retornamos uma resposta de erro do servidor.
    return NextResponse.json(
      { message: 'Ocorreu um erro ao buscar os dados das rotas.' },
      { status: 500 }
    );
  }
}
