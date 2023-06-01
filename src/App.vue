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
          <el-button :disabled="mapSettings.length === 0" @click="restoreSettings()" size="mini">Restore Settings</el-button>
          <el-autocomplete class="search-box" placeholder="Search"
            v-model="searchText"
            :fetch-suggestions="fetchSuggestions"
            @keyup.enter.native="search"
            @select="search"
            popper-class="autocomplete-popper">
          </el-autocomplete>
        </el-row>
      </div>
      <el-button class="options-button" icon="el-icon-setting" slot="reference">Options</el-button>
    </el-popover>
  
    <MultiFlatmapVuer ref="multi" :availableSpecies="availableSpecies" 
      @resource-selected="FlatmapSelected" :minZoom="minZoom"
      @pan-zoom-callback="panZoomcallback"
      @ready="FlatmapReady" :featureInfo="featureInfo" :searchable="searchable"
      :layerControl="layerControl"
      :initial="initial" :pathControls="pathControls" :helpMode="helpMode"
      :displayMinimap="true" :flatmapAPI="flatmapAPI"/>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import MultiFlatmapVuer from './components/MultiFlatmapVuer.vue'
import {
  Autocomplete,
  Button,
  Col,
  Popover,
  Row,
} from 'element-ui';
import "./icons/mapicon-species-style.css";
Vue.use(Autocomplete);
Vue.use(Button);
Vue.use(Col);
Vue.use(Popover);
Vue.use(Row);

export default {
  name: 'app',
  methods: {
    saveSettings: function() {
      this.mapSettings.push(this.$refs.multi.getState());
    },
    restoreSettings: function() {
      if (this.mapSettings.length > 0)
        this.$refs.multi.setState(this.mapSettings.pop());
    },
    FlatmapSelected: function(resource) {
      if (resource.eventType === "click") {
        console.log('resource', resource);
      }
    },
    FlatmapReady: function(component) {
      console.log(component);
      let taxon = component.mapImp.describes;
      let id = component.mapImp.addMarker("UBERON:0000948");
      component.enablePanZoomEvents(true);
      //component.showPathwaysDrawer(false);
      console.log(taxon, id);
      //component.searchAndShowResult("heart");
    },
    panZoomcallback: function(payload) {
      this.payload = payload
    },
    fetchSuggestions: function(term, cb) {
      if (term === "") {
        cb([]);
      } else {
        const suggestions = [];
        const results = this.$refs.multi.getCurrentFlatmap().searchSuggestions(term);
        results.__featureIds.forEach(id => {
          const annotation = this.$refs.multi.getCurrentFlatmap().mapImp.annotation(id);
          if (annotation && annotation.label)
            suggestions.push(annotation.label);
        });
        const unique = new Set(suggestions);
        suggestions.length = 0;
        for (const item of unique) {
          suggestions.push({"value": "\"" + item +"\""});
        }
        cb(suggestions);
      }
    },
    search: function() {
      console.log(this.searchText)
      this.$refs.multi.getCurrentFlatmap().searchAndShowResult(this.searchText, true);
    }
  },
  data: function(){
    return {
      searchText: "",
      featureInfo: true,
      searchable: true,
      pathControls: true,
      layerControl: true,
      minZoom: 4,
      availableSpecies : {
        "Human Female":{taxo: "NCBITaxon:9606", biologicalSex: "PATO:0000383", iconClass:"mapicon-icon_human", displayWarning:true},
        "Human Male":{taxo: "NCBITaxon:9606", biologicalSex: "PATO:0000384", iconClass:"mapicon-icon_human", displayWarning:true},
        "Rat":{taxo: "NCBITaxon:10114", iconClass:"mapicon-icon_rat", displayWarning:true, displayLatestChanges:true},
        "Mouse":{taxo: "NCBITaxon:10090", iconClass:"mapicon-icon_mouse", displayWarning:true},
        "Kember":{taxo: "ABI:1000001", displayWarning:true},
        "Pig":{taxo: "NCBITaxon:9823", iconClass:"mapicon-icon_pig", displayWarning:true}, 
        "Cat":{taxo: "NCBITaxon:9685", iconClass:"mapicon-icon_cat", displayWarning:true},
        "Functional Connectivity": {taxo: "FunctionalConnectivity", displayWarning:true},
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
      mapSettings: [],
      //flatmapAPI: "https://mapcore-demo.org/current/flatmap/v2/"
      //flatmapAPI: "https://mapcore-demo.org/devel/flatmap/v3/"
      //flatmapAPI: "https://mapcore-demo.org/current/flatmap/v3/"
      flatmapAPI: "https://mapcore-demo.org/devel/flatmap/v4/"
      //flatmapAPI: "https://mapcore-demo.org/staging/flatmap/v1/"
      // flatmapAPI: "https://mapcore-demo.org/devel/flatmap/v1/"
    }
  },
  components: {
    MultiFlatmapVuer,
  }
}
</script>

<style lang="scss">
@import "~element-ui/packages/theme-chalk/src/autocomplete";
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

.search-box {
  margin-top: 2px;
  height:28px;
  ::v-deep .el-input__inner {
    background-color: $background;
    height:28px;
    line-height:28px;
    border: 1px solid rgb(144, 147, 153);
    border-radius: 4px;
    &:focus {
      border-color: $app-primary-color;
    }
  }
}

::v-deep .autocomplete-popper {
  min-width:137px!important;
  width: auto!important;
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
