<template>
  <div class="tooltip-container">
     <el-main v-if="content" class="main" v-loading="loading">
      <div class="block" v-if="content.title">
        <span class="title">{{capitalise(content.title)}}</span>
      </div>
      <div class="block" v-else>
        <span class="title">{{content.featureId}}</span>
      </div>
      <!-- Currently we don't show the pubmed viewer, will remove once we are certain it won't be used -->
      <pubmed-viewer v-if="content.featureIds" v-show="false" class="block" :entry="content" @pubmedSearchUrl="pubmedSearchUrlUpdate"/>
      {{content.paths}}
      <div v-if="this.components" class="block">
        <div class="attribute-title">Components</div>
        <div v-for="component in components" class="attribute-content"  :key="component">
          {{ capitalise(component) }}
        </div>
      </div>
      <div v-if="this.origins" class="block">
        <div>
          <span class="attribute-title">Origin</span>
          <el-popover
          width="250"
          trigger="hover"
          :append-to-body=false
          popper-class="popover-origin-help"
          >
          <i slot="reference" class="el-icon-warning-outline info"/>
          <span style="word-break: keep-all;">
            <i>Origin</i> is where the dendrites stem from
          </span>
          </el-popover>
        </div>
        <div v-for="origin in origins" class="attribute-content"  :key="origin">
          {{ capitalise(origin) }}
        </div>
        <el-button v-show="originsWithDatasets.length > 0" class="button" @click="openDendrites">
          Explore origin data
        </el-button>
      </div>
      <div v-if="this.destinations" class="block">
        <div>
          <span class="attribute-title">Destination</span>
          <el-popover
          width="250"
          trigger="hover"
          :append-to-body=false
          popper-class="popover-origin-help"
          >
          <i slot="reference" class="el-icon-warning-outline info"/>
          <span style="word-break: keep-all;">
          <i>Destination</i> is where the axons terminate (& in the cases of some psuedoinunipolar neurons, where their dendritic "terminals" are)
          </span>
          </el-popover>
        </div>
        <div v-for="destination in destinations" class="attribute-content"  :key="destination">
          {{ capitalise(destination) }}
        </div>
        <el-button v-show="destinationsWithDatasets.length > 0" class="button" @click="openAxons">
          Explore destination data
        </el-button>
      </div>

      <!-- Disable search components button until I can get uberons-> labels for them -->
      <!-- <el-button v-show="componentsWithDatasets.length > 0" class="button" @click="openAll">
        Search for data on components
      </el-button> -->

      <!-- Disable neuron search until it is ready -->
      <!-- <el-button v-for="action in content.actions" round :key="action.title"
        class="button" @click="resourceSelected(action)">
        <i v-if="action.title === 'Search for datasets' || action.title === 'View Dataset' " class="el-icon-coin"></i>
        {{action.title}}
      </el-button> -->
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

// pubmedviewer is currently not in use, but still under review so not ready to delete yet
import PubmedViewer from './PubmedViewer.vue'
import EventBus from './EventBus'

const titleCase = (str) => {
  return str.replace(/\w\S*/g, (t) => { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase() });
}

