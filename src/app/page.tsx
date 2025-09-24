import { LoginForm } from '@/components/login-form';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 pt-16 md:justify-center md:pt-4">
      <LoginForm />
    </main>
  );
}
