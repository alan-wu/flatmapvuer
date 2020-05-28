<template>
  <div class="multi-container">
    <div style="position:absolute;z-index:1;">
      <el-select
        id="flatmap-select"
        :popper-append-to-body="appendToBody"
        v-model="activeSpecies"
        placeholder="Select"
        class="select-box"
        popper-class="flatmap_dropdown"
        @change="flatmapChanged"
      >
        <el-option v-for="(item, key) in availableSpecies" :key="key" :label="key" :value="key">
          <i :class="item.iconClass" style="padding-right:12px;"></i>
          {{ key }}
        </el-option>
      </el-select>
    </div>
    <FlatmapVuer
      v-for="(item, key) in availableSpecies"
      :key="key"
      :showLayer="showLayer"
      v-show="activeSpecies==key"
      :entry="item.taxo"
      :ref="key"
      @resource-selected="FlatmapSelected"
      @ready="FlatmapReady"
      :featureInfo="featureInfo"
      :minZoom="minZoom"
      :pathControls="pathControls"
      :searchable="searchable"
      :renderAtMounted="renderAtMounted"
      style="height:100%"
    />
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import FlatmapVuer from "./FlatmapVuer.vue";
import { Option, Select } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Option);
Vue.use(Select);

export default {
  name: "MultiFlatmapVuer",
  components: {
    FlatmapVuer
  },
  mounted: function() {
    if (this.initial && this.availableSpecies[this.initial] !== undefined) {
      this.activeSpecies = this.initial;
    } else {
      this.activeSpecies = Object.keys(this.availableSpecies)[0];
    }
    this.$refs[this.activeSpecies][0].createFlatmap();
  },
  methods: {
    FlatmapSelected: function(resource) {
      this.$emit("resource-selected", resource);
    },
    FlatmapReady: function(component) {
      this.$emit("ready", component);
    },
    getCoordinatesOfLastClick: function() {
      const flatmap = this.$refs[this.activeSpecies];
      if (flatmap && flatmap[0]) {
        return flatmap[0].getCoordinatesOfLastClick();
      }
      return undefined;
    },
    getCurrentFlatmap: function() {
      return this.$refs[this.activeSpecies][0];
    },
    showPopup: function(featureId, node, options) {
      let map = this.getCurrentFlatmap();
      map.showPopup(featureId, node, options);
    },
    flatmapChanged: function(flatmap){
      this.$refs[this.activeSpecies][0].createFlatmap();
      this.$emit('flatmapChanged', flatmap);
    }
  },
  props: {
    showLayer: {
      type: Boolean,
      default: false
    },
    featureInfo: {
      type: Boolean,
      default: false
    },
    pathControls: {
      type: Boolean,
      default: true
    },
    searchable: {
      type: Boolean,
      default: false
    },
    initial: {
      type: String,
      default: ""
    },
    minZoom: {
      type: Number,
      default: 4
    },
    renderAtMounted: {
      type: Boolean,
      default: false
    },
    availableSpecies: {}
  },
  data: function() {
    return {
      activeSpecies: undefined,
      appendToBody: false
    };
  }
};
</script>

<style scoped src="../styles/purple/select.css">
</style>
<style scoped src="../styles/purple/option.css">
</style>

<style scoped>
.multi-container {
  height: 100%;
  width: 100%;
}

.select-box {
  width: 124px;
  border-radius: 4px;
  border: solid 1px #8300bf;
  background-color: var(--white);
  font-weight: 500;
  color: #8300bf;
  margin-left: 19px;
  margin-top: 54px;
}

.select-box >>> .el-input__inner {
  color: #8300bf;
  padding-top: 0.25em;
}

.flatmap_dropdown .el-select-dropdown__item {
  white-space: nowrap;
  font-family: Helvetica;
  text-align: left;
}

.flatmap_dropdown .el-select-dropdown__item.selected {
  color: #8300bf;
  font-weight: normal;
  font-family: Helvetica !important;
}
</style>


