<template>
  <Component
    ref="component"
    :is="component"
    v-bind="props"
    @vue:mounted="componentMounted"
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
      if (this.component === 'MultiFlatmapVuer') {
        this.$refs.component.$el.style.position = 'absolute'
      }
    },
  },
}
</script>

<style>

</style>