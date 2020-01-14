<template>
  <div class="flatmap-container">
    <div style="height:100%;width:100%;position:relative">
      <div id="flatmapDisplayArea" style="height:100%;width:100%;" ref="display"></div>
      <div class="check-list">
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
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Checkbox,
  CheckboxGroup,
  Row
} from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Row);

const flatmap = require("@dbrnz/flatmap-viewer");
const { BroadcastChannel } = require('broadcast-channel');
const ResizeSensor = require('css-element-queries/src/ResizeSensor');

const processMessage = function(component) {
  return function(message) {
    switch(message.action) {
      case "query-data":
        if (message.data['local-sender'] == component.uniqueId) {
          const data = { describes: message.data.describes, resource: message.resource};
          component.$emit("resource-selected", data);
        }
        break;
    default:
      break;
    }
  };
};

const mapResize = map => {
  return () => {
    map.resize();
  }
}

export default {
  name: "FlatmapVuer",
  beforeCreate: function() {
    this.mapManager = new flatmap.MapManager();
    this.channel = new BroadcastChannel('sparc-mapcore-channel');
		this.channel.onmessage = processMessage(this);
    this.mapImp = undefined;
    this.uniqueId = undefined;
  },
  methods: {
    visibilityToggle: function(id, event) {
      if (this.mapImp._userInteractions) {
        if (event)
          this.mapImp._userInteractions.activateLayer(this.mapImp.mapLayerId(id));
        else
          this.mapImp._userInteractions.deactivateLayer(this.mapImp.mapLayerId(id));
      }
    }
  },
  props: { entry: String },
  data: function() {
    return {
      checkbox:[],
      layers: {}
    };
  },
  computed: {
    numberOfSelectableLayers : function() {
      let count = 0;
      for (let i = 0; i < this.layers.length;i++) {
        if (this.layers[i].selectable)
          count++;
      }
      return count;
    }
  },
  mounted: function() {
    var promise1 = this.mapManager.loadMap(this.entry, this.$refs.display,
      { fullscreenControl: false, annotatable: false });
		promise1.then(returnedObject => {
      this.mapImp = returnedObject;
      this.uniqueId = this.mapImp.uniqueId;
      this.$refs.display.querySelector(".mapboxgl-control-container").style.display = "none";
      this.layers = this.mapImp.layers;
      this.sensor = new ResizeSensor(this.$refs.display, mapResize(this.mapImp));
		});
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
</style>
