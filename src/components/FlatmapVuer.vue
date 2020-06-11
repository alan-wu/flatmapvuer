<template>
  <div class="flatmap-container">
    <div style="height:100%;width:100%;position:relative">
      <div style="height:100%;width:100%;" ref="display"></div>
      <el-popover content="Zoom In" placement="left" 
        :appendToBody=false trigger="hover" popper-class="flatmap-popper">
        <el-button icon="el-icon-plus" circle class="zoomIn icon-button" 
          @click="zoomIn()" size="mini" slot="reference"></el-button>
      </el-popover>
      <el-popover content="Zoom Out" placement="left"
        :appendToBody=false trigger="hover" popper-class="flatmap-popper">
        <el-button icon="el-icon-minus" circle class="zoomOut icon-button"
        @click="zoomOut()" size="mini" slot="reference"></el-button>
      </el-popover>
      <el-popover content="Reset view" placement="left"
        :appendToBody=false trigger="hover" popper-class="flatmap-popper">
        <el-button icon="el-icon-refresh-right" circle class="resetView icon-button"
          @click="resetView()" size="mini" slot="reference"></el-button>
      </el-popover>
      <div class="pathway-container" v-if="pathways.length > 0 && pathControls">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">Display all pathways</el-checkbox>
        <el-checkbox-group v-model="checkedItems" size="small" 
          class="checkbox-group" @change="handleCheckedItemsChange">>
          <el-row v-for="item in pathways" :key="item.type" :label="item.type">
            <div class="checkbox-container">
              <el-checkbox
                class="my-checkbox"
                style="margin-top:3px;"
                :label="item.type"
                @change="visibilityToggle()"
                :checked="true"
                border
              ><div class="path-visual" :class="item.type"></div>{{item.label}}</el-checkbox>
            </div>
          </el-row>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Checkbox,
  CheckboxGroup,
  Row
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Row);
const ResizeSensor = require('css-element-queries/src/ResizeSensor');

const mapResize = map => {
  return () => {
    if (map)
      map.resize();
  }
}

