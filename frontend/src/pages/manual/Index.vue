<template>
  <div class="tw-p-4 md:tw-p-6 manual-page">
    <div class="manual-hero">
      <div class="tw-flex tw-items-center tw-justify-center tw-gap-2">
        <q-icon
          name="mdi-book-open-page-variant-outline"
          size="28px"
          class="tw-text-primary"
        />
        <h1 class="tw-text-2xl tw-font-bold tw-text-foreground tw-m-0">Manual do Sistema</h1>
      </div>
      <p class="tw-text-sm tw-text-muted-foreground tw-mt-1 tw-mb-4">
        Tudo o que você precisa saber pra usar o SChat, passo a passo
      </p>

      <div class="manual-search">
        <q-icon
          name="mdi-magnify"
          size="20px"
          class="tw-text-muted-foreground"
        />
        <input
          v-model="busca"
          type="text"
          placeholder="Buscar por assunto (ex: campanha, chatbot, transferir ticket...)"
          class="manual-search__input"
        >
        <q-icon
          v-if="busca"
          name="mdi-close"
          size="18px"
          class="tw-text-muted-foreground cursor-pointer"
          @click="busca = ''"
        />
      </div>
    </div>

    <div
      v-if="!busca"
      class="manual-grid"
    >
      <div
        v-for="(secao, idx) in secoes"
        :key="'card-' + secao.titulo"
        class="manual-quick-card"
        @click="abrirSecao(idx)"
      >
        <div
          class="manual-badge"
          :style="corBadge(idx)"
        >
          <q-icon
            :name="secao.icon"
            size="20px"
          />
        </div>
        <div>
          <div class="tw-text-sm tw-font-bold tw-text-foreground">{{ secao.titulo }}</div>
          <div class="tw-text-xs tw-text-muted-foreground manual-quick-card__resumo">{{ secao.resumo }}</div>
        </div>
      </div>
    </div>

    <div
      v-if="busca && secoesFiltradas.length === 0"
      class="tw-text-center tw-text-muted-foreground q-pa-xl"
    >
      <q-icon
        name="mdi-file-search-outline"
        size="40px"
      />
      <div class="tw-mt-2">Nada encontrado para "{{ busca }}"</div>
    </div>

    <q-list
      class="manual-list"
      ref="lista"
    >
      <div
        v-for="secao in secoesFiltradas"
        :key="secao.titulo"
        :ref="'secao-' + secao.idxOriginal"
        class="manual-section"
      >
        <q-expansion-item
          :value="abertos[secao.idxOriginal]"
          header-class="tw-py-2"
          @input="v => $set(abertos, secao.idxOriginal, v)"
        >
          <template v-slot:header>
            <q-item-section avatar>
              <div
                class="manual-badge manual-badge--sm"
                :style="corBadge(secao.idxOriginal)"
              >
                <q-icon
                  :name="secao.icon"
                  size="18px"
                />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="tw-font-bold tw-text-foreground">{{ secao.titulo }}</q-item-label>
              <q-item-label caption>{{ secao.resumo }}</q-item-label>
            </q-item-section>
          </template>

          <q-card flat>
            <q-card-section class="tw-pt-0">
              <ol class="manual-steps">
                <li
                  v-for="(passo, i) in secao.passos"
                  :key="i"
                  v-html="passo"
                />
              </ol>

              <div
                v-if="secao.notas && secao.notas.length"
                class="manual-note"
              >
                <div class="tw-flex tw-items-center tw-gap-1.5 tw-font-semibold tw-text-sm tw-mb-1">
                  <q-icon
                    name="mdi-lightbulb-outline"
                    size="16px"
                  />
                  Vale saber
                </div>
                <ul class="tw-m-0 tw-pl-5 tw-text-sm">
                  <li
                    v-for="(nota, i) in secao.notas"
                    :key="i"
                    v-html="nota"
                  />
                </ul>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </q-list>
  </div>
</template>

