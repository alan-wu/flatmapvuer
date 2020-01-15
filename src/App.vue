<template>
  <div id="app">
    <el-tabs :tab-position="tabPosition" style="height: 100%;">
      <el-tab-pane v-for="item in displays" :key="item.ref" :label="item.ref" style="height:100%">
        <FlatmapVuer :entry="item.entry" :ref="item.ref" v-on:resource-selected="FlatmapSelected" style="height:100%"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import FlatmapVuer from './components/FlatmapVuer.vue'
import { Tabs, TabPane } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.component(Tabs.name, Tabs);
Vue.component(TabPane.name, TabPane);


export default {
  name: 'app',
  methods: {
    FlatmapSelected: function(resource) {
      console.log(resource)
    }
  },
  data: function(){
    return {
      tabPosition: 'left',
      displays:[ {entry:"NCBITaxon:10114", ref:"rat"}, {entry:"NCBITaxon:9606", ref:"human"}]
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

.el-tabs__content {
  height:100%;
}
</style>
