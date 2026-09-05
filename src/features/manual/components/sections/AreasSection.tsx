import { ManualTable } from '../ManualTable';

export function AreasSection() {
  return (
    <>
      <p>
        Ao entrar, você cai na tela de <strong>Início</strong>. No topo há quatro abas, que são o
        caminho natural do trabalho — da esquerda para a direita:
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

      <p>Você pode ir e voltar entre as abas livremente — nada se perde ao trocar.</p>
    </>
  );
}
