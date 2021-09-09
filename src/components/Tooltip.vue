<template>
  <div class="tooltip-container">
     <el-main v-if="content" class="main">
      <div class="block" v-if="content.title">
        <span class="title">{{titleCase(content.title)}}</span>
      </div>
      <div class="block" v-else>
        <span class="title">{{content.featureId}}</span>
      </div>
      

      <pubmed-viewer v-if="content.featureId" class="block" :featureId="content.featureId" @pubmedSearchUrl="pubmedSearchUrlUpdate"/>
      <div v-if="content.components" class="block">
        <div class="attribute-title">Components</div>
        <span class="attribute-content">{{content.components}}</span>
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
        <i v-if="action.title === 'Search for dataset' || action.title === 'View Dataset' " class="el-icon-coin"></i>
        {{action.title}}
      </el-button>
      <el-button  v-if="pubmedSearchUrl" class="button" icon="el-icon-notebook-2" @click="openUrl(pubmedSearchUrl)">
        Open publications in pubmed
      </el-button>
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
  data: function() {
    return {
      activeSpecies: undefined,
      appendToBody: false,
      pubmedSearchUrl: ''
    };
  },
  methods: {
    resourceSelected: function(action) {
      this.$emit("resource-selected", action); 
    },
    titleCase: function(title){
      return titleCase(title)
    },
    onClose: function() {
      this.$emit("onClose");
    },
    openUrl: function(url){
      window.open(url, '_blank')
    },
    pubmedSearchUrlUpdate: function (val){
      this.pubmedSearchUrl = val
    }
  }
};
</script>

<style scoped lang="scss">
.tooltip-container {
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

.display {
  width: 44px;
  word-break: normal;
}

.title {
  text-align: left;
  width: 16em;
  line-height: 1.5em !important;
  font-size: 1em;
  font-family: Helvetica;
  font-weight: 500;
  /* font-weight: bold; */
  padding-bottom: 8px;
}

.block {
  margin-bottom: 1.5em;
}

.pub {
  width: 16rem;
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
  min-width: 16rem;
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

.main {
  .el-button.is-round{
    border-radius: 4px;
    padding: 9px 20px 10px 20px;
    display: flex;
    height: 36px;
  }
}

.button {
  margin-left: 0px !important;
  margin-top: 0px !important;
  font-size: 14px !important;
  background-color: rgb(131, 0, 191);
  color: #fff;
  &+.button {
    margin-top: 10px !important;
  }
  &:hover {
    color: #fff !important;
    background: #ac76c5 !important;
    border: 1px solid #ac76c5 !important;
  }
}

.tooltip-container{
  &::after, &::before {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    flex-shrink: 0;
  }
}

.mapboxgl-popup-anchor-bottom {
  .tooltip-container {
    &::after, &::before {
      top: 100%;
      border-width: 12px;
    }
    &::after {
      margin-top:-1px;
      border-color: rgb(255, 255, 255) transparent transparent  transparent ;
    }
    &::before {
      margin: 0 auto;
      border-color: rgb(131, 0, 191)  transparent  transparent transparent ;
    }
  }
}

.mapboxgl-popup-anchor-top {
  .tooltip-container {
    &::after, &::before {
      top: -24px;
      border-width: 12px;
    }
    &::after {
      margin-top: 1px;
      border-color: transparent transparent rgb(255, 255, 255) transparent ;
    }
    &::before {
      margin: 0 auto;
      border-color: transparent transparent rgb(131, 0, 191) transparent ;
    }
  }
}


/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root), .tooltip-container::after{
  top: 99.4%;
}
</style>