export default {
  name: "FlatmapVuer",
  beforeCreate: function() {
    this.mapManager = undefined;
    this.mapImp = undefined;
  },
  methods: {
    /**
     * Function to toggle paths to default.
     * Also called when the associated button is pressed.
     */
    resetView: function() {
      if (this.mapImp) {
        this.mapImp.resetMap();
      }
    },
    /**
     * Function to zoom in.
     * Also called when the associated button is pressed.
     */
    zoomIn: function() {
      if (this.mapImp) {
        this.mapImp.zoomIn();
      }
    },
    /**
     * Function to zoom out.
     * Also called when the associated button is pressed.
     */
    zoomOut: function() {
      if (this.mapImp) {
        this.mapImp.zoomOut();
      }
    },
    visibilityToggle: function() {
      if (this.mapImp) {
        this.mapImp.showPaths(this.checkedItems);
      }
    },
    handleCheckedItemsChange: function(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.pathways.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.pathways.length;
    },
    handleCheckAllChange(val) {
      this.checkedItems = val ? this.pathways.map(a => a.type) : [];
      this.isIndeterminate = false;
      if (this.mapImp) {
        this.mapImp.showPaths(this.checkedItems);
      }
    },
    eventCallback: function() {
      return (eventType, feature, ...args) => {
        const label = feature.label;
        const resource = [ feature.models ];
        const taxonomy = this.entry;
        const data = { taxonomy: taxonomy, resource: resource, label: label,
          feature: feature, userData: args, eventType: eventType};
        this.$emit("resource-selected", data);
      }
    },
    getCoordinatesOfLastClick: function() {
      if (this.mapImp) {
        if (this.mapImp._userInteractions._lastClickedLocation) {
          return this.mapImp._map.project(
            this.mapImp._userInteractions._lastClickedLocation);
        }
      }
      return undefined;
    },
    showPopup: function(featureId, node, options) {
      let myOptions = options;
      if (this.mapImp) {
        if (myOptions) {
          myOptions.className = "flatmapvuer-popover";
        } else {
          myOptions = {className: "flatmapvuer-popover"};
        }
        this.mapImp.showPopup(featureId, node, myOptions);
      }
    },
    showMarkerPopup: function(featureId, node, options) {
      if (this.mapImp) {
        this.mapImp.showMarkerPopup(featureId, node, options);
      }
    },
    getLabels: function() {
      let labels = [];
      if (this.mapImp) {
        let annotations = this.mapImp.annotations;
        for (let value of annotations.values()) {
          if (value.label)
            labels.push(value.label);
        }
        return Array.from(new Set(labels));
      }
    },
    createFlatmap: function() {
      if (!this.mapImp) {
        let promise1 = this.mapManager.loadMap(this.entry, this.$refs.display,
          this.eventCallback(),
          {
            //fullscreenControl: false,
            //annotatable: false,
            //debug: true,
            featureInfo: this.featureInfo,
            "min-zoom": this.minZoom,
            pathControls: false,
            searchable: this.searchable,
            tooltips: this.tooltips
          });
        promise1.then(returnedObject => {
          this.mapImp = returnedObject;
          this.sensor = new ResizeSensor(this.$refs.display, mapResize(this.mapImp));
          this.pathways = this.mapImp.pathTypes();
          this.$emit("ready", this);
        });
      }
    }
  },
  props: {
    entry: String,
    featureInfo: {
      type: Boolean,
      default: false,
    },
    minZoom: {
      type: Number,
      default: 4
    },
    pathControls: {
      type: Boolean,
      default: true
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    tooltips: {
      type: Boolean,
      default: true,      
    },
    renderAtMounted: {
      type: Boolean,
      default: true, 
    }
  },
  data: function() {
    return {
      checkedItems: [],
      pathways: [],
      isIndeterminate: false,
      checkAll: true,
    };
  },
  watch: {
    entry: function(val) {
      this.createFlatmap(val);
    }
  },
  mounted: function() {
    const flatmap = require("@dbrnz/flatmap-viewer");
    this.mapManager = new flatmap.MapManager();
    if (this.renderAtMounted)
      this.createFlatmap();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.path-visual {
  margin: 3px 0;
  height: 3px;
  width:25px;
  margin-right: 5px;
  display: inline-block;
}

.path-visual.cns {
  background:#9b1fc1;
}

.path-visual.lcn {
  background:#f19e38;
}

.path-visual.para-pre {
  background:#3f8f4a;
}

.path-visual.para-post {
  background:repeating-linear-gradient(90deg,#3f8f4a,#3f8f4a 6px,transparent 0,transparent 9px);
}

.path-visual.sensory {
  background:#2a62f6;
}

.path-visual.somatic {
  background:#98561d;
}

.path-visual.symp-pre {
  background: #ea3423;
}

.path-visual.symp-post {
  background: repeating-linear-gradient(90deg,#ea3423,#ea3423 6px,transparent 0,transparent 9px);
}

.flatmap-container {
  height: 100%;
  width: 100%;
}

.pathway-container {
  position: absolute;
  top: 134px;
  left: 17px;
  max-height: calc(100% - 184px);
  text-align: left;
  overflow: auto;
}

.checkbox-container { 
  display: flex;
  cursor: pointer;
}

.my-checkbox {
  background-color: #fff;
  width:100%;
}

>>> .el-checkbox__label {
  padding-left:5px;
}

>>> .el-checkbox__input.is-indeterminate .el-checkbox__inner
{
  background-color: #8300bf;
  border-color:  #8300bf;
}

>>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #8300bf;
  border-color:  #8300bf;
}

>>> .el-checkbox__label {
  color:  #8300bf !important;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.demonstration {
  display: block;
  color: #8492a6;
  font-size: 14px;
  margin-bottom: 20px;
}

>>>.flatmap-tooltip-popup .mapboxgl-popup-content {
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,.1);
  padding: 3em 1em 3em 1em;
  pointer-events: auto;
  width: 25em;
  background: #fff;
}


>>>.flatmapvuer-popover .mapboxgl-popup-close-button {
  position: absolute;
  right: 0.5em;
  top: 0;
  border: 0;
  border-radius: 0 3px 0 0;
  cursor: pointer;
  background-color: transparent;
  font-size: 2.5em;
  color: grey;
  top: 0.95em;
}

.zoomIn{
  top:51px;
  right:20px;
  position: absolute;
}

.zoomOut{
  top:101px;
  right:20px;
  position: absolute;
}

.resetView {
  top:151px;
  right:20px;
  position: absolute;
}

.togglePaths {
  top:201px;
  right:20px;
  position: absolute;
}

.icon-button {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  border: solid 1px #ffffff;
  background-color: #ffffff;
}

>>> .flatmap-popper {
  padding:9px 10px;
  min-width:150px;
  font-size:12px;
}

>>> .flatmap-marker{
  cursor: pointer;
}
</style>

<style scoped src="../styles/purple/checkbox.css">
</style>
<style scoped src="../styles/purple/checkbox-group.css">
</style>
<style scoped src="../styles/purple/row.css">
</style>