<script>
export default {
  name: 'Manual',
  data () {
    return {
      busca: '',
      abertos: { 0: true },
      cores: [
        { bg: 'rgba(225, 6, 40, .12)', cor: '#E10628' },
        { bg: 'rgba(240, 128, 0, .12)', cor: '#F08000' },
        { bg: 'hsl(43 74% 52% / .18)', cor: 'hsl(43 74% 32%)' },
        { bg: 'rgba(102, 113, 58, .15)', cor: '#66713A' },
        { bg: 'rgba(36, 86, 111, .12)', cor: '#24566F' },
        { bg: 'rgba(164, 60, 141, .12)', cor: '#A43C8D' }
      ],
      secoes: [
        {
          titulo: 'Atendimento (tickets e conversas)',
          resumo: 'Como pegar, responder, transferir e resolver um atendimento',
          icon: 'mdi-forum-outline',
          passos: [
            'Um atendimento novo aparece na lista à esquerda com status <b>Pendente</b>. Clique no botão verde (ícone de envio) no card do ticket para assumi-lo — isso muda o status para <b>Aberto</b> e abre a conversa.',
            'Digite a mensagem na caixa de texto na parte de baixo do chat e envie. Você pode anexar mídia, usar emojis e citar/responder uma mensagem específica.',
            'Para usar uma mensagem rápida, digite <b>/</b> seguido de parte da palavra-chave — uma lista com as mensagens cadastradas aparece pra você escolher.',
            'No topo da conversa, o botão verde <b>Resolver</b> encerra o atendimento (status <b>Resolvido</b>).',
            'Clicando na setinha ao lado de "Resolver" você encontra: <b>Reabrir Ticket</b> (se já estiver resolvido), <b>Setor</b> (devolve o ticket pro setor, ficando pendente de novo) e <b>Transferir</b> (escolha um setor e/ou um usuário de destino e clique em Salvar).',
            'No painel "Dados Contato" à direita você edita o contato, vê o histórico ("Logs"), aplica <b>Etiquetas</b>, define a <b>Carteira</b> (dono do contato) e acompanha mensagens agendadas.',
            'Para começar uma conversa nova (você inicia o contato), use o botão de contatos (ícone de livro) na lista de atendimentos.'
          ],
          notas: [
            'Use os <b>Filtros Avançados</b> (ícone de filtro) pra ver só tickets de um setor, só não lidos, ou só os que ainda não têm ninguém atribuído.',
            'Administradores podem marcar "Visualizar Todos" pra ver os atendimentos de todos os agentes, não só os próprios.'
          ]
        },
        {
          titulo: 'Contatos',
          resumo: 'Cadastro e organização de quem fala com você pelo WhatsApp',
          icon: 'mdi-card-account-mail-outline',
          passos: [
            'Todo número que te manda mensagem vira um contato automaticamente.',
            'Na tela de Contatos você pode editar nome, adicionar etiquetas e ver o histórico de conversas.',
            'A partir de um contato, dá pra abrir uma conversa nova diretamente.'
          ],
          notas: []
        },
        {
          titulo: 'Importar Contatos (CSV)',
          resumo: 'Como importar listas de contatos e corrigir o formato de números no Excel',
          icon: 'mdi-file-excel-box-outline',
          passos: [
            'Na tela de Contatos, clique na setinha para baixo ao lado do botão "ADICIONAR" e escolha <b>Importar .CSV</b>.',
            'Use a opção <b>Baixar Planilha Exemplo</b> para obter um modelo.',
            '<b>CORRIGINDO O EXCEL:</b> Se o número ficar em formato científico (ex: 5,57E+12), o Excel vai estragar o contato ao salvar. <b>Antes de salvar como CSV, faça o seguinte:</b>',
            '1. Selecione a coluna dos números clicando na letra da coluna no topo.',
            '2. Clique com o botão direito e vá em <b>Formatar Células</b>.',
            '3. Escolha a categoria <b>Número</b> e deixe "Casas decimais" em <b>0</b>.',
            '4. Alargue a coluna (dando dois cliques na divisória no topo) para garantir que o número todo está visível.',
            '5. Salve o arquivo no formato <b>CSV</b> e envie na janela de importação.'
          ],
          notas: [
            'Você também pode vincular Etiquetas e Carteira (atendente responsável) no momento da importação.'
          ]
        },
        {
          titulo: 'Canais (conectar o WhatsApp)',
          resumo: 'Como parear um número de WhatsApp, Telegram ou Instagram via QR Code',
          icon: 'mdi-cellphone-wireless',
          passos: [
            'Vá em <b>Canais</b> (menu Administração) e clique em <b>Adicionar</b>.',
            'Escolha o <b>Tipo</b> (Whatsapp, Telegram ou Instagram) e um <b>Nome</b> único para identificar esse canal.',
            'Se for Telegram, informe o <b>Token</b> do bot. Se for Instagram, informe o usuário e gere uma senha ("Nova senha"). Clique em <b>Salvar</b>.',
            'No card do canal criado, clique em <b>Conectar</b> e depois em <b>QR Code</b>.',
            'Abra o WhatsApp no celular → Aparelhos conectados → Conectar um aparelho, e escaneie o QR Code que aparece na tela. A janela fecha sozinha quando conectar.',
            'Use o menu "Bot" no card do canal pra vincular um fluxo de chatbot a esse número.'
          ],
          notas: [
            'Só administradores conseguem conectar, desconectar ou excluir um canal.',
            'Se o QR Code expirar, clique em "Novo QR Code" pra gerar outro.'
          ]
        },
        {
          titulo: 'Chatbot (fluxo de atendimento automático)',
          resumo: 'Como montar um robô de conversa visual, com menus e condições',
          icon: 'mdi-robot-outline',
          passos: [
            'Vá em <b>Chatbot</b> → <b>Adicionar</b>. Dê um nome ("Descrição") ao fluxo e, se quiser testar antes de liberar geral, informe um "Número para Teste" — só esse número vai receber as respostas do bot enquanto você ajusta.',
            'Clique no ícone de organograma ("Abrir Fluxo") pra entrar no construtor visual. Todo fluxo já nasce com um bloco "Início" e um bloco "Configurações" (fixos) e uma primeira etapa de boas-vindas.',
            'Clique em <b>+ Nova Etapa</b> pra criar um novo passo da conversa. Em cada etapa, na aba <b>Interações</b>, adicione mensagens de texto, imagem, áudio, vídeo ou documento — a ordem pode ser ajustada com as setinhas.',
            'Na aba <b>Condições</b> da etapa, clique em <b>Nova</b> pra definir regras: "Se" a resposta do cliente for qualquer coisa ou um texto específico, "Rotear para" outra etapa, um setor, um usuário específico ou <b>Encerrar</b> — essa última opção fecha o atendimento automaticamente pelo bot.',
            'Conecte as etapas arrastando uma linha de uma etapa até a outra no canvas. Clique numa linha pra nomear a condição dela.',
            'No bloco <b>Configurações</b> do fluxo, defina a mensagem de boas-vindas ao cair num setor/usuário, a mensagem de erro quando a resposta não bate com nenhuma condição e o tempo de espera de inatividade inicial para o cliente.',
            'Clique em <b>Salvar</b> no painel lateral pra gravar o fluxo.',
            'Pra ativar: marque "Ativo" no cadastro do fluxo e vincule-o a um canal (menu "Bot" na tela de Canais) ou defina como padrão em Configurações → "Fluxo ativo para o Bot de atendimento".'
          ],
          notas: [
            'O bot para de responder automaticamente assim que um atendente humano assume o ticket — e o humano pode intervir a qualquer momento.',
            'Quando o cliente encerra pelo bot (ação <b>Encerrar</b>), se ele mandar uma nova mensagem o bot reinicia do zero automaticamente, sem precisar de intervenção humana.',
            '<b>Encerramento por inatividade:</b> se o cliente parar de responder pelo tempo definido nas <b>Configurações</b> Gerais (Inatividade do Chatbot), o sistema envia uma mensagem de aviso. Se ele não responder no mesmo intervalo de tempo, o ticket é encerrado automaticamente.',
            'Dica: Se quiser um tempo diferente específico para uma etapa do bot, preencha o campo "Tempo (minutos)" da seção "Ausência de resposta" dentro da configuração da etapa.',
            'Use "Duplicar Fluxo" na listagem pra criar uma variação de um fluxo já pronto sem montar do zero.'
          ]
        },
        {
          titulo: 'Setores',
          resumo: 'Departamentos que organizam pra quem cada atendimento vai',
          icon: 'mdi-arrow-decision-outline',
          passos: [
            'Vá em <b>Setores</b> → <b>Adicionar</b>, dê um nome e marque "Ativo". Clique em Salvar.',
            'Depois, vá em <b>Usuários</b>, clique no ícone de "Gestão de Setores do usuário" de cada agente e marque quais setores ele atende.',
            'Os setores são usados no roteamento do chatbot, nas transferências de atendimento e nos filtros de campanha.'
          ],
          notas: [
            'Desativar um setor que está sendo usado em um fluxo de chatbot pode quebrar o roteamento dele — confira antes.'
          ]
        },
        {
          titulo: 'Usuários',
          resumo: 'Criar contas de atendentes e administradores',
          icon: 'mdi-account-group-outline',
          passos: [
            'Vá em <b>Usuários</b> → <b>Adicionar</b>.',
            'Preencha Nome, E-mail e Senha (mínimo 6 caracteres) e escolha o Perfil: <b>Usuário</b> (agente comum) ou <b>Administrador</b>.',
            'Clique em Salvar. Depois, use o ícone de rota/setor na listagem pra vincular esse usuário aos setores que ele vai atender.'
          ],
          notas: [
            'Só administradores podem alterar o perfil de outro usuário.'
          ]
        },
        {
          titulo: 'Horário de Atendimento',
          resumo: 'Define os dias/horários de funcionamento e a mensagem de ausência',
          icon: 'mdi-calendar-clock-outline',
          passos: [
            'Vá em <b>Horário de Atendimento</b>. Para cada dia da semana, escolha o Tipo: <b>Aberto</b> (24h, sem mensagem automática), <b>Fechado</b> (sempre manda a mensagem de ausência) ou <b>Horário</b> (define até dois intervalos, ex: manhã e tarde).',
            'Clique em Salvar no card do dia.',
            'Escreva a <b>Mensagem de Ausência</b> que será enviada fora do horário e clique no Salvar dela.'
          ],
          notas: [
            'A mensagem de ausência só é enviada depois que o fluxo do chatbot terminar de rodar, não imediatamente.'
          ]
        },
        {
          titulo: 'Etiquetas',
          resumo: 'Categorizar contatos e filtrar campanhas/relatórios',
          icon: 'mdi-tag-text-outline',
          passos: [
            'Vá em <b>Etiquetas</b> → <b>Adicionar</b>, defina um nome e uma cor, marque Ativo e Salve.',
            'Pra aplicar numa conversa, abra o atendimento e use o campo "Etiquetas" no painel "Dados Contato" à direita.'
          ],
          notas: [
            'Etiquetas também servem de filtro na hora de montar uma campanha e aparecem no relatório "Contatos por Etiqueta".'
          ]
        },
        {
          titulo: 'Mensagens Rápidas',
          resumo: 'Respostas prontas acionadas digitando "/" no chat',
          icon: 'mdi-reply-all-outline',
          passos: [
            'Vá em <b>Mensagens Rápidas</b> → <b>Adicionar</b>.',
            'Defina a <b>Chave</b> (a palavra-atalho) e o texto da <b>Mensagem</b> (dá pra usar emoji). Salve.',
            'Dentro de qualquer conversa, digite <b>/</b> seguido de parte da chave — a lista de mensagens que combinam aparece pra você clicar e inserir.'
          ],
          notas: []
        },
        {
          titulo: 'Campanhas',
          resumo: 'Disparo em massa de mensagens pra uma lista de contatos filtrada',
          icon: 'mdi-message-bookmark-outline',
          passos: [
            'Vá em <b>Campanhas</b> → <b>Adicionar</b>.',
            'Preencha nome, data/hora de início, o canal de WhatsApp que vai enviar, o delay em segundos entre cada envio, e opcionalmente anexe uma mídia (imagem, PDF, vídeo etc, até 10MB).',
            'Escreva até 3 variações de mensagem (1ª, 2ª e 3ª) — o sistema revezia entre elas. Use a pré-visualização em formato de celular pra conferir. Salve.',
            'Na listagem, clique no ícone de contatos da campanha e depois em <b>Incluir Contatos</b> — um filtro abre (data, estado/DDD, etiqueta, carteira, nome/telefone). Clique em <b>Gerar</b> pra ver quem combina, selecione e clique em <b>Adicionar</b>.',
            'De volta à listagem, clique no ícone de calendário ("Programar Envio") pra agendar o disparo.'
          ],
          notas: [
            'Só dá pra editar ou excluir uma campanha enquanto ela ainda não foi programada (ou se for cancelada).',
            'Não é possível programar uma campanha sem nenhum contato na lista.',
            'Os envios respeitam o horário de atendimento configurado.'
          ]
        },
        {
          titulo: 'Relatórios',
          resumo: 'Números consolidados de contatos e atendimentos',
          icon: 'mdi-file-chart-outline',
          passos: [
            'Vá em <b>Relatórios</b> e escolha entre: <b>Contatos</b> (lista geral), <b>Contatos por Etiqueta</b>, <b>Contatos por Estado</b> (agrupado pelo DDD) e <b>Resumo de Atendimentos por Usuário</b> (quantos tickets cada agente atendeu).'
          ],
          notas: []
        },
        {
          titulo: 'Configurações Gerais',
          resumo: 'Ajustes de comportamento do sistema (aplicam na hora)',
          icon: 'mdi-cog-outline',
          passos: [
            'Vá em <b>Configurações</b>. Cada opção é um interruptor que já salva sozinho ao ser alterado, sem precisar de botão Salvar:',
            '<b>Não visualizar Tickets já atribuídos à outros usuários</b> — esconde de agentes comuns os tickets que já são de outra pessoa.',
            '<b>Não visualizar Tickets no ChatBot</b> — só admins veem tickets que ainda estão sendo respondidos pelo robô.',
            '<b>Forçar atendimento via Carteira</b> — contatos com "dono" definido só aparecem pra esse dono.',
            '<b>Fluxo ativo para o Bot de atendimento</b> — escolhe qual chatbot roda por padrão nos novos atendimentos.',
            '<b>Ignorar Mensagens de Grupo</b> — não abre ticket pra mensagens de grupos do WhatsApp.',
            '<b>Recusar chamadas no Whatsapp</b> — rejeita automaticamente ligações de voz/vídeo, com uma mensagem opcional.'
          ],
          notas: []
        },
        {
          titulo: 'API (integração externa)',
          resumo: 'Conecte o SChat a outros sistemas via webhook',
          icon: 'mdi-call-split',
          passos: [
            'Vá em <b>API</b> → <b>Adicionar</b>.',
            'Dê um nome à integração, escolha o canal de WhatsApp que vai enviar, e opcionalmente informe URLs de webhook: uma pra avisar mudanças de status da sessão, outra pra status de mensagem.',
            'Se o seu sistema exigir autenticação, informe o "Token de autenticação" (vai no header Authorization). Salve.',
            'Na listagem, copie a URL da integração e o Token gerado pra usar na sua ferramenta externa.'
          ],
          notas: [
            'Gerar um novo token invalida o anterior — atualize em todo lugar que já usa a integração antiga.'
          ]
        }
      ]
    }
  },
  computed: {
    secoesFiltradas () {
      const comIndice = this.secoes.map((s, i) => ({ ...s, idxOriginal: i }))
      const termo = this.busca.trim().toLowerCase()
      if (!termo) return comIndice
      return comIndice.filter(s => {
        const alvo = [
          s.titulo,
          s.resumo,
          ...(s.passos || []),
          ...(s.notas || [])
        ].join(' ').toLowerCase()
        return alvo.includes(termo)
      })
    }
  },
  methods: {
    corBadge (idx) {
      const c = this.cores[idx % this.cores.length]
      return { background: c.bg, color: c.cor }
    },
    abrirSecao (idx) {
      this.busca = ''
      this.$set(this.abertos, idx, true)
      this.$nextTick(() => {
        const el = this.$refs['secao-' + idx]
        const target = Array.isArray(el) ? el[0] : el
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.manual-page
  max-width: 980px
  margin: 0 auto

.manual-hero
  text-align: center
  margin-bottom: 24px

.manual-search
  display: flex
  align-items: center
  gap: 8px
  max-width: 520px
  margin: 0 auto
  padding: 10px 16px
  border-radius: 999px
  border: 1px solid hsl(37 20% 88%)
  background: #fff

.manual-search__input
  flex: 1
  border: none
  outline: none
  background: transparent
  font-size: 14px
  font-family: inherit
  color: hsl(222 47% 11%)

.manual-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))
  gap: 12px
  margin-bottom: 28px

.manual-quick-card
  display: flex
  align-items: center
  gap: 12px
  padding: 14px
  border-radius: 12px
  border: 1px solid hsl(37 20% 88%)
  background: #fff
  cursor: pointer
  transition: box-shadow .15s ease, transform .15s ease

.manual-quick-card:hover
  box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.12)
  transform: translateY(-1px)

.manual-quick-card__resumo
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden

.manual-badge
  width: 40px
  height: 40px
  min-width: 40px
  border-radius: 10px
  display: flex
  align-items: center
  justify-content: center

.manual-badge--sm
  width: 34px
  height: 34px
  min-width: 34px
  border-radius: 8px

.manual-list
  border-radius: 12px
  overflow: hidden

.manual-section + .manual-section
  border-top: 1px solid hsl(37 20% 88%)

.manual-section
  border: 1px solid hsl(37 20% 88%)
  border-radius: 12px
  margin-bottom: 10px
  overflow: hidden
  background: #fff

.manual-steps
  margin: 0
  padding-left: 20px

  li
    margin-bottom: 10px
    line-height: 1.5
    font-size: 14px

.manual-note
  margin-top: 16px
  padding: 12px 14px
  border-radius: 10px
  background: hsl(var(--izing-primary) / 0.06)
  border: 1px solid hsl(var(--izing-primary) / 0.15)

  li
    margin-bottom: 4px

body.body--dark .manual-search,
body.body--dark .manual-quick-card,
body.body--dark .manual-section
  background: #0A0A0A
  border-color: #262626

body.body--dark .manual-search__input
  color: #F5F5F5
</style>
