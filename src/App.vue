<template>
  <div id="app">
    <FlatmapVuer entry="NCBITaxon:10114" ref="flatmap" v-on:resource-selected="FlatmapSelected"/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import FlatmapVuer from './components/FlatmapVuer.vue'

export default {
  name: 'app',
  methods: {
    FlatmapSelected: function(resources) {
      console.log(resources);
    }
  },
  components: {
    FlatmapVuer
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  width: 100%;
  position:absolute;
}

body {
  margin: 0px;
}
</style>
