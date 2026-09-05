import { ManualFigure } from '../ManualFigure';
import { ManualSteps, ManualStep } from '../ManualSteps';
import { ManualTable } from '../ManualTable';
import { ManualCallout } from '../ManualCallout';
import type { ManualContentProps } from '../../types';

export function AccessSection({ isAdmin }: ManualContentProps) {
  return (
    <>
      <ManualFigure src="/manual/01-login.png" alt="Tela de login da Orm, com campos de usuário e senha" caption="Tela de entrada" />

      <ManualSteps>
        <ManualStep>Acesse o endereço da Orm da sua empresa.</ManualStep>
        <ManualStep>
          Informe o <strong>e-mail</strong> cadastrado no campo <em>Usuário</em>.
        </ManualStep>
        <ManualStep>
          Informe a <strong>senha</strong>.
        </ManualStep>
        <ManualStep>
          Clique em <strong>Acessar Orm</strong>.
        </ManualStep>
      </ManualSteps>

      <p>
        A sessão dura <strong>1 hora</strong>. Passado esse tempo, o sistema pede login novamente — é
        uma proteção para o caso de o computador ficar aberto sem supervisão.
      </p>

      <h3>Os três tipos de acesso</h3>

      <p>O que você vê no sistema depende do seu perfil:</p>

      <ManualTable
        headers={['Perfil', 'O que pode fazer']}
        rows={[
          ['Recrutador', 'Importar currículos, analisar candidatos, conduzir processos seletivos e publicar vagas.'],
          ['Moderador', 'Tudo o que o recrutador faz, mais bloquear ou reativar usuários da própria empresa.'],
          [
            'Administrador',
            <>
              Tudo, mais a área de <strong>Administração</strong>: empresas, usuários, planos e
              auditoria.
            </>,
          ],
        ]}
      />

      <ManualCallout title="Este manual segue o seu perfil">
        <p>
          {isAdmin
            ? 'Você está vendo a versão de administrador, com as seções e ações que só o seu perfil acessa.'
            : 'Você está vendo as seções correspondentes ao seu perfil. Recursos exclusivos de administrador não aparecem aqui, porque não estão disponíveis para você no sistema.'}
        </p>
      </ManualCallout>

      <h3>O menu</h3>

      <p>
        Clique no seu nome, no canto superior direito, para abrir o menu. Ali ficam{' '}
        <strong>Início</strong>, <strong>Relatórios</strong>, <strong>Manual</strong>
        {isAdmin ? (
          <>
            , <strong>Administração</strong>
          </>
        ) : null}{' '}
        e a opção de <strong>Sair</strong>.
      </p>

      <ManualCallout title="Dica">
        <p>Sempre use Sair ao terminar, principalmente em computador compartilhado.</p>
      </ManualCallout>
    </>
  );
}
