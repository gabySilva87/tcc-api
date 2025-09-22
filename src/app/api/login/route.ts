import { NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';

// This is a client-side auth instance, needed for signInWithEmailAndPassword
const auth = getAuth(app);

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    // First, verify the user exists with the Admin SDK
    try {
      await authAdmin.getUserByEmail(email);
    } catch (error: any) {
      // User does not exist in Firebase Authentication
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { success: false, message: 'Usuário não encontrado.' },
          { status: 404 }
        );
      }
      // Other Admin SDK error
      throw error;
    }

    // Then, attempt to sign in to verify the password.
    // This is done with the client SDK as the Admin SDK can't verify passwords directly.
    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error: any) { {
        // Password does not match
        return NextResponse.json(
          { success: false, message: 'Senha incorreta.' },
          { status: 401 }
        );
      }
    }
    
    // If both checks pass, login is successful
    return NextResponse.json({ success: true, message: 'Login bem-sucedido!' });

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Ocorreu um erro no servidor.' },
      { status: 500 }
    );
  }
}
