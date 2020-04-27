<template>
  <div class="flatmap-container">
    <div style="height:100%;width:100%;position:relative">
      <div id="flatmapDisplayArea" style="height:100%;width:100%;" ref="display"></div>
      <div class="check-list" v-if="showLayer">
        <div v-if="numberOfSelectableLayers > 1" class="control-menu" ref="control-menu" @click="toggleControl">
          <div class="bar1"></div>
          <div class="bar2"></div>
          <div class="bar3"></div>
        </div>
        <div :style="toggleStyle">
          <el-checkbox-group v-if="numberOfSelectableLayers > 1" v-model="checkbox" size="small">
            <el-row v-for="item in layers" :key="item.id">
              <div v-if="item.selectable" style= "display: flex;justify-content: space-between;">
                <el-checkbox
                  style="margin-top:3px;"
                  :label="item.id"
                  @change="visibilityToggle(item.id, $event)"
                  :checked="item.selected"
                  border
                >{{item.id}}</el-checkbox>
              </div>
            </el-row>
          </el-checkbox-group>
        </div>
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
    toggleControl: function() {
      this.$refs["control-menu"].classList.toggle("change");
      if (this.toggleStyle.visibility == "hidden") {
        this.toggleStyle.visibility = "visible";
        this.toggleStyle.opacity = 1.0;
      }
      else {
        this.toggleStyle.opacity = 0.0;
        this.toggleStyle.visibility = "hidden";
      }
    },
    eventCallback: function() {
      return (eventType, feature, ...args) => {
        if (eventType == "click") {
          const label = feature.label;
          const resource = [ feature.models ];
          const taxonomy = this.entry;
          const data = { taxonomy: taxonomy, resource: resource, label: label,
            feature: feature, userData: args};
          this.$emit("resource-selected", data);
        }
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
      if (this.mapImp) {
        this.mapImp.showPopup(featureId, node, options);
      }
    },
    visibilityToggle: function(id, event) {
      if (this.mapImp._userInteractions) {
        if (event)
          this.mapImp._userInteractions.activateLayer(this.mapImp.mapLayerId(id));
        else
          this.mapImp._userInteractions.deactivateLayer(this.mapImp.mapLayerId(id));
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
      var promise1 = this.mapManager.loadMap(this.entry, this.$refs.display,
        this.eventCallback(),
        {
          //fullscreenControl: false,
          //navigationControl: 'top-right',
          //annotatable: false,
          //debug: true,
          featureInfo: this.featureInfo,
          searchable: this.searchable
         });
      promise1.then(returnedObject => {
        this.mapImp = returnedObject;
        this.layers = this.mapImp.layers;
        this.sensor = new ResizeSensor(this.$refs.display, mapResize(this.mapImp));
        this.$emit("ready", this);
      });
    }
  },
  props: { entry: String,
    showLayer: {
      type: Boolean,
      default: false,
    },
    featureInfo: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: false,
    }
  },
  data: function() {
    return {
      checkbox:[],
      layers: {},
      toggleStyle: {visibility:"hidden", opacity:0, transition: "visibility  0s, opacity 0.5s"}
    };
  },
  computed: {
    numberOfSelectableLayers: function() {
      let count = 0;
      for (let i = 0; i < this.layers.length;i++) {
        if (this.layers[i].selectable)
          count++;
      }
      return count;
    }
  },
  watch: {
    entry: function(val) {
      this.createFlatmap(val);
    }
  },
  mounted: function() {
    const flatmap = require("@dbrnz/flatmap-viewer");
    this.mapManager = new flatmap.MapManager();
    this.createFlatmap();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.flatmap-container {
  height: 100%;
  width: 100%;
}

.check-list {
  position: absolute;
  top: 10px;
  left: 10px;
  height: calc(100% - 20px);
  text-align: left;
  overflow:auto;
}

.control-menu {
  display: inline-block;
  cursor: pointer;
}

.bar1,
.bar2,
.bar3 {
  width: 35px;
  height: 5px;
  background-color: #333;
  margin: 6px 0;
  transition: 0.4s;
}

.change .bar1 {
  -webkit-transform: rotate(-45deg) translate(-9px, 6px);
  transform: rotate(-45deg) translate(-9px, 6px);
}

.change .bar2 {
  opacity: 0;
}

.change .bar3 {
  -webkit-transform: rotate(45deg) translate(-8px, -8px);
  transform: rotate(45deg) translate(-8px, -8px);
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

>>> .mapboxgl-popup-content {
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,.1);
  padding: 3em 1em 3em 1em;
  pointer-events: auto;
  width: 25em;
}

>>> .mapboxgl-popup-close-button {
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
</style>

<style scoped src="../styles/purple/checkbox.css">
</style>
<style scoped src="../styles/purple/checkbox-group.css">
</style>
<style scoped src="../styles/purple/row.css">
</style>
