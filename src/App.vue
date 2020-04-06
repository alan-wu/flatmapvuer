<template>
  <div id="app">
    <MultiFlatmapVuer :availableSpecies="availableSpecies" @resource-selected="FlatmapSelected" 
    @ready="FlatmapReady" :featureInfo="featureInfo" :searchable="searchable" />
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import MultiFlatmapVuer from './components/MultiFlatmapVuer.vue'
import {
  RadioButton,
  RadioGroup
} from 'element-ui';
import "./styles/purple/radio-button.css";
import "./styles/purple/radio-group.css";
import "./icons/mapicon-species-style.css";
Vue.use(RadioButton);
Vue.use(RadioGroup);

export default {
  name: 'app',
  methods: {
    FlatmapSelected: function(resource) {
      console.log(resource)
    },
    FlatmapReady: function(component) {
      console.log(component.getLabels());
    }
  },
  data: function(){
    return {
      featureInfo: true,
      searchable: true,
      availableSpecies : {"Human":{taxo: "NCBITaxon:9606", iconClass:"icon-mapicon_human"},
        "Rat":{taxo: "NCBITaxon:10114", iconClass:"icon-mapicon_rat"} }
    }
  },
  components: {
    MultiFlatmapVuer
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

.el-tabs__content {
  height:100%;
}
</style>