const capitalise = function(str){
  if (str)
    return str.charAt(0).toUpperCase() + str.slice(1)
  return ""
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
    },
  },
  data: function() {
    return {
      activeSpecies: undefined,
      appendToBody: false,
      pubmedSearchUrl: '',
      loading: false,
      destinations: [],
      origins: [],
      components: [],
      destinationsWithDatasets: [],
      originsWithDatasets: [],
      componentsWithDatasets: [],
      uberons: [{id: undefined, name: undefined}]
    };
  },
  inject: ['sparcAPI', 'flatmapAPI'],
  watch: {
    'content.featureIds': {
      handler: function(){
        this.pathwayQuery(this.content.featureIds)
      }
    }
  },
  mounted: function(){
    this.getOrganCuries()
  },
  methods: {
    resourceSelected: function(action) {
      this.$emit("resource-selected", action); 
    },
    titleCase: function(title){
      return titleCase(title)
    },
    capitalise: function(text){
      return capitalise(text)
    },
    onClose: function() {
      this.$emit("onClose")
    },
    openUrl: function(url){
      window.open(url, '_blank')
    },
    openAll: function(){
      EventBus.$emit('onActionClick', {type:'Facets', labels: this.components.map(a=>a.name)})
    },
    openAxons: function(){
      EventBus.$emit('onActionClick', {type:'Facets', labels: this.destinationsWithDatasets.map(a=>a.name)})
    },
    openDendrites: function(){
      EventBus.$emit('onActionClick', {type:'Facets', labels: this.originsWithDatasets.map(a=>a.name)})
    },
    pubmedSearchUrlUpdate: function (val){
      this.pubmedSearchUrl = val
    },
    findComponents: function(connectivity){
      let dnodes = connectivity.connectivity.flat() // get nodes from edgelist
      let nodes = [...new Set(dnodes)] // remove duplicates

      let found = []
      let terminal = false
      nodes.forEach(node=>{
          let n = node.flat() // Find all terms on the node
          terminal = false

          // Check if the node is an destination or origin (note that they are labelled dendrite and axon as opposed to origin and destination)
          n.forEach(s=>{
              if(connectivity.axons.includes(s)){
                  terminal = true
              }
              if(connectivity.dendrites.includes(s)){
                  terminal = true
              }
          })
          if (!terminal){
            found.push(node)
          }
      })

      // remove duplicates
      let foundUnique = [...new Set(found.map(n=>n[0]))]
      return foundUnique
    },
    getOrganCuries: function(){
      fetch(`${this.sparcAPI}get-organ-curies/`)
        .then(response=>response.json())
        .then(data=>{
          this.uberons = data.uberon.array
        })
    },
    buildConnectivitySqlStatement: function(keastIds) {
      let sql = 'select knowledge from knowledge where entity in ('
      if (keastIds.length === 1) {
        sql += `'${keastIds[0]}')`
      } else if (keastIds.length > 1) {
        for (let i in keastIds) {
          sql += `'${keastIds[i]}'${i >= keastIds.length - 1 ? ')' : ','} `
        }
      }
      return sql
    },
    buildLabelSqlStatement: function(uberons) {
      let sql = 'select entity, label from labels where entity in ('
      if (uberons.length === 1) {
        sql += `'${uberons[0]}')`
      } else if (uberons.length > 1) {
        for (let i in uberons) {
          sql += `'${uberons[i]}'${i >= uberons.length - 1 ? ')' : ','} `
        }
      }
      return sql
    },
    createLabelLookup: function(uberons) {
      return new Promise(resolve=> {
        let uberonMap = {}
        const data = { sql: this.buildLabelSqlStatement(uberons)}
        fetch(`${this.flatmapAPI}knowledge/query/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          .then(response => response.json())
          .then(payload => {
            const entity = payload.keys.indexOf("entity");
            const label = payload.keys.indexOf("label");
            if (entity > -1 && label > -1) {
              payload.values.forEach(pair => {
                uberonMap[pair[entity]] = pair[label];
              });
            }
            resolve(uberonMap)
          })
      })
    },
    pathwayQuery: function(keastIds){
      this.destinations = []
      this.origins = []
      this.components = []
      this.loading = true
      if (!keastIds || keastIds.length == 0) return
      const data = { sql: this.buildConnectivitySqlStatement(keastIds)};
      fetch(`${this.flatmapAPI}knowledge/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(data => {
        let connectivity = JSON.parse(data.values[0][0])
        let components = this.findComponents(connectivity)

        // Create list of ids to get labels for
        let conIds = connectivity.axons.concat(connectivity.dendrites.concat(components))
        this.createLabelLookup(conIds).then(lookUp=>{
          this.destinations = connectivity.axons.map(a=>lookUp[a])
          this.origins = connectivity.dendrites.map(d=>lookUp[d])
          this.components = components.map(c=>lookUp[c])
        })

        // Filter for the anatomy which is annotated on datasets
        this.destinationsWithDatasets = this.uberons.filter(ub => connectivity.axons.indexOf(ub.id) !== -1)
        this.originsWithDatasets = this.uberons.filter(ub => connectivity.dendrites.indexOf(ub.id) !== -1)
        this.componentsWithDatasets = this.uberons.filter(ub => connectivity.dendrites.indexOf(ub.id) !== -1)
        this.loading = false
      })
      .catch((error) => {
        console.error('Error:', error);
      })
    }
  }
};
</script>

<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/container";
@import "~element-ui/packages/theme-chalk/src/header";
@import "~element-ui/packages/theme-chalk/src/main";

.tooltip-container {
  text-align:justify;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,.1);
  pointer-events: auto;
  background: #fff;
  border: 1px solid $app-primary-color;
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

.popover-origin-help {
  text-transform: none !important; // need to overide the tooltip text transform
}

.info{
  transform: rotate(180deg);
  color: #8300bf;
  margin-left: 8px;
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

.title{
  font-size: 18px;
  font-weight: 500;
  font-weight: bold;
  padding-bottom: 8px;
  color: rgb(131, 0, 191);

}

.attribute-title{
  font-size: 16px;
  font-weight: 600;
  /* font-weight: bold; */
  text-transform: uppercase;
}

.attribute-content{
  font-size: 14px;
  font-weight: 500;
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
  background-color: $app-primary-color;
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
      border-color: $app-primary-color  transparent  transparent transparent ;
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
      border-color: transparent transparent $app-primary-color transparent ;
    }
  }
}


/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root), .tooltip-container::after{
  top: 99.4%;
}
</style>
