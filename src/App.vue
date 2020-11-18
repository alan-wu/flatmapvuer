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
      <el-button icon="el-icon-setting" slot="reference">Options</el-button>
    </el-popover>
  
    <MultiFlatmapVuer ref="multi" :availableSpecies="availableSpecies" 
    @resource-selected="FlatmapSelected" :minZoom="minZoom"
      @ready="FlatmapReady" :featureInfo="featureInfo" :searchable="searchable" 
      :initial="initial" :pathControls="pathControls" :helpMode="helpMode"
      :displayMinimap=true :flatmapAPI="flatmapAPI"/>
    <div>
      <TooltipVuer placement="bottom" :visible="visible" :content="tContent" 
        :position="tStyle" :displayCloseButton="displayCloseButton" ref="tooltip" @onActionClick="onActionClick"/>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import MultiFlatmapVuer from './components/MultiFlatmapVuer.vue'
import { TooltipVuer } from '@abi-software/maptooltip';
import '@abi-software/maptooltip/dist/maptooltip.css';
import {
  Col,
  Popover,
  RadioButton,
  RadioGroup,
  Row,
} from 'element-ui';
import "./styles/purple/radio-button.css";
import "./styles/purple/radio-group.css";
import "./icons/mapicon-species-style.css";
Vue.use(Col);
Vue.use(Popover);
Vue.use(RadioButton);
Vue.use(RadioGroup);
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
      let tooltip = this.$refs.tooltip;
      this.$refs.multi.showMarkerPopup(resource.feature.id, tooltip.$refs.content.$vnode.elm);
    },
    FlatmapReady: function(component) {
      let taxon = component.mapImp.describes;
      let id = component.mapImp.addMarker("UBERON:0000948", "simulation");
      console.log(taxon, id);
    },
    onActionClick: function(action) {
      console.log("onActionClick", action);
    }
  },
  data: function(){
    return {
      featureInfo: false,
      searchable: false,
      pathControls: true,
      minZoom: 4,
      availableSpecies : {"Human":{taxo: "NCBITaxon:9606", iconClass:"icon-mapicon_human", displayWarning:true},
        "Rat":{taxo: "NCBITaxon:10114", iconClass:"icon-mapicon_rat", displayWarning:false},
        "Mouse":{taxo: "NCBITaxon:10090", iconClass:"icon-mapicon_mouse", displayWarning:true},
        "Kember":{taxo: "ABI:1000001", displayWarning:true},
        "Pig":{taxo: "NCBITaxon:9823", iconClass:"icon-mapicon_pig", displayWarning:true}, 
        "Cat":{taxo: "NCBITaxon:9685", iconClass:"icon-mapicon_cat", displayWarning:true},
      },
      tContent: {
        title: "Mapping of ICN Neurons in a 3D Rat Heart",
        description: "The distribution of neurons in the intrinsic cardiac nervous system (ICN) were mapped and visualized in a 3D reconstruction of a male rat heart.",
        actions: [
          {
            title: "View 3D scaffold",
            resource: "https://mapcore-bucket1.s3-us-west-2.amazonaws.com/others/29_Jan_2020/heartICN_metadata.json",
            type: "Scaffold"
          },
          {
            title: "View dataset",
            resource: "https://sparc.science/datasets/37?type=dataset",
            type: "URL"
          }
        ]
      },
      tStyle: {
        top: "200px",
        left: "200px",
        position: "absolute"
      },
      displayCloseButton: false,
      initial: "Rat",
      visible: false,
      helpMode: false,
      flatmapAPI: "https://mapcore-demo.org/staging/flatmap/v1/"
    }
  },
  mounted: function() {
    this._mapSettings = [];
  },
  components: {
    MultiFlatmapVuer,
    TooltipVuer
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

.popover{
  top:5px;
  right:10PX;
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
<style scoped src="./styles/purple/popover.css">
</style>