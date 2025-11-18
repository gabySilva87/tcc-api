'use server';

import { NextResponse, NextRequest } from 'next/server';
import { encrypt } from '@/lib/crypto'; // Importa nossa função de criptografia

/**
 * API "Ponte" para receber a localização do motorista, criptografá-la
 * e retransmiti-la para um webhook externo (Laravel).
 * URL: /api/rastreamento
 */
export async function POST(
  request: NextRequest,
) {
    // Pega todos os dados do corpo da requisição
    const { driverId, lat, lng } = await request.json();

    // Valida se todos os dados necessários foram recebidos.
    if (!driverId || lat === undefined || lng === undefined) {
        return NextResponse.json({ success: false, message: 'Dados incompletos (ID do motorista, latitude ou longitude faltando).' }, { status: 400 });
    }

    try {
        const externalWebhookUrl = process.env.LARAVEL_WEBHOOK_URL;
        
        // Verifica se a URL do webhook está configurada no ambiente.
        if (!externalWebhookUrl) {
            console.warn('[AVISO DE RASTREAMENTO] A variável LARAVEL_WEBHOOK_URL não está configurada no arquivo .env.local. A localização não será enviada.');
            // Responde com sucesso, mas informa que nada foi enviado.
            return NextResponse.json({ 
                success: true, 
                message: 'Localização recebida, mas o webhook não está configurado. A localização não foi enviada para o sistema externo.' 
            });
        }
        
        // 1. Prepara o payload (os dados a serem enviados) como uma string JSON.
        const payload = JSON.stringify({ driverId, lat, lng });

        // 2. Criptografa o payload usando a função `encrypt`.
        const encryptedData = encrypt(payload);

        // 3. Envia os dados criptografados para o webhook do Laravel.
        // A chamada é feita sem `await` de propósito, para não bloquear
        // a resposta para o aplicativo do motorista (fire and forget).
        fetch(externalWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encryptedData }), // Envia no formato esperado pelo Laravel
        }).catch(error => {
          // Em caso de erro de rede (ex: Laravel offline), apenas loga o erro no servidor do Next.js.
          console.error('[ERRO DE WEBHOOK] Falha ao contatar o servidor Laravel:', error);
        });

        // 4. Responde imediatamente com sucesso para o app do motorista.
        return NextResponse.json({ success: true, message: 'Envio da localização para o servidor externo foi iniciado.' });

    } catch (error) {
        console.error('[ERRO NA API DE RASTREAMENTO]:', error);
        return NextResponse.json(
            { success: false, message: 'Ocorreu um erro interno ao processar a localização.' },
            { status: 500 }
        );
    }
}
