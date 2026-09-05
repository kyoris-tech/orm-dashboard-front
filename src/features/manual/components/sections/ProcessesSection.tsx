import { Badge } from '@/components/ui/Badge';
import { ManualFigure } from '../ManualFigure';
import { ManualTable } from '../ManualTable';
import { ManualCallout } from '../ManualCallout';

export function ProcessesSection() {
  return (
    <>
      <p>
        O processo seletivo é onde a seleção acontece: um grupo de candidatos, uma vaga e um desfecho
        registrado.
      </p>

      <ManualFigure
        src="/manual/05-processos.png"
        alt="Aba Processos Seletivos, com a lista de processos e seus status"
        caption="Aba Processos Seletivos"
      />

      <h3>Os quatro estados</h3>

      <ManualTable
        headers={['Status', 'Significa']}
        rows={[
          [<Badge key="open" tone="success">Em andamento</Badge>, 'Aberto, recebendo e avaliando candidatos'],
          [<Badge key="concluded" tone="accent">Concluído</Badge>, 'Terminou com alguém contratado'],
          [<Badge key="closed" tone="neutral">Fechado</Badge>, 'Encerrado sem contratação'],
          [<Badge key="cancelled" tone="danger">Cancelado</Badge>, 'Interrompido — a vaga deixou de existir, por exemplo'],
        ]}
      />

      <h3>Conduzir um processo</h3>

      <p>Clique no processo para abrir o painel lateral. De lá você pode:</p>

      <ul>
        <li>
          <strong>Adicionar candidatos</strong> que entraram depois
        </li>
        <li>
          <strong>Vincular uma vaga</strong> publicada ao processo
        </li>
        <li>
          <strong>Concluir</strong>, escolhendo o candidato contratado
        </li>
        <li>
          <strong>Fechar</strong>, quando terminou sem contratação
        </li>
        <li>
          <strong>Cancelar</strong>, quando o processo foi interrompido
        </li>
      </ul>

      <ManualCallout tone="warning" title="Ao concluir">
        <p>
          O candidato contratado precisa estar entre os que participam do processo. Se ele não
          estiver, adicione-o antes de concluir.
        </p>
      </ManualCallout>

      <ManualCallout title="Encerrar processo encerra a vaga">
        <p>
          Se o processo estiver vinculado a uma vaga e não sobrar nenhum outro processo aberto para
          ela, a vaga é encerrada junto — e o link público para de receber candidaturas. É o
          comportamento esperado: vaga preenchida não deve continuar recebendo inscrição.
        </p>
      </ManualCallout>
    </>
  );
}
