<template>
  <div class="q-pa-md">
    <div class="row justify-between items-center q-mb-md">
      <div class="text-h6">Logs do Sistema</div>
      <div>
        <q-btn icon="refresh" color="primary" label="Atualizar" @click="fetchLogs" class="q-mr-sm" />
        <q-btn icon="delete" color="negative" label="Limpar Logs" @click="clearLogs" />
      </div>
    </div>

    <q-card class="bg-dark text-white" style="height: 70vh; overflow: hidden; border-radius: 8px;">
      <q-scroll-area style="height: 100%; width: 100%;">
        <div class="q-pa-md" style="font-family: monospace; white-space: pre-wrap; font-size: 13px;">
          {{ logs || 'Nenhum log encontrado.' }}
        </div>
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script>
import request from 'src/service/request'

export default {
  name: 'SystemLogs',
  data () {
    return {
      logs: ''
    }
  },
  mounted () {
    this.fetchLogs()
  },
  methods: {
    async fetchLogs () {
      try {
        const { data } = await request.get('/logs/system')
        this.logs = data.logs
      } catch (e) {
        this.$notificarErro('Erro ao carregar logs')
      }
    },
    async clearLogs () {
      this.$q.dialog({
        title: 'Atenção',
        message: 'Deseja realmente limpar o arquivo de logs?',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await request.delete('/logs/system')
          this.logs = ''
          this.$notificarSucesso('Logs limpos com sucesso')
        } catch (e) {
          this.$notificarErro('Erro ao limpar logs')
        }
      })
    }
  }
}
</script>
