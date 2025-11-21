
'use server';

import { NextResponse, NextRequest } from 'next/server';
import { encrypt } from '@/lib/crypto';

// Esta API Route recebe os dados de localização do frontend (dashboard)
// e os retransmite para o webhook do Laravel.
export async function POST(request: NextRequest) {
    console.log('[API /api/rastreamento] Rota chamada.');

    let driverId, lat, lng;
    
    try {
        const body = await request.json();
        driverId = body.driverId;
        lat = body.lat;
        lng = body.lng;
        console.log('[API /api/rastreamento] Dados recebidos:', { driverId, lat, lng });
    } catch (e) {
        console.error('[API /api/rastreamento] ERRO: Falha ao processar o corpo da requisição JSON.', e);
        return NextResponse.json({ success: false, message: 'Corpo da requisição inválido ou não é um JSON.' }, { status: 400 });
    }

    if (!driverId || lat === undefined || lng === undefined) {
        console.warn('[API /api/rastreamento] AVISO: Dados de localização incompletos.');
        return NextResponse.json(
            { success: false, message: 'Dados de localização incompletos.' },
            { status: 400 }
        );
    }
    
    const laravelUrl = process.env.LARAVEL_WEBHOOK_URL;
    console.log(`[API /api/rastreamento] URL do Webhook Laravel: ${laravelUrl}`);

    if (!laravelUrl) {
        const errorMsg = 'A URL do webhook do Laravel (LARAVEL_WEBHOOK_URL) não está configurada no ambiente do servidor.';
        console.error(`[API /api/rastreamento] ERRO CRÍTICO: ${errorMsg}`);
        return NextResponse.json({ success: false, message: errorMsg }, { status: 500 });
    }

    try {
        const payload = { driverId, lat, lng };
        const encryptedData = encrypt(JSON.stringify(payload));
        
        const bodyToSend = JSON.stringify({ encryptedData: encryptedData });
        console.log('[API /api/rastreamento] Enviando para o Laravel:', bodyToSend);

        const response = await fetch(laravelUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: bodyToSend,
        });
        
        console.log(`[API /api/rastreamento] Resposta do Laravel - Status: ${response.status}`);

        if (!response.ok) {
            const responseBody = await response.text();
            const errorMsg = `O webhook do Laravel respondeu com status ${response.status}.`;
            console.error(`[API /api/rastreamento] ERRO na resposta do Laravel: ${errorMsg}`, `Corpo da Resposta: ${responseBody}`);
            return NextResponse.json({ success: false, message: errorMsg, laravelResponse: responseBody }, { status: response.status });
        }

        const responseData = await response.json();
        console.log('[API /api/rastreamento] Sucesso! Resposta do Laravel:', responseData);
        return NextResponse.json(responseData);

    } catch (error) {
        let errorMessage = 'Falha CRÍTICA ao tentar se comunicar com o servidor Laravel.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error('[API /api/rastreamento] ERRO DE FETCH:', error);
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}
