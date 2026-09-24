<template>
  <div>
    <q-list class="text-weight-medium">
      <q-item-label
        header
        class="tw-text-lg tw-font-bold tw-text-foreground q-mb-lg"
      >Configurações</q-item-label>

      <q-item-label
        caption
        class="q-mt-lg q-pl-sm"
      >Identidade Visual</q-item-label>
      <q-separator spaced />

      <q-item>
        <q-item-section>
          <q-item-label>Logo (modo claro)</q-item-label>
          <q-item-label caption>Aparece no menu quando o "Modo escuro" está desligado</q-item-label>
        </q-item-section>
        <q-item-section
          avatar
          class="logo-preview logo-preview--light"
        >
          <img
            v-if="logoLightUrl"
            :src="logoLightUrl"
          >
        </q-item-section>
        <q-item-section side>
          <q-btn
            rounded
            outline
            color="primary"
            label="Alterar"
            :loading="enviandoLogo.light"
            @click="$refs.inputLogoLight.click()"
          />
          <input
            ref="inputLogoLight"
            type="file"
            accept="image/png,image/svg+xml,image/webp"
            style="display: none"
            @change="e => enviarLogo('light', e)"
          >
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section>
          <q-item-label>Logo (modo escuro)</q-item-label>
          <q-item-label caption>Aparece no menu quando o "Modo escuro" está ligado — use uma versão clara/branca</q-item-label>
        </q-item-section>
        <q-item-section
          avatar
          class="logo-preview logo-preview--dark"
        >
          <img
            v-if="logoDarkUrl"
            :src="logoDarkUrl"
          >
        </q-item-section>
        <q-item-section side>
          <q-btn
            rounded
            outline
            color="primary"
            label="Alterar"
            :loading="enviandoLogo.dark"
            @click="$refs.inputLogoDark.click()"
          />
          <input
            ref="inputLogoDark"
            type="file"
            accept="image/png,image/svg+xml,image/webp"
            style="display: none"
            @change="e => enviarLogo('dark', e)"
          >
        </q-item-section>
      </q-item>

      <q-item-label
        caption
        class="q-mt-lg q-pl-sm"
      >Módulo: Atendimento</q-item-label>
      <q-separator spaced />

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Não visualizar Tickets já atribuidos à outros usuários</q-item-label>
          <q-item-label caption>Somente o usuário responsável pelo ticket e/ou os administradores visualizarão a atendimento.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewAssignedTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewAssignedTickets')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Não visualizar Tickets no ChatBot</q-item-label>
          <q-item-label caption>Somente administradores poderão visualizar tickets que estivem interagindo com o ChatBot.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewTicketsChatBot"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewTicketsChatBot')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Forçar atendimento via Carteira</q-item-label>
          <q-item-label caption>Caso o contato tenha carteira vínculada, o sistema irá direcionar o atendimento somente para os donos da carteira de clientes.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="DirectTicketsToWallets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('DirectTicketsToWallets')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Fluxo ativo para o Bot de atendimento</q-item-label>
          <q-item-label caption>Fluxo a ser utilizado pelo Bot para os novos atendimentos</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-select
            style="width: 300px"
            outlined
            dense
            rounded
            v-model="botTicketActive"
            :options="listaChatFlow"
            map-options
            emit-value
            option-value="id"
            option-label="name"
            @input="atualizarConfiguracao('botTicketActive')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Ignorar Mensagens de Grupo</q-item-label>
          <q-item-label caption>Habilitando esta opção o sistema não abrirá ticket para grupos</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="ignoreGroupMsg"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="ignoreGroupMsg === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('ignoreGroupMsg')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Recusar chamadas no Whatsapp</q-item-label>
          <q-item-label caption>Quando ativo, as ligações de aúdio e vídeo serão recusadas, automaticamente.</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="rejectCalls"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="rejectCalls === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('rejectCalls')"
          />
        </q-item-section>
      </q-item>

      <div
        class="row q-px-md"
        v-if="rejectCalls === 'enabled'"
      >
        <div class="col-12">
          <q-input
            rounded
            v-model="callRejectMessage"
            type="textarea"
            autogrow
            dense
            outlined
            label="Mensagem ao rejeitar ligação:"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('callRejectMessage')"
          />
        </div>
      </div>

      <q-item-label
        caption
        class="q-mt-lg q-pl-sm"
      >Inatividade do Chatbot</q-item-label>
      <q-separator spaced />

      <div class="row q-px-md q-mb-md">
        <div class="col-12 col-md-4">
          <q-input
            rounded
            outlined
            dense
            v-model="botInactiveWarningTime"
            type="number"
            label="Tempo tolerância para fechar (minutos):"
            @change="atualizarConfiguracao('botInactiveWarningTime')"
          />
        </div>
      </div>
      <div class="row q-px-md q-mb-md">
        <div class="col-12">
          <q-input
            rounded
            v-model="botInactiveWarningMessage"
            type="textarea"
            autogrow
            dense
            outlined
            label="Mensagem de aviso (quando para de responder):"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('botInactiveWarningMessage')"
          />
        </div>
      </div>
      <div class="row q-px-md">
        <div class="col-12">
          <q-input
            rounded
            v-model="botInactiveCloseMessage"
            type="textarea"
            autogrow
            dense
            outlined
            label="Mensagem final de encerramento:"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="atualizarConfiguracao('botInactiveCloseMessage')"
          />
        </div>
      </div>
    </q-list>

  </div>
