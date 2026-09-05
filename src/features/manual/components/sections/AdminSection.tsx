import { ManualFigure } from '../ManualFigure';
import { ManualSteps, ManualStep } from '../ManualSteps';
import { ManualTable } from '../ManualTable';
import { ManualCallout } from '../ManualCallout';

export function AdminSection() {
  return (
    <>
      <p>
        Área visível apenas para <strong>administradores</strong>, acessível pelo menu. Tem cinco
        abas.
      </p>

      <ManualFigure
        src="/manual/08-admin.png"
        alt="Área de Administração, na aba Empresas"
        caption="Área de Administração"
      />

      <ManualTable
        headers={['Aba', 'Para quê']}
        rows={[
          ['Empresas', 'Cadastrar e editar empresas, trocar o plano, bloquear e gerar nova chave de acesso'],
          ['Usuários', 'Criar usuários, definir o perfil, redefinir senha, bloquear e excluir'],
          ['Métricas', 'Números consolidados da plataforma'],
          ['Auditoria', 'Histórico de tudo o que foi feito, com autor e data'],
          ['Planos', 'Criar e editar planos, com limites e recursos'],
        ]}
      />

      <h3>Criar um usuário</h3>

      <ManualSteps>
        <ManualStep>
          Vá em <strong>Administração → Usuários</strong>.
        </ManualStep>
        <ManualStep>
          Clique em <strong>Adicionar Usuário</strong>.
        </ManualStep>
        <ManualStep>Informe nome, e-mail, empresa, perfil e uma senha inicial.</ManualStep>
        <ManualStep>Salve e entregue a senha à pessoa, pedindo que troque no primeiro acesso.</ManualStep>
      </ManualSteps>

      <h3>Bloquear em vez de excluir</h3>

      <p>
        <strong>Bloquear</strong> tira o acesso mas mantém o histórico da pessoa.{' '}
        <strong>Excluir</strong> também preserva o histórico — nada é apagado de verdade, para que a
        auditoria continue completa.
      </p>

      <ManualCallout tone="warning" title="Atenção">
        <p>
          Você não consegue excluir o seu próprio usuário, nem excluir uma empresa que ainda tenha
          usuários ativos. São travas propositais.
        </p>
      </ManualCallout>

      <h3>Auditoria</h3>

      <p>
        Registra alterações de status e senha, mudanças em empresas, o ciclo de vida de vagas e
        processos, e as ações sobre currículos — inclusive quem baixou qual PDF. É o que responde
        “quem fez isso e quando”.
      </p>
    </>
  );
}
