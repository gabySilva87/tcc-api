'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.push('/');
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleLogout} 
      disabled={isPending}
      aria-label="Sair"
    >
      {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
    </Button>
  );
}
