import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { decrypt } from '../../../lib/crypto';

// Handler para o método POST (Login)
export async function POST(req: Request) {
  const { usuario, senha } = await req.json();

  let connection;
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
  try {
    
    // =======================================================================
    // PASSO 1: CONEXÃO COM O BANCO DE DADOS MYSQL
    // =======================================================================
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const [rows] = await connection.execute(
      'SELECT id_motorista, nm_usuario, nr_senha, nm_motorista FROM tb_motorista WHERE nm_usuario = ?',
      [usuario]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      const driver = (rows as any)[0];
      const storedPassword = driver.nr_senha;
      let passwordMatches = false;

      if (storedPassword.startsWith('$2')) {
        passwordMatches = await bcrypt.compare(senha, storedPassword);
      } else {
        try {
          const decryptedPassword = decrypt(storedPassword);
          passwordMatches = senha === decryptedPassword;
        } catch (e) {
          console.error("Falha ao descriptografar a senha:", e);
          passwordMatches = false;
        }
      }

      if (passwordMatches) {
        await connection.execute(
          'UPDATE tb_motorista SET online_status = 1 WHERE id_motorista = ?',
          [driver.id_motorista]
        );

        return NextResponse.json({
          message: 'Login bem-sucedido!',
          driverName: driver.nm_motorista,
          driverId: driver.id_motorista,
        });
      } else {
        return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('[ERRO NA API DE LOGIN]:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Handler para o método PUT (Logout)
export async function PUT(req: Request) {
  const { driverId } = await req.json();

  if (!driverId) {
    return NextResponse.json({ message: 'ID do motorista não fornecido.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: 3307,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    await connection.execute(
      'UPDATE tb_motorista SET online_status = 0 WHERE id_motorista = ?',
      [driverId]
    );

    return NextResponse.json({ message: 'Logout bem-sucedido!' });
  } catch (error: any) {
    console.error('[ERRO NA API DE LOGOUT]:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
