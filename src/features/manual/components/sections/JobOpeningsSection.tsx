import { ManualFigure } from '../ManualFigure';
import { ManualSteps, ManualStep } from '../ManualSteps';
import { ManualCallout } from '../ManualCallout';

export function JobOpeningsSection() {
  return (
    <>
      <p>
        Publicar uma vaga gera um <strong>link público</strong>. Quem recebe o link vê a descrição e
        envia o currículo direto — sem criar conta, sem senha.
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
        Todas as vagas abertas também aparecem juntas numa página pública de vagas, que funciona como
        uma vitrine geral.
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
