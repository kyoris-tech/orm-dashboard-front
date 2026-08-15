'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { OrmLogo } from '@/components/ui/OrmLogo';
import { FadeIn } from '@/components/motion/FadeIn';
import { useLoginMutation } from '../hooks/use-login-mutation';

const REMEMBERED_EMAIL_KEY = 'orm:email';
const DEFAULT_ERROR_MESSAGE = 'Falha no login. Verifique suas credenciais.';

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState(() =>
    typeof window === 'undefined' ? '' : (window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? ''),
  );
  const [password, setPassword] = useState('');

  const errorMessage = useMemo(() => {
    if (!loginMutation.isError) {
      return null;
    }

    const error = loginMutation.error;

    if (isAxiosError<{ message?: string }>(error)) {
      return error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE;
    }

    return DEFAULT_ERROR_MESSAGE;
  }, [loginMutation.isError, loginMutation.error]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
          router.push('/home');
          router.refresh();
        },
      },
    );
  }

  return (
    <div className="relative flex flex-col h-[75vh] overflow-hidden w-full items-center justify-center">
      <FadeIn className="flex flex-col items-center justify-between">
        <div className="cursor-default mb-10">
          <OrmLogo width={167} height={102} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-10 w-full">
          <div className="flex flex-col gap-6">
            <Input label="Usuário:" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

            <PasswordInput label="Senha" value={password} onChange={(event) => setPassword(event.target.value)} required />

            {errorMessage && <p className="text-danger text-sm text-center">{errorMessage}</p>}
          </div>

          <Button type="submit" loading={loginMutation.isPending} className="!bg-accent !h-[50px] w-[143px] !rounded-full">
            Acessar Orm
          </Button>
        </form>
      </FadeIn>
    </div>
  );
}
