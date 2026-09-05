import { ManualCallout } from '../ManualCallout';
import type { ManualContentProps } from '../../types';

export function PlansSection({ isAdmin }: ManualContentProps) {
  return (
    <>
      <p>Cada empresa tem um plano, e o plano define três coisas:</p>

      <ul>
        <li>
          Quantos <strong>usuários ativos</strong> a empresa pode ter
        </li>
        <li>
          Quantos <strong>currículos por mês</strong> podem ser processados
        </li>
        <li>
          Quais <strong>recursos</strong> ficam liberados: Vagas publicadas, Processos seletivos e
          Relatórios
        </li>
      </ul>

      <p>
        Quando um recurso não está no plano, a área aparece com um aviso de indisponibilidade em vez
        do conteúdo. Nada quebra — o sistema apenas indica que aquilo exige upgrade.
      </p>

      <ManualCallout tone="warning" title="A cota de currículos é mensal">
        <p>
          Ela zera no começo de cada mês. Se a importação for recusada por limite, ou você aguarda a
          virada do mês, ou {isAdmin ? 'troca o plano da empresa' : 'fala com o administrador sobre upgrade'}.
        </p>
      </ManualCallout>

      <ManualCallout title="Onde acompanhar">
        <p>
          O consumo atual do plano — usuários e currículos do mês — fica visível no sistema, então dá
          para perceber que a cota está no fim antes de ela acabar.
          {isAdmin ? ' Em Administração → Empresas você troca o plano de qualquer empresa.' : ''}
        </p>
      </ManualCallout>
    </>
  );
}
