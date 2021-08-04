<template>
  <div class="tooltip-container">
     <el-main v-if="content" class="main">
      <div class="block">
        <span class="title">{{content.title}}</span>
      </div>

      <pubmed-viewer v-if="content.featureId" class="block" :featureId="content.featureId" />
      <div v-if="content.components" class="block">
        <div class="attribute-title">Components</div>
        <span class="attribute-content">{{title}}</span>
      </div>
      <div v-if="content.start" class="block">
        <div class="attribute-title">Origin</div>
        <span class="attribute-content">{{content.start}}</span>
      </div>
      <div v-if="content.distribution" class="block">
        <div class="attribute-title">Distribution</div>
        <span class="attribute-content">{{content.distribution}}</span>
      </div>
      <el-button v-for="action in content.actions" round :key="action.title"
        class="button" @click="resourceSelected(action)">
        <i v-if="action.title === 'View dataset'" class="el-icon-coin"></i>
        {{action.title}}</el-button>
    </el-main>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Button,
  Container,
  Header,
  Icon,
  Main
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Button);
Vue.use(Container);
Vue.use(Header);
Vue.use(Icon);
Vue.use(Main);

import PubmedViewer from './PubmedViewer.vue'

const titleCase = (str) => {
  return str.replace(/\w\S*/g, (t) => { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase() });
}

export default {
  components: { PubmedViewer },
  name: "Tooltip",
  props: { 
    visible: {
      type: Boolean,
      default: false
    },
    content: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    title: function(label){
      return titleCase(label)
    }
  },
  data: function() {
    return {
      activeSpecies: undefined,
      appendToBody: false
    };
  },
  mounted: function() {
  },
  methods: {
    resourceSelected: function(action) {
      this.$emit("resource-selected", action);
      
    },
    onClose: function() {
      this.$emit("onClose");
    }
  }
};
</script>

<style scoped>
.tooltip-container {
  text-align:justify;
  text-align:justify;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,.1);
  pointer-events: auto;
  background: #fff;
  border: 1px solid rgb(131, 0, 191);
  display: flex;
  justify-content: center;
  align-items: center;
}

.header {
  color: #606266;
  line-height: 1;
  padding: 5px 17px 0 15px;
  font-size: 14px;
}

.icon {
  right: 17px;
  position: absolute;
  padding: 5px;
}

.display {
  width: 44px;
  word-break: normal;
}

.title {
  text-align: left;
  width: 16em;
  line-height: 1.5em !important;
  font-weight: 600;
  font-size: 1em;
  font-family: Helvetica;
}

.block {
  margin-bottom: 1.5em;
}

.icon {
  right: 0px;
  position: absolute;
  top: 10px;
}

.icon:hover {
  cursor: pointer;
}

.main {
  font-size: 14px;
  text-align: left;
  line-height: 1.5em;
  font-family: Helvetica;
  font-weight: 400;
  /* outline: thin red solid; */
  padding: 1em !important;
  overflow: hidden;
}

.title{
  font-size: 18px;
  font-weight: 500;
  /* font-weight: bold; */
  padding-bottom: 8px;

}

.attribute-title{
  font-size: 16px;
  font-weight: 600;
  /* font-weight: bold; */
  text-transform: uppercase;
}

.attribute-content{
  font-size: 14px;
  font-weight: 400;
}

.popover-container {
  height: 100%;
  width: 100%;
}

.main  .el-button.is-round{
  border-radius: 4px;
  padding: 9px 20px 10px 20px;
  display: flex;
  height: 36px;
}

.button {
  margin-left: 0px !important;
  margin-top: 0px !important;
  font-size: 14px !important;
  background-color: rgb(131, 0, 191);
  color: #fff;
}

.button+.button {
  margin-top: 10px !important;
  background-color: rgb(131, 0, 191);
  color: #fff; 
}

.button:hover {
  color: #fff !important;
  background: #ac76c5 !important;
  border: 1px solid #ac76c5 !important;
}


.tooltip-container::after,
.tooltip-container::before {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    flex-shrink: 0;
}

.mapboxgl-popup-anchor-bottom .tooltip-container::after,
.mapboxgl-popup-anchor-bottom .tooltip-container::before {
    top: 100%;
}

.mapboxgl-popup-anchor-top .tooltip-container::after,
.mapboxgl-popup-anchor-top .tooltip-container::before {
    top: -24px;
}


/* this border color controlls the color of the triangle (what looks like the fill of the triangle) */
.mapboxgl-popup-anchor-bottom .tooltip-container::after {
    margin-top:-1px;
    border-color: rgb(255, 255, 255) transparent transparent  transparent ;
    border-width: 12px;
}

/* this border color controlls the color of the triangle (what looks like the fill of the triangle) */
.mapboxgl-popup-anchor-top .tooltip-container::after {
    margin-top: 1px;
    border-color: transparent transparent rgb(255, 255, 255) transparent ;
    border-width: 12px;
}

/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root), .tooltip-container::after{
  top: 99.4%;
}

/* this border color controlls the outside, thin border */
.mapboxgl-popup-anchor-bottom .tooltip-container::before {
    margin: 0 auto;
    border-color: rgb(131, 0, 191)  transparent  transparent transparent ;
    border-width: 12px;
}

/* this border color controlls the color of the triangle (what looks like the fill of the triangle) */
.mapboxgl-popup-anchor-top .tooltip-container::before {
    margin: 0 auto;
    border-color: transparent transparent rgb(131, 0, 191) transparent ;
    border-width: 12px;
}

</style>
