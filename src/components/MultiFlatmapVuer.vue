<template>
  <div class="multi-container" ref="multiContainer">
    <div style="position:absolute;z-index:10;">
      <div class="species-display-text">
        Species
      </div>
      <el-popover content="Select a species" placement="right" 
        :appendToBody=false trigger="manual" popper-class="flatmap-popper right-popper" v-model="helpMode" ref="selectPopover">
      </el-popover>
      <el-select
        id="flatmap-select"
        :popper-append-to-body="appendToBody"
        v-model="activeSpecies"
        placeholder="Select"
        class="select-box"
        popper-class="flatmap_dropdown"
        @change="setSpecies"
        v-popover:selectPopover
      >
        <el-option v-for="(item, key) in speciesList" :key="key" :label="key" :value="key">
          <el-row>
            <el-col :span="8"><i :class="item.iconClass"></i></el-col>
            <el-col :span="12">{{ key }}</el-col>
          </el-row>
        </el-option>
      </el-select>
    </div>
    <FlatmapVuer
      v-for="(item, key) in speciesList"
      :key="key"
      :showLayer="showLayer"
      v-show="activeSpecies==key"
      :entry="item.taxo"
      :biologicalSex="item.biologicalSex"
      :displayWarning="item.displayWarning"
      :warningMessage="warningMessage"
      :displayLatestChanges="item.displayLatestChanges"
      :latestChangesMessage="item.latestChangesMessage"
      :isLegacy="item.isLegacy"
      :ref="key"
      @view-latest-map="viewLatestMap"
      @resource-selected="FlatmapSelected"
      @ready="FlatmapReady"
      @pan-zoom-callback="panZoomCallback"
      :featureInfo="featureInfo"
      :minZoom="minZoom"
      :pathControls="pathControls"
      :searchable="searchable"
      :layerControl="layerControl"
      :helpMode="helpMode"
      :renderAtMounted="renderAtMounted"
      :displayMinimap="displayMinimap"
      style="height:100%"
      :flatmapAPI="flatmapAPI"
      :sparcAPI="sparcAPI"
    />
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import EventBus from './EventBus'
import Vue from "vue";
import FlatmapVuer from "./FlatmapVuer.vue";
import { Col, Option, Select, Row, Popover } from "element-ui";  
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Col);
Vue.use(Row);
Vue.use(Option);
Vue.use(Select);
Vue.use(Popover)

const TAXON_UUID = {
  "NCBITaxon:10114": "01fedbf9-d783-509c-a10c-827941ab13da",
  "NCBITaxon:9823": "a336ac04-24db-561f-a25f-1c994fe17410",
  "NCBITaxon:9606": "42ed6323-f645-5fbe-bada-9581819cf689",
  "NCBITaxon:10090": "25285fab-48a0-5620-a6a0-f9a0374837d5",
  "NCBITaxon:9685": "73060497-46a6-52bf-b975-cac511c127cb"
}

