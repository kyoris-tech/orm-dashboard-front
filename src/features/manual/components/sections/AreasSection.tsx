import { ManualTable } from '../ManualTable';

export function AreasSection() {
  return (
    <>
      <p>
        Ao entrar, você cai na tela de <strong>Início</strong>. No topo, ao lado do botão azul com o
        nome da página, há quatro abas, que são o caminho natural do trabalho — da esquerda para a
        direita:
      </p>

      <ManualTable
        headers={['Aba', 'Para quê']}
        rows={[
          ['Importar Arquivos', 'Enviar currículos para a Orm ler'],
          ['Analisar Candidatos', 'Buscar, filtrar e comparar quem já está na base'],
          ['Processos Seletivos', 'Conduzir as seleções em andamento'],
          ['Vagas Publicadas', 'Criar vagas e divulgar o link público'],
        ]}
      />

      <p>
        Você pode ir e voltar entre as abas livremente — nada se perde ao trocar. A aba escolhida
        fica gravada no endereço da página, então ao atualizar (F5) você continua onde estava.
      </p>

      <p>
        As abas aparecem só em <strong>Início</strong> e, para administradores, em{' '}
        <strong>Administração</strong>. Em <strong>Relatórios</strong> e no <strong>Manual</strong> o
        topo mostra apenas o botão com o nome da página.
      </p>
    </>
  );
}
