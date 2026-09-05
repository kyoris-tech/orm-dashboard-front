import { ManualFigure } from '../ManualFigure';
import { ManualSteps, ManualStep } from '../ManualSteps';
import { ManualCallout } from '../ManualCallout';
import type { ManualContentProps } from '../../types';

export function ImportSection({ isAdmin }: ManualContentProps) {
  return (
    <>
      <ManualFigure
        src="/manual/02-importar.png"
        alt="Aba Importar Arquivos, com a área de envio e as últimas importações"
        caption="Aba Importar Arquivos"
      />

      <h3>Como enviar</h3>

      <ManualSteps>
        <ManualStep>
          Abra a aba <strong>Importar Arquivos</strong>.
        </ManualStep>
        <ManualStep>
          Clique em <strong>Importar</strong> e escolha os arquivos, ou arraste-os para dentro da
          área tracejada.
          <ul className="mt-2">
            <li>
              Formatos aceitos: <strong>PDF</strong>, <strong>DOC</strong> e <strong>DOCX</strong>
            </li>
            <li>
              Tamanho máximo: <strong>25 MB</strong> por arquivo
            </li>
            <li>
              Você pode selecionar <strong>vários de uma vez</strong>
            </li>
          </ul>
        </ManualStep>
        <ManualStep>Aguarde o processamento. Cada currículo leva poucos segundos.</ManualStep>
        <ManualStep>
          Ao terminar, os currículos aparecem em <strong>Analisar Candidatos</strong>.
        </ManualStep>
      </ManualSteps>

      <h3>O que a Orm extrai</h3>

      <p>De cada currículo, a inteligência artificial identifica:</p>

      <ul>
        <li>Nome completo, e-mail e telefones</li>
        <li>Cargo atual ou mais recente</li>
        <li>Resumo profissional e qualificações</li>
        <li>Habilidades, uma a uma</li>
        <li>Experiências, com empresa, período e responsabilidades</li>
        <li>Formação acadêmica e cursos</li>
        <li>Idiomas, com o nível quando informado</li>
        <li>Cidade e estado</li>
      </ul>

      <ManualCallout tone="warning" title="Atenção">
        <p>
          A Orm extrai <strong>somente o que está escrito</strong> no currículo. Ela não inventa nem
          completa informação. Se o candidato não informou o telefone, o campo virá vazio.
        </p>
      </ManualCallout>

      <h3>Confiança da extração</h3>

      <p>
        Cada currículo recebe uma nota de <strong>confiança</strong> — o quanto a Orm conseguiu ler o
        arquivo com clareza. Currículo bem formatado costuma ficar acima de 90%. Nota baixa
        normalmente significa arquivo escaneado, foto de documento, layout muito quebrado ou um
        arquivo que nem é currículo.
      </p>

      <ManualCallout title="Dica">
        <p>
          Viu uma nota de confiança baixa? Vale abrir a ficha do candidato e conferir os dados antes
          de descartá-lo. Muitas vezes o currículo é bom e só o arquivo estava ruim.
        </p>
      </ManualCallout>

      <h3>Últimas importações</h3>

      <p>
        Abaixo da área de envio ficam os três currículos mais recentes. Em cada um você pode{' '}
        <strong>baixar o PDF</strong> ou <strong>excluir</strong>.
        {isAdmin ? (
          <>
            {' '}
            Como administrador, você vê também o ícone de <strong>chama</strong>, que exclui
            permanentemente — veja a seção sobre analisar candidatos.
          </>
        ) : null}
      </p>

      <ManualCallout title="Excluiu sem querer?">
        <p>
          Logo após excluir, aparece um aviso com a opção <strong>Desfazer</strong> por alguns
          segundos. Depois disso, o currículo sai da lista mas continua recuperável por um
          administrador.
        </p>
      </ManualCallout>
    </>
  );
}
