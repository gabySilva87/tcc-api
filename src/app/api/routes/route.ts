import { NextResponse } from 'next/server';

// Esta é a rota da API que se conectará ao seu banco de dados MySQL.
// Para fazer isso funcionar, você precisará de uma biblioteca para se conectar ao MySQL.
// A mais comum para Node.js é a `mysql2`.
//
// 1. Instale o pacote:
//    npm install mysql2
//
// 2. Importe o pacote aqui:
//    import mysql from 'mysql2/promise';
//
// 3. Preencha a lógica de conexão e consulta abaixo.

export async function GET(request: Request) {
  try {
    // =======================================================================
    // PASSO 1: INSERIR A LÓGICA DE CONEXÃO COM O MYSQL AQUI
    // =======================================================================
    // Crie a conexão com seu banco de dados.
    // IMPORTANTE: Guarde suas credenciais (host, user, password, database)
    // de forma segura, usando variáveis de ambiente (process.env), e não
    // diretamente no código.
    /*
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    */

    // =======================================================================
    // PASSO 2: INSERIR A CONSULTA SQL AQUI
    // =======================================================================
    // Execute a consulta para buscar as rotas. Você pode precisar de um ID de motorista,
    // que pode ser passado como um parâmetro de consulta na URL.
    /*
    const [rows, fields] = await connection.execute('SELECT * FROM rotas');
    */

    // =======================================================================
    // PASSO 3: RETORNAR OS DADOS
    // =======================================================================
    // Depois de buscar os dados, feche a conexão.
    // await connection.end();

    // Por enquanto, vamos retornar dados de exemplo para que o frontend possa ser construído.
    // Substitua este array `mockData` pelos `rows` da sua consulta SQL.
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
