import { ManualFaq, type ManualFaqItem } from '../ManualFaq';
import type { ManualContentProps } from '../../types';

const SHARED_ITEMS: ManualFaqItem[] = [
  {
    question: 'Importei o currículo e vieram campos vazios. Por quê?',
    answer:
      'A Orm extrai apenas o que está escrito e não inventa dados. Campo vazio quer dizer que a informação não estava no arquivo, ou que o arquivo estava difícil de ler. Confira a nota de confiança: se estiver baixa, provavelmente é um PDF escaneado ou foto.',
  },
  {
    question: 'Busquei por uma palavra e vieram candidatos que não a têm nas habilidades.',
    answer:
      'É o esperado. A busca rápida procura em todo o conteúdo do currículo — inclusive na descrição das experiências, no resumo e nos cursos. Se quiser restringir a um campo específico, use os filtros em vez da busca.',
  },
  {
    question: 'Filtrei e apareceram candidatos que não atendem nada. Está errado?',
    answer:
      'Não. Os filtros ordenam a lista, eles não removem ninguém. Quem não atende fica no fim, com 0%. Assim você não perde um bom candidato que descreveu a habilidade com outra palavra.',
  },
  {
    question: 'Excluí um currículo por engano. Dá para recuperar?',
    answer:
      'Sim. Logo após excluir aparece a opção Desfazer. Se já passou, um administrador consegue restaurar — o currículo não é apagado de imediato.',
  },
  {
    question: 'O link da vaga parou de funcionar.',
    answer:
      'A vaga provavelmente foi cancelada, ou o processo seletivo ligado a ela foi encerrado. Vaga encerrada deixa de receber candidaturas de propósito.',
  },
  {
    question: 'O sistema pediu login de novo do nada.',
    answer:
      'A sessão dura 1 hora. Depois disso é necessário entrar novamente — é uma proteção de segurança, não um erro.',
  },
];

const RECRUITER_ITEMS: ManualFaqItem[] = [
  {
    question: 'Não consigo importar: aparece aviso de limite.',
    answer:
      'A cota mensal de currículos do plano acabou. Ela zera no início do mês seguinte. Se precisar antes, fale com o administrador sobre upgrade.',
  },
  {
    question: 'Não vejo a aba Vagas ou Processos.',
    answer:
      'Esses recursos dependem do plano contratado. Se não estiverem liberados, a área mostra um aviso no lugar do conteúdo. Fale com o administrador.',
  },
  {
    question: 'Como faço para outra pessoa da equipe usar a Orm?',
    answer:
      'Peça a um administrador. Ele cria o usuário, escolhe o perfil e define a senha inicial. O número de usuários ativos depende do plano.',
  },
];

const ADMIN_ITEMS: ManualFaqItem[] = [
  {
    question: 'Um usuário avisou que não consegue importar por causa do limite.',
    answer:
      'A cota mensal do plano daquela empresa acabou. Ela zera no início do mês seguinte. Para liberar antes, troque o plano em Administração → Empresas.',
  },
  {
    question: 'Um usuário não está vendo a aba Vagas ou Processos.',
    answer:
      'Esses recursos são liberados pelo plano. Confira em Administração → Planos quais recursos o plano da empresa inclui e ajuste se necessário.',
  },
  {
    question: 'Como adiciono uma pessoa nova à equipe?',
    answer:
      'Em Administração → Usuários, clique em Adicionar Usuário, informe nome, e-mail, empresa, perfil e uma senha inicial. Se o limite de usuários do plano estiver cheio, bloqueie alguém inativo ou faça upgrade.',
  },
  {
    question: 'Preciso apagar um currículo de verdade, por pedido do candidato.',
    answer:
      'Use o ícone de chama na lista de candidatos. Ele apaga o registro do banco definitivamente, sem possibilidade de recuperação, e a ação fica registrada na auditoria.',
  },
];

export function FaqSection({ isAdmin }: ManualContentProps) {
  return <ManualFaq items={[...SHARED_ITEMS, ...(isAdmin ? ADMIN_ITEMS : RECRUITER_ITEMS)]} />;
}
