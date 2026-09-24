<template>
  <div class="q-pa-md">
    <div class="q-mb-md">
      <div class="tw-text-lg tw-font-bold tw-text-foreground">Relatórios</div>
      <div class="tw-text-sm tw-text-muted-foreground">Números consolidados de contatos e atendimentos</div>
    </div>
    <div class="row q-col-gutter-md">
      <div
        v-for="menu in cRelatorios"
        :key="menu.name"
        class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-item
          clickable
          v-ripple
          :to="{name: menu.name}"
          class="tw-rounded-lg full-height items-start report-card"
        >
          <q-item-section avatar>
            <div
              class="stat-badge"
              style="background: rgba(225, 6, 40, .12); color: #E10628"
            >
              <q-icon
                :name="cIcones[menu.name] || 'mdi-file-chart-outline'"
                size="20px"
              />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="tw-font-bold tw-text-foreground">{{ menu.titulo }}</q-item-label>
            <q-item-label
              caption
              class="tw-text-muted-foreground"
            >{{ menu.objetivo }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </div>
</template>

<script>
import relatorios from './relatorios.json'
export default {
  name: 'ccListaRelatorios',
  data () {
    return {
      cIcones: {
        'lista-contatos': 'mdi-account-multiple-outline',
        'contatos-por-etiquetas': 'mdi-tag-multiple-outline',
        'contatos-por-estado': 'mdi-map-marker-outline',
        'estatisticas-atendimentos-usuarios': 'mdi-chart-box-outline'
      }
    }
  },
  computed: {
    cRelatorios () {
      return relatorios
    }
  }
}
</script>

<style lang="sass" scoped>
.report-card
  border: 1px solid hsl(214 32% 91%)
  background: #fff
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)

body.body--dark .report-card
  border: 1px solid #262626
  background: #0A0A0A

.stat-badge
  width: 40px
  height: 40px
  border-radius: 10px
  display: flex
  align-items: center
  justify-content: center
</style>
