import { ManualFigure } from '../ManualFigure';
import { ManualSteps, ManualStep } from '../ManualSteps';
import { ManualTable } from '../ManualTable';
import { ManualCallout } from '../ManualCallout';
import type { ManualContentProps } from '../../types';

export function CandidatesSection({ isAdmin }: ManualContentProps) {
  return (
    <>
      <p>É aqui que você encontra a pessoa certa dentro da base.</p>

      <ManualFigure
        src="/manual/03-analisar.png"
        alt="Aba Analisar Candidatos, com busca, filtros e a tabela de candidatos"
        caption="Aba Analisar Candidatos"
      />

      <h3>Busca rápida</h3>

      <p>
        O campo do topo procura <strong>dentro de todo o conteúdo do currículo</strong>, e não apenas
        no nome. Ele varre nome, e-mail, telefone, cargo, resumo, qualificações, habilidades,
        experiências (empresa, período e descrição), formação, cursos, idiomas e localidade.
      </p>

      <p>
        Por isso, digitar <strong>React</strong> traz também quem mencionou React na descrição de uma
        experiência, mesmo que não esteja na lista de habilidades. É o campo mais abrangente da tela.
      </p>

      <ManualCallout title="A busca também aceita vírgula">
        <p>
          Assim como os filtros, o campo de busca separa exigências por vírgula e conta cada uma no
          percentual de compatibilidade. <strong>React, inglês</strong> pede duas coisas.
        </p>
      </ManualCallout>

      <h3>Os cinco filtros</h3>

      <p>
        Abaixo da busca há cinco filtros: <strong>Habilidades</strong>, <strong>Cargo</strong>,{' '}
        <strong>Escolaridade</strong>, <strong>Localidade</strong> e <strong>Idiomas</strong>.
        Diferente da busca, cada um procura apenas no seu próprio campo — use-os quando quiser
        precisão em vez de abrangência.
      </p>

      <ManualSteps>
        <ManualStep>Clique no filtro desejado.</ManualStep>
        <ManualStep>Digite o que procura.</ManualStep>
        <ManualStep>
          Clique em <strong>Aplicar</strong>. Para remover, use <strong>Limpar</strong>.
        </ManualStep>
      </ManualSteps>

      <p>Filtro aplicado fica destacado em azul, então você sempre vê o que está ativo.</p>

      <h3>Vários valores no mesmo filtro</h3>

      <p>
        Você pode pedir mais de uma coisa por filtro, <strong>separando por vírgula</strong>:
      </p>

      <ManualTable
        headers={['Você digita', 'A Orm entende']}
        rows={[
          ['React', '1 exigência'],
          ['React, TypeScript', '2 exigências'],
          [
            'Design Systems',
            <>
              <strong>1 exigência</strong> — sem vírgula, conta como um termo só
            </>,
          ],
          ['Design, Systems', '2 exigências separadas'],
        ]}
      />

      <ManualCallout tone="warning" title="Atenção à vírgula">
        <p>
          A vírgula é o que separa uma exigência da outra. <strong>Excel avançado</strong> sem
          vírgula é uma exigência só; com vírgula viraria duas, e o resultado muda.
        </p>
      </ManualCallout>

      <h3>A coluna Compatível</h3>

      <p>
        O percentual mostra <strong>quantas das suas exigências aquele candidato atende</strong>,
        somando o que você digitou na busca e nos filtros. Se você pediu três coisas e o candidato
        tem duas, ele aparece com 67%.
      </p>

      <ManualCallout tone="warning" title="Os filtros ordenam, não escondem">
        <p>
          Quem não atende nada continua na lista, só que no fim, com 0%. Isso é proposital: às vezes
          o melhor candidato escreveu a habilidade com outro nome. A ordem é uma sugestão, não um
          corte.
        </p>
      </ManualCallout>

      <h3>A ficha do candidato</h3>

      <p>Clique em qualquer linha da tabela para abrir a ficha completa.</p>

      <ManualFigure
        src="/manual/04-curriculo.png"
        alt="Ficha do candidato, com contato, resumo, habilidades, experiências e formação"
        caption="Ficha completa do candidato"
      />

      <p>Na ficha você encontra tudo o que foi extraído e, no topo:</p>

      <ul>
        <li>
          Botões de <strong>copiar</strong> o e-mail e o telefone
        </li>
        <li>
          Botão de <strong>WhatsApp</strong>, que abre a conversa com o candidato
        </li>
      </ul>

      <h3>Ações de cada linha</h3>

      <ManualTable
        headers={['Ícone', 'O que faz']}
        rows={[
          ['Elo', 'Vincula o candidato a uma vaga já publicada'],
          ['Nuvem', 'Baixa o currículo em PDF, com a marca da Orm'],
          ['Lixeira', 'Exclui o currículo — dá para desfazer'],
          ...(isAdmin
            ? [
                [
                  'Chama',
                  <>
                    <strong>Exclui permanentemente</strong> — exclusivo do seu perfil de
                    administrador
                  </>,
                ],
              ]
            : []),
        ]}
      />

      {isAdmin ? (
        <ManualCallout tone="warning" title="São duas exclusões diferentes">
          <p>
            A <strong>lixeira</strong> tira o currículo da lista, mas ele continua no sistema: dá
            para desfazer na hora e é possível restaurá-lo depois.
          </p>
          <p>
            A <strong>chama</strong> apaga o currículo do banco de dados{' '}
            <strong>definitivamente</strong>, sem possibilidade de recuperação. Ela só aparece para
            administradores e pede confirmação antes de executar.
          </p>
        </ManualCallout>
      ) : null}

      <h3>Abrir um processo seletivo</h3>

      <ManualSteps>
        <ManualStep>Marque a caixinha dos candidatos que interessam.</ManualStep>
        <ManualStep>
          Clique em <strong>Abrir Processo Seletivo</strong>, no canto direito.
        </ManualStep>
        <ManualStep>Dê um nome ao processo e confirme.</ManualStep>
      </ManualSteps>

      <ManualCallout title="Dica">
        <p>
          Use a paginação no rodapé para escolher quantos candidatos ver por página — 10, 25, 50 ou
          100. Em base grande, 25 costuma ser o equilíbrio melhor.
        </p>
      </ManualCallout>
    </>
  );
}
