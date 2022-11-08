<template>
  <div id="app">
    <el-popover
      placement="bottom"
      trigger="click"
      width=500
      class="popover"
      :appendToBody=false
      >
      <div class="options-container">
        <el-row :gutter="20">
          <el-button @click="helpMode = !helpMode" size="mini">Help Mode</el-button>
          <el-button @click="saveSettings()" size="mini">Save Settings</el-button>
          <el-button @click="restoreSettings()" size="mini">Restore Settings</el-button>
        </el-row>
      </div>
      <el-button class="options-button" icon="el-icon-setting" slot="reference">Options</el-button>
    </el-popover>
  
    <MultiFlatmapVuer ref="multi" :availableSpecies="availableSpecies" 
      @resource-selected="FlatmapSelected" :minZoom="minZoom"
      @pan-zoom-callback="panZoomcallback"
      @ready="FlatmapReady" :featureInfo="featureInfo" :searchable="searchable" 
      :initial="initial" :pathControls="pathControls" :helpMode="helpMode"
      :displayMinimap=true :flatmapAPI="flatmapAPI"/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import MultiFlatmapVuer from './components/MultiFlatmapVuer.vue'
import {
  Button,
  Col,
  Popover,
  Row,
} from 'element-ui';
import "./icons/mapicon-species-style.css";
Vue.use(Button);
Vue.use(Col);
Vue.use(Popover);
Vue.use(Row);

export default {
  name: 'app',
  methods: {
    saveSettings: function() {
      this._mapSettings.push(this.$refs.multi.getState());
    },
    restoreSettings: function() {
      if (this._mapSettings.length > 0)
        this.$refs.multi.setState(this._mapSettings.pop());
    },
    FlatmapSelected: function(resource) {
      if (resource.eventType === "click")
        console.log('resource', resource);
    },
    FlatmapReady: function(component) {
      let taxon = component.mapImp.describes;
      let id = component.mapImp.addMarker("UBERON:0000948", "simulation");
      component.enablePanZoomEvents(true);
      component.showPathwaysDrawer(false);
      console.log(taxon, id);
      component.searchAndShowResult("heart");
    },
    panZoomcallback: function(payload) {
      this.payload = payload
    }
  },
  data: function(){
    return {
      featureInfo: true,
      searchable: true,
      pathControls: true,
      minZoom: 4,
      availableSpecies : {"Human Female":{id: "human-flatmap_female", taxo: "NCBITaxon:9606", iconClass:"mapicon-icon_human", displayWarning:true},
        "Human Male":{id: "human-flatmap_male", taxo: "NCBITaxon:9606", iconClass:"mapicon-icon_human", displayWarning:true},
        "Rat":{taxo: "NCBITaxon:10114", iconClass:"mapicon-icon_rat", displayWarning:false, displayLatestChanges:true},
        "Mouse":{taxo: "NCBITaxon:10090", iconClass:"mapicon-icon_mouse", displayWarning:true},
        "Kember":{taxo: "ABI:1000001", displayWarning:true},
        "Pig":{taxo: "NCBITaxon:9823", iconClass:"mapicon-icon_pig", displayWarning:true}, 
        "Cat":{taxo: "NCBITaxon:9685", iconClass:"mapicon-icon_cat", displayWarning:true},
        "digestive tract":{taxo: "digestive tract", displayWarning:true}
      },
      tooltipContent: undefined,
      tStyle: {
        top: "200px",
        left: "200px",
        position: "absolute"
      },
      displayCloseButton: false,
      initial: "Rat",
      helpMode: false,
<<<<<<< HEAD
      //flatmapAPI: "https://mapcore-demo.org/current/flatmap/v2/"
      //flatmapAPI: "https://mapcore-demo.org/devel/flatmap/v3/"
       flatmapAPI: "https://mapcore-demo.org/fccb/flatmap/"
=======
      flatmapAPI: "https://mapcore-demo.org/current/flatmap/v2/"
      // flatmapAPI: "https://mapcore-demo.org/devel/flatmap/v3/"
      //flatmapAPI: "https://mapcore-demo.org/fccb/flatmap/"
>>>>>>> 8b6e5c3b6a70d65b5807cf82a85e581dc14f1cfa
      // flatmapAPI: "https://mapcore-demo.org/devel/flatmap/v1/"
    }
  },
  mounted: function() {
    this._mapSettings = [];
  },
  components: {
    MultiFlatmapVuer,
  }
}
</script>

<style lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/col";
@import "~element-ui/packages/theme-chalk/src/popover";
@import "~element-ui/packages/theme-chalk/src/row";

#app {
  font-family: 'Asap', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  width: 100%;
  position:absolute;
}

.mapboxgl-ctrl-top-left .mapboxgl-ctrl {
  margin-top:120px;
}

body {
  margin: 0px;
}

.mapboxgl-ctrl-top-left .mapboxgl-ctrl {
  margin-top:120px;
}

.popover{
  top:5px;
  right:calc( 50% - 20px);
  position:absolute;
  z-index:1000;
}

.el-row {
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
}

.options-container{

  text-align: center;
}

.el-tabs__content {
  height:100%;
}

</style>