export default {
  name: "MultiFlatmapVuer",
  components: {
    FlatmapVuer
  },
  beforeMount() {
    //List for resolving the promise in initialise
    //if initialise is called multiple times
    this._resolveList = [];
    this._initialised = false;
  },
  mounted: function() {
    this.initialise();
    EventBus.$on('onActionClick', (action) =>{
      this.FlatmapSelected(action)
    })
  },
  methods: {
    initialise: function() {
      return new Promise(resolve => {
        if (this.requireInitialisation) {
          //It has not been initialised yet
          this.requireInitialisation = false;
          fetch(this.flatmapAPI)
          .then(response => response.json())
          .then(data => {
            //Check each key in the provided availableSpecies against the one 
            //on the server, add them to the Select if the key is found
            Object.keys(this.availableSpecies).forEach(key => {
              for (let i = 0; i < data.length; i++) {
                if (this.availableSpecies[key].taxo === data[i].taxon) {
                  if (this.availableSpecies[key].biologicalSex) {
                    if (data[i].biologicalSex && 
                      data[i].biologicalSex === this.availableSpecies[key].biologicalSex) {
                        this.$set(this.speciesList, key, this.availableSpecies[key]);
                        break;
                      }
                  } else {
                    this.$set(this.speciesList, key, this.availableSpecies[key]);
                    break;
                  }
                }
              }
            });
            //Use the state species if it does not have any other species information 
            let species = this.initial;
            if (this.state) {
              const mapState = this.state.state;
              if ((!mapState || ( !mapState.uuid && !mapState.entry )) && this.state.species)
                species = this.state.species;
              else
                species = undefined;
            }
            if (species) {
              //No state resuming, set the current flatmap to {this.initial}
              if (species && this.speciesList[species] !== undefined) {
                this.activeSpecies = species;
              } else {
                this.activeSpecies = Object.keys(this.speciesList)[0];
              }
              this.setSpecies(this.activeSpecies, this.state ? this.state.state : undefined, 5);
            }
            this._initialised = true;
            resolve();
            //Resolve all other promises resolve in the list
            this._resolveList.forEach(other => { other(); });
          });
        } else if (this._initialised) {
          //resolve as it has been initialised
          resolve();
        } else {
          //resolve when the async initialisation is finished 
          this._resolveList.push(resolve);
        }
      })
    },
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
    panZoomCallback: function(payload) {
      this.$emit("pan-zoom-callback", payload);
    },
    showPopup: function(featureId, node, options) {
      let map = this.getCurrentFlatmap();
      map.showPopup(featureId, node, options);
    },
    showMarkerPopup: function(featureId, node, options) {
      let map = this.getCurrentFlatmap();
      map.showMarkerPopup(featureId, node, options);
    },
    setSpecies: function(species, state, numberOfRetry) {
      if (this.$refs && species in this.$refs) {
        this.activeSpecies = species;
        this.$refs[this.activeSpecies][0].createFlatmap(state);
        this.$emit('flatmapChanged', this.activeSpecies);
      } else if (numberOfRetry) {
        const retry = numberOfRetry - 1;
        if (retry >= 0) {
          Vue.nextTick(() => {
            this.setSpecies(species, state, retry);
          });
        }
      }
    },
    /**
     * Function to switch to the latest existing map from 
     * a legacy map of the same species. 
     * 
     * @private
     */
    viewLatestMap: function(state) {
      const keys = Object.keys(this.speciesList);
      for (let i = 0; i < keys.length; i++) {
        const species = this.speciesList[keys[i]];
        if (!species.isLegacy &&
          (species.taxo === state.entry) && 
         (species.biologicalSex === state.biologicalSex)) {
           this.setSpecies(keys[i], state, 0);
           return;
        }
      }
    },
    /**
     * Create a legacy entry with the provided information
     * 
     * @private
     */
    createLegacyEntry: function(state, taxo, uuid) {
      if (uuid && taxo) {
        let name = "Legacy";
        if (state.species) {
          if (state.species.slice(0, 6) === "Legacy")
            name = state.species;
          else
            name = name + ` ${state.species}`;
        }
        this.$set(
          this.speciesList,
          name, 
          {
            taxo: taxo,
            isLegacy: true,
            displayWarning: true
          }
        );
        return {
          species: name,
          state: {
            entry: taxo,
            uuid: uuid,
            viewport: state.state.viewport,
            searchTerm: state.state.searchTerm
          },
        }
      }
    },
    /**
     * Function used to translate the legacy map state to one that can be used in current
     * flatmap if required. If it is a legacy, an Select entry will be added
     * 
     * @private
     */
    updateState: function(state) {
      return new Promise((resolve) => {
        if (state && state.state) {
          const mapState = state.state;
          //uuid is not in the state, this is a legacy map
          if (!mapState.uuid) {
            if (mapState.entry) {
              const uuid = mapState.entry in TAXON_UUID ? TAXON_UUID[mapState.entry] : undefined;
              const newState = this.createLegacyEntry(state, mapState.entry, uuid);
              resolve(newState ? newState : state);
            }
          } else if (mapState.entry) {
            //uuid is in the state but should be checked if it is the latest map
            //for that taxon
            return new Promise(() => {
              const mapManager = new (require("@abi-software/flatmap-viewer")).MapManager(this.flatmapAPI);
              //mapManager.findMap_ is an async function so we need to wrap this with a promise
              const identifier = { taxon: mapState.entry };
              if (mapState.biologicalSex)
                identifier['biologicalSex'] = mapState.biologicalSex;
              mapManager.findMap_(identifier).then(map => {
                if (map.uuid !== mapState.uuid) {
                  return this.createLegacyEntry(state, mapState.entry, mapState.uuid);
                }
              }).then(newState => {
                resolve(newState ? newState : state);
              })
              .catch(() => {
                resolve(state);
              });
            });
          }
          //Create a new state and add the legacy map to the select
        }
        resolve(state);
      });
    },
    /**
     * Function used for getting the current states of the scene. This exported states 
     * can be imported using the importStates method.
     * 
     * @public
     */
    getState: function() {
      let state = {
        species: this.activeSpecies,
        state: undefined,
      };
      let map = this.getCurrentFlatmap();
      state.state = map.getState();
      return state;
    },
    /**
     * Function used for importing the states of the scene. This exported states 
     * can be imported using the read states method.
     * 
     * @public
     */
    setState: function(state) {
      if (state) {
          //Update state if required
        this.updateState(state).then(currentState => {
          this.initialise().then(() => {
            if (currentState.species && (currentState.species !== this.activeSpecies)) {
              this.setSpecies(currentState.species, currentState.state, 5);
            } else if (currentState.state) {
              let map = this.getCurrentFlatmap();
              map.setState(currentState.state);
            }
          });
        });
      }
    },
    resourceSelected: function(action) {
      this.$emit("resource-selected", action);
    },
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
    layerControl: {
      type: Boolean,
      default: false
    },
    /**
     * Initial species for the flatmap.
     * This value will be ignored if a valid state object is provided.
     */
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
    helpMode: {
      type: Boolean,
      default: false
    },
    displayMinimap: {
      type: Boolean,
      default: false
    },
    warningMessage: {
      type: String,
      default: "Beta feature - This map is based on the connectivity of a rat. New connectivity and species specificity will be added as the SPARC program progress."
    },
    availableSpecies: {
      type: Object,
      default: function() {
        return {
          "Human Female":{taxo: "NCBITaxon:9606", biologicalSex: "PATO:0000383", iconClass:"mapicon-icon_human", displayWarning:true},
          "Human Male":{taxo: "NCBITaxon:9606", biologicalSex: "PATO:0000384", iconClass:"mapicon-icon_human", displayWarning:true},
          "Rat":{taxo: "NCBITaxon:10114", iconClass:"mapicon-icon_rat", displayLatestChanges: true},
          "Mouse":{taxo: "NCBITaxon:10090", iconClass:"mapicon-icon_mouse", displayWarning: true},
          "Pig":{taxo: "NCBITaxon:9823", iconClass:"mapicon-icon_pig", displayWarning: true},
          "Cat":{taxo: "NCBITaxon:9685", iconClass:"mapicon-icon_cat", displayWarning: true},
        }
      }
    },
    /**
     * State containing state of the flatmap.
     */
    state: {
      type: Object,
      default: undefined,
    },
    /**
     * Specify the endpoint of the flatmap server.
     */
    flatmapAPI: {
      type: String,
      default: "https://mapcore-demo.org/current/flatmap/v3/"
    },
    sparcAPI: {
      type: String,
      default: "https://api.sparc.science/"
    } 
  },
  data: function() {
    return {
      activeSpecies: undefined,
      appendToBody: false,
      speciesList: {},
      requireInitialisation: true
    };
  },
  watch: {
    state: {
      handler: function(state) {
        this.setState(state);
      },
      immediate: true,
      deep: true,
    }
  }
};
</script>

