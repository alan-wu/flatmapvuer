<template>
  <div class="container">
    <div style="position:absolute;z-index:1;">
      <el-select v-model="activeSpecies" placeholder="Select" class="select-box">
        <el-option
          v-for="(item, key) in availableSpecies"
          :key="key"
          :label="key"
          :value="key">
            <i :class="item.iconClass" style="padding-right:12px;"></i>{{ key }}
        </el-option>
      </el-select>
    </div>
    <FlatmapVuer v-for="(item, key) in availableSpecies" :key="key" :showLayer="showLayer" v-show="activeSpecies==key" :entry="item.taxo" :ref="key" @resource-selected="FlatmapSelected" @ready="FlatmapReady" style="height:100%"/>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import FlatmapVuer from './FlatmapVuer.vue'
import {
  Option,
  Select
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Option);
Vue.use(Select);

export default {
  name: 'MultiFlatmapVuer',
  components: {
    FlatmapVuer
  },
  mounted: function() {
    this.activeSpecies = Object.keys(this.availableSpecies)[0];
  },
  methods: {
    FlatmapSelected: function(resource) {
      this.$emit("resource-selected", resource);
    },
    FlatmapReady: function(component) {
      this.$emit("ready", component);
    }
  },
  props: {
    showLayer: {
      type: Boolean,
      default: false,
    },
    availableSpecies: {}
  },
  data: function(){
    return {
      activeSpecies: undefined
    }
  }
}
</script>

<style scoped>
.container {
  height:100%;
  width: 100%;
}

.select-box {
  width: 124px;
  border-radius: 4px;
  border: solid 1px #8300bf;
  background-color: var(--white);
  font-weight:500;
  color: #8300bf;
  margin-left:19px;
  margin-top: 54px;
}

.select-box >>> .el-input__inner {
  color: #8300bf;
}

</style>

<style scoped src="../styles/purple/select.css">
</style>
<style scoped src="../styles/purple/option.css">
</style>
