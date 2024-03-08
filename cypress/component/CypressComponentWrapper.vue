<template>
  <Component
    ref="component"
    :is="component"
    v-bind="props"
    @vue:mounted="componentMounted"
    @ready="flatmapReady"
  />
</template>

<script>
import FlatmapVuer from '/src/components/FlatmapVuer.vue'
import MultiFlatmapVuer from '/src/components/MultiFlatmapVuer.vue'

export default {
  name: 'CypressComponentWrapper',
  components: {
    FlatmapVuer,
    MultiFlatmapVuer,
  },
  props: {
    component: {
      type: String,
      required: true,
    },
    props: {
      type: Object,
      required: true,
    },
  },
  methods: {
    componentMounted() {
      console.log('Component mounted!')
      window.Cypress.multiFlatmapVuer = this.$refs.component
      if (this.component === 'MultiFlatmapVuer') {
        this.$refs.component.$el.style.position = 'absolute'
      }
    },
    flatmapReady() {
      console.log('Flatmap ready!')
      window.Cypress.flatmapVuer = this.$refs.component.$refs.Test[0]
      console.log('window.Cypress.flatmapVuer', window.Cypress.flatmapVuer)
      this.$emit('ready', true)
    },
  },
}
</script>

<style>

</style>