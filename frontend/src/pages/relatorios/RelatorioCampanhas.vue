<template>
  <div class="q-pa-md">
    <!-- Header / Filtros -->
    <q-card bordered class="q-mb-md shadow-2 rounded-borders">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="primary"
            to="/relatorios"
          >
            <q-tooltip>Voltar aos Relatórios</q-tooltip>
          </q-btn>
          <div>
            <div class="text-h6 text-weight-bold text-primary">Relatório de Desempenho de Campanhas</div>
            <div class="text-caption text-grey-7">Visão geral de envios, taxa de entrega, leitura e conversão por mensagem</div>
          </div>
        </div>

        <div class="row items-center q-gutter-sm q-mt-xs-sm">
          <q-btn
            flat
            round
            icon="refresh"
            color="primary"
            :loading="loading"
            @click="carregarRelatorio"
          >
            <q-tooltip>Atualizar Dados</q-tooltip>
          </q-btn>

          <q-btn
            color="positive"
            icon="mdi-file-excel"
            label="Exportar Excel"
            rounded
            unelevated
            :disable="!reportData || !reportData.contacts || reportData.contacts.length === 0"
            @click="exportarExcel"
          />
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-xs-12 col-md-6 col-lg-5">
            <q-select
              outlined
              dense
              rounded
              v-model="campanhaSelecionada"
              :options="campanhasOptions"
              option-value="id"
              option-label="name"
              label="Selecione uma Campanha"
              emit-value
              map-options
              @input="onCampanhaChange"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption>
                      Início: {{ formatarData(scope.opt.start) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="statusColor(scope.opt.status)" :label="statusLabel(scope.opt.status)" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <div v-if="reportData && reportData.campaign" class="col-xs-12 col-md-6 col-lg-7">
            <div class="row items-center q-gutter-sm justify-end">
              <q-chip outline color="primary" icon="event">
                Programada: {{ formatarData(reportData.campaign.start) }}
              </q-chip>
              <q-badge
                class="q-pa-sm text-subtitle2"
                :color="statusColor(reportData.campaign.status)"
                :label="statusLabel(reportData.campaign.status)"
              />
              <q-chip v-if="reportData.campaign.mediaUrl" color="purple-1" text-color="purple-9" icon="attachment">
                Com Mídia Anexa
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Indicador de Carregamento -->
    <div v-if="loading" class="row justify-center q-my-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <!-- Conteúdo do Relatório -->
    <div v-else-if="reportData">
      <!-- 1. KPI Cards -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- Total -->
        <div class="col-xs-12 col-sm-6 col-md-2-4 col-lg-2-4">
          <q-card bordered class="shadow-1 rounded-borders card-kpi">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-caption text-uppercase text-weight-bold text-grey-7">Total Destinatários</div>
                <div class="text-h4 text-weight-bold text-indigo-9 q-mt-xs">{{ reportData.metrics.total }}</div>
                <div class="text-caption text-grey-6">{{ reportData.metrics.pendentesEnvio }} pendentes</div>
              </div>
              <div class="col-auto">
                <q-avatar size="48px" font-size="28px" color="indigo-1" text-color="indigo-8" icon="people" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Enviadas -->
        <div class="col-xs-12 col-sm-6 col-md-2-4 col-lg-2-4">
          <q-card bordered class="shadow-1 rounded-borders card-kpi">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-caption text-uppercase text-weight-bold text-grey-7">Enviadas</div>
                <div class="text-h4 text-weight-bold text-blue-8 q-mt-xs">{{ reportData.metrics.enviadas }}</div>
                <div class="text-caption text-grey-6">{{ calcPercent(reportData.metrics.enviadas, reportData.metrics.total) }}% da base</div>
              </div>
              <div class="col-auto">
                <q-avatar size="48px" font-size="28px" color="blue-1" text-color="blue-8" icon="send" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Entregues -->
        <div class="col-xs-12 col-sm-6 col-md-2-4 col-lg-2-4">
          <q-card bordered class="shadow-1 rounded-borders card-kpi">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-caption text-uppercase text-weight-bold text-grey-7">Entregues</div>
                <div class="text-h4 text-weight-bold text-teal-8 q-mt-xs">{{ reportData.metrics.entregues }}</div>
                <div class="text-caption text-teal-9 text-weight-bold">
                  {{ reportData.metrics.taxaEntrega }}% entrega
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="48px" font-size="28px" color="teal-1" text-color="teal-8" icon="done_all" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Lidas -->
        <div class="col-xs-12 col-sm-6 col-md-2-4 col-lg-2-4">
          <q-card bordered class="shadow-1 rounded-borders card-kpi">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-caption text-uppercase text-weight-bold text-grey-7">Lidas / Visualizadas</div>
                <div class="text-h4 text-weight-bold text-positive q-mt-xs">{{ reportData.metrics.lidas }}</div>
                <div class="text-caption text-positive text-weight-bold">
                  {{ reportData.metrics.taxaLeitura }}% de abertura
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="48px" font-size="28px" color="green-1" text-color="positive" icon="visibility" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Falhas -->
        <div class="col-xs-12 col-sm-6 col-md-2-4 col-lg-2-4">
          <q-card bordered class="shadow-1 rounded-borders card-kpi">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="text-caption text-uppercase text-weight-bold text-grey-7">Falhas / Erros</div>
                <div class="text-h4 text-weight-bold text-negative q-mt-xs">{{ reportData.metrics.falhas }}</div>
                <div class="text-caption text-negative text-weight-bold">
                  {{ reportData.metrics.taxaFalha }}% falhas
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="48px" font-size="28px" color="red-1" text-color="negative" icon="error_outline" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- 2. Funil de Conversão / Progresso -->
      <q-card bordered class="q-mb-md shadow-1 rounded-borders">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-sm">
            <q-icon name="filter_alt" color="primary" class="q-mr-xs" size="sm" />
            Funil de Desempenho da Campanha
          </div>
          <div class="row q-col-gutter-lg items-center">
            <div class="col-xs-12 col-md-4">
              <div class="row justify-between text-caption text-grey-8 q-mb-xs">
                <span>Disparos Realizados (Enviadas / Base)</span>
                <span class="text-weight-bold">{{ calcPercent(reportData.metrics.enviadas, reportData.metrics.total) }}%</span>
              </div>
              <q-linear-progress
                rounded
                size="12px"
                :value="getProgresso(reportData.metrics.enviadas, reportData.metrics.total)"
                color="blue-7"
                track-color="blue-1"
              />
            </div>

            <div class="col-xs-12 col-md-4">
              <div class="row justify-between text-caption text-grey-8 q-mb-xs">
                <span>Taxa de Entrega (Entregues / Enviadas)</span>
                <span class="text-weight-bold">{{ calcPercent(reportData.metrics.entregues, reportData.metrics.enviadas) }}%</span>
              </div>
              <q-linear-progress
                rounded
                size="12px"
                :value="getProgresso(reportData.metrics.entregues, reportData.metrics.enviadas)"
                color="teal-7"
                track-color="teal-1"
              />
            </div>

            <div class="col-xs-12 col-md-4">
              <div class="row justify-between text-caption text-grey-8 q-mb-xs">
                <span>Taxa de Leitura (Lidas / Entregues)</span>
                <span class="text-weight-bold">{{ reportData.metrics.taxaLeitura }}%</span>
              </div>
              <q-linear-progress
                rounded
                size="12px"
                :value="getProgresso(reportData.metrics.lidas, reportData.metrics.entregues)"
                color="positive"
                track-color="green-1"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 3. Performance das Variações A/B/C -->
      <q-card bordered class="q-mb-md shadow-1 rounded-borders">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-bold text-grey-9">
              <q-icon name="mdi-tune" color="primary" class="q-mr-xs" size="sm" />
              Desempenho por Variação de Mensagem (Teste A/B/C)
            </div>
            <div class="text-caption text-grey-6">
              Distribuição aleatória anti-bloqueio e taxa de conversão individual
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div
              v-for="(msgKey, idx) in ['message1', 'message2', 'message3']"
              :key="msgKey"
              class="col-xs-12 col-md-4"
            >
              <q-card
                flat
                bordered
                class="rounded-borders relative-position variation-card"
                :class="{ 'best-variation': isBestVariation(msgKey) }"
              >
                <q-badge
                  v-if="isBestVariation(msgKey)"
                  color="amber-9"
                  floating
                  class="q-pa-xs text-weight-bold"
                >
                  <q-icon name="emoji_events" class="q-mr-xs" /> Melhor Abertura
                </q-badge>

                <q-card-section>
                  <div class="row items-center justify-between">
                    <div class="text-subtitle2 text-weight-bold text-primary">
                      Variação {{ idx + 1 }} ({{ msgKey }})
                    </div>
                    <q-chip
                      size="sm"
                      outline
                      color="positive"
                      class="text-weight-bold"
                    >
                      {{ calcTaxaLeitura(reportData.variations[msgKey]) }}% lidas
                    </q-chip>
                  </div>

                  <div class="row q-gutter-md q-my-sm">
                    <div>
                      <div class="text-caption text-grey-7">Envios</div>
                      <div class="text-h6 text-weight-bold">{{ reportData.variations[msgKey].total }}</div>
                    </div>
                    <q-separator vertical />
                    <div>
                      <div class="text-caption text-grey-7">Lidas</div>
                      <div class="text-h6 text-weight-bold text-positive">{{ reportData.variations[msgKey].lidas }}</div>
                    </div>
                  </div>

                  <div class="q-mt-sm">
                    <div class="text-caption text-grey-7 q-mb-xs">Prévia do Texto:</div>
                    <div class="text-body2 text-grey-8 message-preview-box">
                      {{ reportData.variations[msgKey].text || 'Nenhum texto cadastrado' }}
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 4. Detalhamento dos Contatos -->
      <q-card bordered class="shadow-1 rounded-borders">
        <q-card-section class="row items-center justify-between q-pb-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold text-grey-9">
              <q-icon name="contacts" color="primary" class="q-mr-xs" size="sm" />
              Contatos da Campanha ({{ contatosFiltrados.length }})
            </div>
            <div class="text-caption text-grey-6">Status detalhado de cada destinatário</div>
          </div>

          <!-- Filtros de Busca e Status -->
          <div class="row items-center q-gutter-sm">
            <q-input
              v-model="filtroBusca"
              dense
              outlined
              rounded
              placeholder="Buscar por nome ou número..."
              class="search-input"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-select
              v-model="filtroStatus"
              dense
              outlined
              rounded
              emit-value
              map-options
              :options="opcoesFiltroStatus"
              label="Filtrar por Status"
              style="min-width: 170px"
            />

            <q-select
              v-model="filtroVariacao"
              dense
              outlined
              rounded
              emit-value
              map-options
              :options="opcoesFiltroVariacao"
              label="Variação"
              style="min-width: 130px"
            />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-table
            :data="contatosFiltrados"
            :columns="colunasContatos"
            row-key="campaignContactId"
            :pagination.sync="pagination"
            flat
            bordered
            separator="horizontal"
            no-data-label="Nenhum contato encontrado com os filtros selecionados"
          >
            <!-- Coluna Contato -->
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <q-avatar size="36px" color="grey-3" text-color="primary" class="q-mr-sm">
                    <img v-if="props.row.profilePicUrl" :src="props.row.profilePicUrl" />
                    <span v-else>{{ obterIniciais(props.row.name) }}</span>
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-grey-9">{{ props.row.name || 'Sem nome' }}</div>
                    <div class="text-caption text-grey-6">{{ formatarTelefone(props.row.number) }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Coluna Status (ACK) -->
            <template v-slot:body-cell-ack="props">
              <q-td :props="props" class="text-center">
                <q-chip
                  dense
                  :color="ackChipColor(props.row.ack)"
                  :text-color="ackTextColor(props.row.ack)"
                  :icon="ackIcon(props.row.ack)"
                  class="text-weight-bold text-caption"
                >
                  {{ ackLabel(props.row.ack) }}
                </q-chip>
              </q-td>
            </template>

            <!-- Coluna Variação -->
            <template v-slot:body-cell-messageRandom="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  outline
                  :color="props.row.messageRandom ? 'primary' : 'grey'"
                  :label="variacaoLabel(props.row.messageRandom)"
                />
              </q-td>
            </template>

            <!-- Coluna Data/Hora -->
            <template v-slot:body-cell-updatedAt="props">
              <q-td :props="props" class="text-center">
                <span class="text-caption text-grey-8">
                  {{ formatarDataHora(props.row.timestamp || props.row.updatedAt) }}
                </span>
              </q-td>
            </template>

            <!-- Coluna Mensagem Enviada -->
            <template v-slot:body-cell-mensagemEnviada="props">
              <q-td :props="props">
                <div class="row items-center no-wrap">
                  <div class="ellipsis" style="max-width: 250px;">
                    {{ props.row.mensagemEnviada || getTextoPorVariacao(props.row.messageRandom) || '-' }}
                  </div>
                  <q-btn
                    v-if="props.row.mensagemEnviada || getTextoPorVariacao(props.row.messageRandom)"
                    flat
                    round
                    dense
                    size="sm"
                    icon="visibility"
                    color="primary"
                    @click="abrirMensagemCompleta(props.row)"
                  >
                    <q-tooltip>Ver texto completo</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Empty State quando nenhuma campanha estiver selecionada -->
    <div v-else class="text-center q-my-xl">
      <q-icon name="campaign" size="80px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-sm">Selecione uma campanha acima para visualizar as métricas</div>
    </div>

    <!-- Dialog para ver mensagem completa -->
    <q-dialog v-model="modalMensagem.aberto">
      <q-card style="min-width: 350px; max-width: 500px;">
        <q-card-section class="row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">Mensagem Enviada</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pt-md">
          <div class="text-caption text-grey-7 q-mb-xs">Destinatário: <strong>{{ modalMensagem.nome }}</strong> ({{ modalMensagem.numero }})</div>
          <div class="q-pa-md bg-grey-1 rounded-borders text-body2" style="white-space: pre-wrap;">
            {{ modalMensagem.texto }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ListarCampanhas, RelatorioCampanha } from 'src/service/campanhas'
import { format, parseISO } from 'date-fns'
import XLSX from 'xlsx'

export default {
  name: 'RelatorioCampanhas',
  data () {
    return {
      loading: false,
      campanhas: [],
      campanhaSelecionada: null,
      reportData: null,
      filtroBusca: '',
      filtroStatus: 'todos',
      filtroVariacao: 'todas',
      pagination: {
        rowsPerPage: 15,
        sortBy: 'name',
        descending: false
      },
      opcoesFiltroStatus: [
        { label: 'Todos os Status', value: 'todos' },
        { label: 'Lidas', value: '3' },
        { label: 'Entregues', value: '2' },
        { label: 'Enviadas', value: '1' },
        { label: 'Pendentes', value: '0' },
        { label: 'Falhas', value: '-1' }
      ],
      opcoesFiltroVariacao: [
        { label: 'Todas as Variações', value: 'todas' },
        { label: 'Mensagem 1', value: 'message1' },
        { label: 'Mensagem 2', value: 'message2' },
        { label: 'Mensagem 3', value: 'message3' }
      ],
      colunasContatos: [
        { name: 'name', label: 'Contato', align: 'left', field: 'name', sortable: true },
        { name: 'ack', label: 'Status Envio', align: 'center', field: 'ack', sortable: true },
        { name: 'messageRandom', label: 'Variação', align: 'center', field: 'messageRandom', sortable: true },
        { name: 'updatedAt', label: 'Data / Hora', align: 'center', field: 'updatedAt', sortable: true },
        { name: 'mensagemEnviada', label: 'Mensagem', align: 'left', field: 'mensagemEnviada' }
      ],
      modalMensagem: {
        aberto: false,
        nome: '',
        numero: '',
        texto: ''
      }
    }
  },
  computed: {
    campanhasOptions () {
      return this.campanhas
    },
    contatosFiltrados () {
      if (!this.reportData || !this.reportData.contacts) return []

      return this.reportData.contacts.filter(c => {
        // Filtro por busca
        if (this.filtroBusca) {
          const termo = this.filtroBusca.toLowerCase()
          const matchNome = c.name && c.name.toLowerCase().includes(termo)
          const matchNumero = c.number && c.number.includes(termo)
          if (!matchNome && !matchNumero) return false
        }

        // Filtro por status ACK
        if (this.filtroStatus !== 'todos') {
          const statusAlvo = parseInt(this.filtroStatus)
          if (c.ack !== statusAlvo) return false
        }

        // Filtro por variação
        if (this.filtroVariacao !== 'todas') {
          if (c.messageRandom !== this.filtroVariacao) return false
        }

        return true
      })
    }
  },
  methods: {
    async listarCampanhas () {
      try {
        const { data } = await ListarCampanhas()
        this.campanhas = data || []

        // Verifica se há campaignId na URL
        const queryCampaignId = this.$route.query.campaignId
        if (queryCampaignId) {
          const found = this.campanhas.find(c => String(c.id) === String(queryCampaignId))
          if (found) {
            this.campanhaSelecionada = found.id
            await this.carregarRelatorio()
            return
          }
        }

        // Seleciona a primeira campanha disponível
        if (this.campanhas.length > 0) {
          this.campanhaSelecionada = this.campanhas[0].id
          await this.carregarRelatorio()
        }
      } catch (err) {
        this.$notificarErro('Erro ao listar campanhas.')
      }
    },
    async onCampanhaChange (campaignId) {
      if (campaignId) {
        await this.carregarRelatorio()
      }
    },
    async carregarRelatorio () {
      if (!this.campanhaSelecionada) return
      this.loading = true
      try {
        const { data } = await RelatorioCampanha(this.campanhaSelecionada)
        this.reportData = data
      } catch (err) {
        this.$notificarErro('Erro ao carregar dados do relatório da campanha.')
      } finally {
        this.loading = false
      }
    },
    calcPercent (parte, total) {
      if (!total || total === 0) return '0.0'
      return ((parte / total) * 100).toFixed(1)
    },
    getProgresso (parte, total) {
      if (!total || total === 0) return 0
      return Math.min(parte / total, 1)
    },
    calcTaxaLeitura (variation) {
      if (!variation || !variation.total || variation.total === 0) return '0.0'
      return ((variation.lidas / variation.total) * 100).toFixed(1)
    },
    isBestVariation (msgKey) {
      if (!this.reportData || !this.reportData.variations) return false
      const v1 = parseFloat(this.calcTaxaLeitura(this.reportData.variations.message1))
      const v2 = parseFloat(this.calcTaxaLeitura(this.reportData.variations.message2))
      const v3 = parseFloat(this.calcTaxaLeitura(this.reportData.variations.message3))
      const max = Math.max(v1, v2, v3)
      if (max <= 0) return false
      const current = parseFloat(this.calcTaxaLeitura(this.reportData.variations[msgKey]))
      return current === max
    },
    statusColor (status) {
      switch (status) {
        case 'pending': return 'warning'
        case 'scheduled': return 'info'
        case 'processing': return 'primary'
        case 'canceled': return 'negative'
        case 'finished': return 'positive'
        default: return 'grey'
      }
    },
    statusLabel (status) {
      switch (status) {
        case 'pending': return 'Pendente'
        case 'scheduled': return 'Agendada'
        case 'processing': return 'Em Processamento'
        case 'canceled': return 'Cancelada'
        case 'finished': return 'Concluída'
        default: return status || 'Desconhecido'
      }
    },
    ackLabel (ack) {
      switch (ack) {
        case 3: return 'Lida'
        case 2: return 'Entregue'
        case 1: return 'Enviada'
        case 0: return 'Pendente'
        case -1: return 'Falha'
        default: return 'Pendente'
      }
    },
    ackChipColor (ack) {
      switch (ack) {
        case 3: return 'green-1'
        case 2: return 'blue-1'
        case 1: return 'grey-2'
        case 0: return 'amber-1'
        case -1: return 'red-1'
        default: return 'grey-1'
      }
    },
    ackTextColor (ack) {
      switch (ack) {
        case 3: return 'positive'
        case 2: return 'primary'
        case 1: return 'grey-8'
        case 0: return 'warning'
        case -1: return 'negative'
        default: return 'grey-8'
      }
    },
    ackIcon (ack) {
      switch (ack) {
        case 3: return 'done_all'
        case 2: return 'done_all'
        case 1: return 'done'
        case 0: return 'schedule'
        case -1: return 'error'
        default: return 'schedule'
      }
    },
    variacaoLabel (msgRandom) {
      switch (msgRandom) {
        case 'message1': return 'Mensagem 1'
        case 'message2': return 'Mensagem 2'
        case 'message3': return 'Mensagem 3'
        default: return '-'
      }
    },
    getTextoPorVariacao (msgRandom) {
      if (!this.reportData || !this.reportData.campaign) return ''
      return this.reportData.campaign[msgRandom] || ''
    },
    formatarData (dataStr) {
      if (!dataStr) return '-'
      try {
        return format(parseISO(dataStr), 'dd/MM/yyyy HH:mm')
      } catch (e) {
        return dataStr
      }
    },
    formatarDataHora (dataStr) {
      if (!dataStr) return '-'
      try {
        return format(parseISO(dataStr), 'dd/MM/yyyy HH:mm:ss')
      } catch (e) {
        return dataStr
      }
    },
    formatarTelefone (num) {
      if (!num) return '-'
      return num
    },
    obterIniciais (nome) {
      if (!nome) return '?'
      const partes = nome.trim().split(' ')
      if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase()
      return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
    },
    abrirMensagemCompleta (row) {
      this.modalMensagem = {
        aberto: true,
        nome: row.name || 'Sem Nome',
        numero: row.number,
        texto: row.mensagemEnviada || this.getTextoPorVariacao(row.messageRandom)
      }
    },
    exportarExcel () {
      if (!this.reportData || !this.reportData.contacts) return

      /* eslint-disable quote-props */
      const dadosExport = this.contatosFiltrados.map(c => ({
        'Nome': c.name || '',
        'Telefone': c.number || '',
        'Status': this.ackLabel(c.ack),
        'Variação': this.variacaoLabel(c.messageRandom),
        'Data/Hora Envio': this.formatarDataHora(c.timestamp || c.updatedAt),
        'Mensagem Enviada': c.mensagemEnviada || this.getTextoPorVariacao(c.messageRandom)
      }))
      /* eslint-enable quote-props */

      const ws = XLSX.utils.json_to_sheet(dadosExport)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Contatos da Campanha')

      // Nome do arquivo com nome da campanha e data
      const campName = (this.reportData.campaign.name || 'Campanha').replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `Relatorio_${campName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(wb, fileName)
      this.$notificarSucesso('Relatório exportado com sucesso!')
    }
  },
  mounted () {
    this.listarCampanhas()
  }
}
</script>

<style scoped>
.card-kpi {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-kpi:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.col-md-2-4 {
  width: 20%;
}
@media (max-width: 1023px) {
  .col-md-2-4 {
    width: 50%;
  }
}
@media (max-width: 599px) {
  .col-md-2-4 {
    width: 100%;
  }
}
.search-input {
  min-width: 260px;
}
.message-preview-box {
  background-color: #f8fafc;
  border-left: 3px solid #cbd5e1;
  padding: 8px 12px;
  border-radius: 4px;
  max-height: 85px;
  overflow-y: auto;
  font-size: 0.82rem;
  line-height: 1.35;
  white-space: pre-wrap;
}
.variation-card {
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}
.best-variation {
  border: 2px solid #f59e0b !important;
  background-color: #fffbeb;
}
</style>