<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/select";
@import "~element-ui/packages/theme-chalk/src/option";

.multi-container {
  height: 100%;
  width: 100%;
}

.species-display-text {
  width: 47px;
  height: 20px;
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
  left:24px;
  top:16px;
  position: absolute;
}

.select-box {
  width: 120px;
  border-radius: 4px;
  border: 1px solid rgb(144, 147, 153);
  background-color: var(--white);
  font-weight: 500;
  color:rgb(48, 49, 51);;
  left: 16px;
  top: 44px;
  position: absolute;
  ::v-deep .el-input__inner {
    color: rgb(48, 49, 51);
    padding-top: 0.25em;
    .is-focus {
      border: 1px solid $app-primary-color;
    }
  }
} 


::v-deep .flatmap_dropdown {
  min-width: 160px!important;
  .el-select-dropdown__item {
    white-space: nowrap;
    text-align: left;
    &.selected {
      color: $app-primary-color;
      font-weight: normal;
    }
  }
}

::v-deep .flatmap-popper {
  padding: 6px 4px;
  font-size:12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid $app-primary-color;
  white-space: nowrap;
  min-width: unset;
  &.right-popper {
    .popper__arrow {
      border-right-color: $app-primary-color !important;
      &:after {
        border-right-color: #f3ecf6 !important;
      }
    }
  }
}

::v-deep .flatmap-marker-popup{
  background-color: #f0f0f000  !important;
  box-shadow: none !important;
}

</style>