</template>

<script>
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarConfiguracoes, AlterarConfiguracao, AlterarLogo } from 'src/service/configuracoes'

const chaveLogo = { light: 'logoLightUrl', dark: 'logoDarkUrl' }

export default {
  name: 'IndexConfiguracoes',
  data () {
    return {
      configuracoes: [],
      listaChatFlow: [],
      NotViewAssignedTickets: null,
      NotViewTicketsChatBot: null,
      DirectTicketsToWallets: null,
      botTicketActive: null,
      ignoreGroupMsg: null,
      rejectCalls: null,
      callRejectMessage: '',
      logoLightUrl: null,
      logoDarkUrl: null,
      enviandoLogo: { light: false, dark: false },
      botInactiveWarningTime: '',
      botInactiveWarningMessage: '',
      botInactiveCloseMessage: ''
    }
  },
  methods: {
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach(el => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        if (el.key === 'logoLightUrl' || el.key === 'logoDarkUrl') {
          value = value ? `${process.env.VUE_URL_API}${value}` : null
        }
        this.$data[el.key] = value
      })
    },
    async enviarLogo (tipo, event) {
      const file = event.target.files && event.target.files[0]
      if (!file) return
      this.enviandoLogo[tipo] = true
      try {
        const { data } = await AlterarLogo(tipo, file)
        this.$data[chaveLogo[tipo]] = `${process.env.VUE_URL_API}${data.value}?t=${Date.now()}`
        this.$q.notify({
          type: 'positive',
          message: 'Logo atualizada! Recarregue a página para ver em todo o sistema.',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error('error - AlterarLogo', error)
        this.$notificarErro('Não foi possível enviar a logo', error)
      } finally {
        this.enviandoLogo[tipo] = false
        event.target.value = ''
      }
    },
    async listarChatFlow () {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async atualizarConfiguracao (key) {
      const params = {
        key,
        value: this.$data[key]
      }
      try {
        await AlterarConfiguracao(params)
        this.$q.notify({
          type: 'positive',
          message: 'Configuração alterada!',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
        this.$notificarErro('Ocorreu um erro!', error)
      }
    }
  },
  async mounted () {
    await this.listarConfiguracoes()
    await this.listarChatFlow()
  }
}
</script>

<style lang="sass" scoped>
.logo-preview
  min-width: 140px
  height: 46px
  border-radius: 8px
  display: flex
  align-items: center
  justify-content: center
  padding: 4px 10px

  img
    max-width: 100%
    max-height: 100%
    object-fit: contain

.logo-preview--light
  background: #fff
  border: 1px solid hsl(37 20% 88%)

.logo-preview--dark
  background: #0A0A0A
  border: 1px solid #262626
</style>
