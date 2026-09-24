<template>
  <q-item
    clickable
    v-ripple
    :active="routeName == cRouterName"
    active-class="tw-bg-primary tw-text-primary-foreground menu-active-shadow"
    @click=" () => !(routeName == cRouterName) ? $router.push({ name: routeName }) : ''"
    class="tw-flex tw-items-center tw-rounded-md tw-transition-colors houverList"
    :class="{'text-negative text-bolder': color === 'negative'}"
  >
    <q-item-section
      v-if="icon"
      avatar
      class="q-pl-xs"
      style="min-width: 40px"
    >
      <q-icon
        :name="color === 'negative' ? 'mdi-cellphone-nfc-off' : icon"
        size="19px"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label class="tw-text-sm">{{ title }}</q-item-label>
      <q-item-label caption>
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'EssentialLink',
  data () {
    return {
      menuAtivo: 'dashboard'
    }
  },
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    color: {
      type: String,
      default: ''
    },

    routeName: {
      type: String,
      default: 'dashboard'
    },

    icon: {
      type: String,
      default: ''
    }
  },
  computed: {
    cRouterName () {
      return this.$route.name
    }
  }
}
</script>
<style lang="sass">
.houverList
  margin: 1px 12px
  min-height: 42px

.houverList:hover:not(.tw-bg-primary)
  background: hsl(210 40% 98%)

body.body--dark .houverList:hover:not(.tw-bg-primary)
  background: #1A1A1A

.menu-active-shadow
  box-shadow: 0 4px 10px -2px hsl(var(--izing-primary) / 0.35)

// Sidebar recolhida: o item vira uma faixa bem estreita, então a margem
// lateral pensada pra sidebar expandida "achata" o badge do ícone ativo.
.q-drawer--mini .houverList
  margin: 4px 8px
  min-height: 40px
  justify-content: center

.q-drawer--mini .q-item__section--avatar
  min-width: 0 !important
  padding-left: 0 !important
  justify-content: center
</style>
