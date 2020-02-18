<template>
  <div id="app">
    <el-radio-group v-model="species" size="small">
      <el-radio-button label="Human"></el-radio-button>
      <el-radio-button label="Rat"></el-radio-button>
    </el-radio-group>
    <FlatmapVuer v-show="species=='Human'" entry="NCBITaxon:9606" ref="Human" v-on:resource-selected="FlatmapSelected" @ready="FlatmapReady" style="height:100%" key="Human"/>
    <FlatmapVuer v-show="species=='Rat'" entry="NCBITaxon:10114" ref="Rat" v-on:resource-selected="FlatmapSelected" @ready="FlatmapReady" style="height:100%" key="Rat"/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import FlatmapVuer from './components/FlatmapVuer.vue'
import {
  RadioButton,
  RadioGroup
} from 'element-ui';
import "./styles/purple/radio-button.css";
import "./styles/purple/radio-group.css";
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
      taxo:"NCBITaxon:9606",
      species:"Human"
    }
  },
  components: {
    FlatmapVuer
  },
  watch: {
    species: function (val) {
      switch (val) {
        case "Human":
          this.taxo = "NCBITaxon:9606";
          break;
        case "Rat":
          this.taxo = "NCBITaxon:10114";
          break;
        default:
          break;
      }
    }
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
