<template>
  <div class="text-caption text-center bg-grey-1 q-pa-sm">
    Versão Sistema:
    <q-badge align="middle"
      color="primary">
      v{{ cVersion }}
    </q-badge>
    <div class="tw-text-[10px] tw-opacity-60 q-mt-xs">
      Desenvolvido por Agência SA2 Marketing
    </div>
  </div>
</template>
<script>
import packageEnv from 'src/../package.json'
export default {
  name: 'SystemVersion',
  computed: {
    cVersion () {
      return packageEnv.version
    }
  }
}
</script>
<style>

</style>
