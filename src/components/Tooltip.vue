<template>
  <div class="tooltip-container">
     <el-main v-if="content" class="main" v-loading="loading">
      <div class="block" v-if="content.title">
        <span class="title">{{capitalise(content.title)}}</span>
      </div>
      <div class="block" v-else>
        <span class="title">{{content.featureId}}</span>
      </div>
      <div class="content-container scrollbar">
        {{content.paths}}
        <div v-if="this.origins && this.origins.length > 0" class="block">
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
              <i>Origin</i> {{originDescription}}
            </span>
            </el-popover>
          </div>
          <div v-for="(origin, i) in origins" class="attribute-content"  :key="origin">
            {{ capitalise(origin) }}
            <div v-if="i != origins.length - 1" class="seperator"></div>
          </div>
          <el-button v-show="originsWithDatasets.length > 0" class="button" @click="openDendrites">
            Explore origin data
          </el-button>
        </div>
        <div v-if="this.components && this.components.length > 0" class="block">
          <div class="attribute-title">Components</div>
          <div v-for="(component, i) in components" class="attribute-content"  :key="component">
            {{ capitalise(component) }}
            <div v-if="i != components.length - 1" class="seperator"></div>
          </div>
        </div>
        <div v-if="this.destinations && this.destinations.length > 0" class="block">
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
            <i>Destination</i> is where the axons terminate
            </span>
            </el-popover>
          </div>
          <div v-for="(destination, i) in destinations" class="attribute-content"  :key="destination">
            {{ capitalise(destination) }}
            <div v-if="i != destinations.length - 1" class="seperator"></div>
          </div>
          <el-button v-show="destinationsWithDatasets.length > 0" class="button" @click="openAxons">
            Explore destination data
          </el-button>
        </div>

        <el-button v-show="components.length > 0" class="button" @click="openAll">
          Search for data on components
        </el-button>

        <!-- pubmed-viewer is just used for processing pubmed requests (no display) -->
        <pubmed-viewer v-if="content.featureIds" v-show="false" :entry="content" @pubmedSearchUrl="pubmedSearchUrlUpdate"/>
        <el-button  v-if="pubmedSearchUrl != ''" class="button" icon="el-icon-notebook-2" @click="openUrl(pubmedSearchUrl)">
          Open publications in pubmed
        </el-button>
      </div>
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

const inArray = function(ar1, ar2){
    let as1 = JSON.stringify(ar1)
    let as2 = JSON.stringify(ar2)
    return as1.indexOf(as2) !== -1
}

// remove duplicates by stringifying the objects
const removeDuplicates = function(arrayOfAnything){
  return [...new Set(arrayOfAnything.map(e => JSON.stringify(e)))].map(e => JSON.parse(e)) 
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
      originDescriptions: {
        'motor': 'is the location of the initial cell body of the circuit',
        'sensory': 'is the location of the initial cell body in the PNS circuit'
      },
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
  computed: {
    originDescription: function(){
      if(this.content && this.content.title && this.content.title.toLowerCase().includes('motor')){
        return this.originDescriptions.motor
      } else {
        return this.originDescriptions.sensory
      }
    }
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
      EventBus.$emit('onActionClick', {type:'Facets', labels: this.components})
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
    findAllIdsFromConnectivity(connectivity){
      let dnodes = connectivity.connectivity.flat() // get nodes from edgelist
      let nodes = [...new Set(dnodes)] // remove duplicates
      let found = []
      nodes.forEach(n=>{
        if (Array.isArray(n)){
          found.push(n.flat())
        } else {
          found.push(n)
        }
      })
      return [... new Set(found.flat())]
    },
    flattenConntectivity(connectivity){
      let dnodes = connectivity.flat() // get nodes from edgelist
      let nodes = [...new Set(dnodes)] // remove duplicates
      let found = []
      nodes.forEach(n=>{
        if (Array.isArray(n)){
          found.push(n.flat())
        } else {
          found.push(n)
        }
      })
      return found.flat()
    },
    findComponents: function(connectivity){
      let dnodes = connectivity.connectivity.flat() // get nodes from edgelist
      let nodes = removeDuplicates(dnodes)

      let found = []
      let terminal = false
      nodes.forEach(node=>{
        terminal = false
        // Check if the node is an destination or origin (note that they are labelled dendrite and axon as opposed to origin and destination)
        if(inArray(connectivity.axons,node)){
          terminal = true
        }
        if(inArray(connectivity.dendrites, node)){
          terminal = true
        }
        if (!terminal){
          found.push(node)
        }
      })

      return found
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
    createComponentsLabelList: function(components, lookUp){
      let labelList = []
      components.forEach(n=>{
        labelList.push(this.createLabelFromNeuralNode(n[0]), lookUp)
        if (n.length === 2){
          labelList.push(this.createLabelFromNeuralNode(n[1]), lookUp)
        }
      })
      return labelList
    },
    createLabelFromNeuralNode: function(node, lookUp){
      let label = lookUp[node[0]]
      if (node.length === 2 && node[1].length > 0){
        node[1].forEach(n=>{
          if (lookUp[n] == undefined){
            label += `, ${n}` 
          } else {
            label += `, ${lookUp[n]}`
          }
        })
      }
      return label
    },
    processConnectivity(connectivity){
      // Filter the origin and destinations from components
      let components = this.findComponents(connectivity)

      // Remove duplicates
      let axons = removeDuplicates(connectivity.axons)
      let dendrites = removeDuplicates(connectivity.dendrites)

      // Create list of ids to get labels for
      let conIds = this.findAllIdsFromConnectivity(connectivity)  

      // Create readable labels from the nodes. Setting this to 'this.origins' updates the display
      this.createLabelLookup(conIds).then(lookUp=>{
        this.destinations = axons.map(a=>this.createLabelFromNeuralNode(a,lookUp))
        this.origins = dendrites.map(d=>this.createLabelFromNeuralNode(d,lookUp))
        this.components = components.map(c=>this.createLabelFromNeuralNode(c, lookUp))
      })

      this.flattenAndFindDatasets(components, axons, dendrites)
    },
    flattenAndFindDatasets(components, axons, dendrites){
      
      // process the nodes for finding datasets (Note this is not critical to the tooltip, only for the 'search on components' button)
      let componentsFlat = this.flattenConntectivity(components)
      let axonsFlat = this.flattenConntectivity(axons)
      let dendritesFlat = this.flattenConntectivity(dendrites)

      // Filter for the anatomy which is annotated on datasets
      this.destinationsWithDatasets = this.uberons.filter(ub => axonsFlat.indexOf(ub.id) !== -1)
      this.originsWithDatasets = this.uberons.filter(ub => dendritesFlat.indexOf(ub.id) !== -1)
      this.componentsWithDatasets = this.uberons.filter(ub => componentsFlat.indexOf(ub.id) !== -1)
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
        this.processConnectivity(connectivity)
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

.seperator {
  width:90%;
  height:0.5px;
  background-color:#bfbec2;
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

.content-container {
  overflow-y: scroll;
  scrollbar-width: thin !important;
  height: 200px;
}

.scrollbar::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar {
  width: 12px;
  right: -12px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  background-color: #979797;
}


/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root), .tooltip-container::after{
  top: 99.4%;
}
</style>
