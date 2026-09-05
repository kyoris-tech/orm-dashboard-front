import { ManualFigure } from '../ManualFigure';
import { ManualTable } from '../ManualTable';
import { ManualCallout } from '../ManualCallout';

export function ReportsSection() {
  return (
    <>
      <p>
        Em <strong>Relatórios</strong>, no menu, você acompanha o volume e a qualidade do que passou
        pela Orm.
      </p>

      <ManualFigure
        src="/manual/07-relatorios.png"
        alt="Tela de Relatórios, com indicadores e gráficos"
        caption="Tela de Relatórios"
      />

      <ManualTable
        headers={['Indicador', 'O que significa']}
        rows={[
          ['Currículos importados', 'Quantos currículos entraram na base'],
          [
            'Confiança média da extração',
            'Qualidade média de leitura dos arquivos. Caiu muito? Provavelmente estão chegando arquivos escaneados',
          ],
          ['Tempo médio de processamento', 'Quanto a Orm leva por currículo'],
          ['Importações nos últimos 14 dias', 'O ritmo de entrada de currículos'],
          [
            'Habilidades mais frequentes',
            'O que mais aparece na sua base — útil para calibrar exigências de vaga',
          ],
          ['Escolaridade dos candidatos', 'Distribuição por formação'],
        ]}
      />

      <ManualCallout title="Como ler na prática">
        <p>
          Se as habilidades mais frequentes não têm nada a ver com as vagas que você abre, o problema
          costuma estar na divulgação, não nos candidatos.
        </p>
      </ManualCallout>
    </>
  );
}
