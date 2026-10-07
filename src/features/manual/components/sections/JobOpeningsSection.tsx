import { ManualFigure } from '../ManualFigure';
import { ManualSteps, ManualStep } from '../ManualSteps';
import { ManualCallout } from '../ManualCallout';
import { ManualTable } from '../ManualTable';

export function JobOpeningsSection() {
  return (
    <>
      <p>
        Publicar uma vaga gera um <strong>link</strong>. Quem recebe o link vê a descrição e envia o
        currículo direto — sem criar conta, sem senha. Você decide se a vaga também aparece na
        vitrine pública de vagas ou se fica acessível apenas por esse link.
      </p>

      <ManualFigure
        src="/manual/06-vagas.png"
        alt="Aba Vagas Publicadas, com a lista de vagas cadastradas"
        caption="Aba Vagas Publicadas"
      />

      <h3>Criar uma vaga</h3>

      <ManualSteps>
        <ManualStep>
          Na aba <strong>Vagas Publicadas</strong>, clique em <strong>Adicionar vaga</strong>.
        </ManualStep>
        <ManualStep>
          Preencha os campos:
          <ul className="mt-2">
            <li>
              <strong>Título</strong> — o cargo, como o candidato reconhece
            </li>
            <li>
              <strong>Modelo de trabalho</strong> — Remoto, Híbrido ou Presencial
            </li>
            <li>
              <strong>Tipo de contrato</strong> — CLT, PJ, Estágio ou Temporário
            </li>
            <li>
              <strong>Quem pode ver esta vaga</strong> — Pública ou Privada (veja abaixo)
            </li>
            <li>
              <strong>Faixa salarial</strong> (opcional)
            </li>
            <li>
              <strong>Requisitos</strong>, <strong>Diferenciais</strong> e{' '}
              <strong>Benefícios</strong> — um item por linha
            </li>
          </ul>
        </ManualStep>
        <ManualStep>
          Clique em <strong>Salvar vaga</strong>.
        </ManualStep>
      </ManualSteps>

      <ManualCallout title="Requisitos e diferenciais fazem mais do que informar">
        <p>
          Eles alimentam o cálculo de aderência das candidaturas. Quando alguém se inscreve pelo
          link, a Orm compara o currículo com essas listas e já mostra o percentual.
        </p>
      </ManualCallout>

      <h3>Pública ou privada</h3>

      <p>
        Ao criar ou editar a vaga, escolha em <strong>Quem pode ver esta vaga</strong>:
      </p>

      <ManualTable
        headers={['', 'Pública', 'Privada']}
        rows={[
          ['Link direto funciona', 'Sim', 'Sim'],
          ['Aparece na vitrine de vagas do site', 'Sim', 'Não'],
          ['Pode ser encontrada no Google', 'Sim', 'Não'],
          ['Quem pode se candidatar', 'Qualquer pessoa', 'Só quem recebeu o link'],
        ]}
      />

      <p>
        Use <strong>privada</strong> quando quiser poucos currículos e escolhidos: uma indicação, uma
        recolocação interna, um teste com um grupo pequeno. Use <strong>pública</strong> quando
        quiser o máximo de alcance.
      </p>

      <ManualCallout tone="warning" title="Privada não é protegida por senha">
        <p>
          A vaga privada fica fora da vitrine e fora das buscas, mas qualquer pessoa com o link
          consegue abrir e se candidatar. Se o link for repassado, não há como impedir o envio —
          nesse caso, cancele a vaga e crie outra.
        </p>
      </ManualCallout>

      <p>
        A visibilidade aparece na coluna <strong>Visibilidade</strong> da lista de vagas e pode ser
        trocada a qualquer momento em <strong>Editar vaga</strong>. Ao tornar uma vaga pública, ela
        entra na vitrine; ao torná-la privada, sai da vitrine na hora, mas o link continua valendo
        para quem já tem.
      </p>

      <h3>Divulgar</h3>

      <p>
        Na lista de vagas, use a ação de <strong>copiar link</strong> e cole onde quiser: LinkedIn,
        grupo de WhatsApp, e-mail, site da empresa.
      </p>

      <ManualFigure
        src="/manual/10-vaga-detalhe.png"
        alt="Página pública de uma vaga, com a descrição e a área de envio de currículo"
        caption="O que o candidato vê ao abrir o link"
      />

      <h3>A vitrine de vagas</h3>

      <p>
        As vagas abertas marcadas como <strong>públicas</strong> aparecem juntas numa página pública
        de vagas, que funciona como uma vitrine geral. Vagas privadas não entram nessa lista.
      </p>

      <ManualFigure
        src="/manual/09-vagas-publicas.png"
        alt="Página pública com a lista de todas as vagas abertas"
        caption="Vitrine pública de vagas abertas"
      />

      <h3>O que acontece com quem se candidata</h3>

      <ManualSteps>
        <ManualStep>O candidato envia o currículo pelo link.</ManualStep>
        <ManualStep>A Orm lê o arquivo, como em qualquer importação.</ManualStep>
        <ManualStep>Ele entra automaticamente num processo seletivo daquela vaga.</ManualStep>
        <ManualStep>A aderência ao que a vaga pede já vem calculada.</ManualStep>
      </ManualSteps>

      <p>
        Ou seja: você não precisa fazer nada para receber. Basta abrir o processo seletivo da vaga e
        ver quem chegou.
      </p>

      <h3>Cancelar</h3>

      <p>
        Cancelar uma vaga tira o link do ar. Quem tentar acessá-lo verá que a vaga não está mais
        recebendo candidaturas.
      </p>
    </>
  );
}
