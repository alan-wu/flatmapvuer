<template>
  <div
    class="flatmap-container"
    v-loading="loading"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <map-svg-sprite-color />
    <div style="height:100%;width:100%;position:relative;overflow-y:none">
      <div style="height:100%;width:100%;" ref="display"></div>
      <div class="beta-popovers">
        <div>
          <el-popover
            :content="warningMessage"
            placement="right"
            :appendToBody="false"
            trigger="manual"
            popper-class="warning-popper flatmap-popper right-popper"
            v-model="hoverVisibilities[6].value"
            ref="warningPopover"
          ></el-popover>
          <i
            class="el-icon-warning warning-icon"
            v-if="displayWarning && warningMessage"
            @mouseover="showToolitip(6)"
            @mouseout="hideToolitip(6)"
            v-popover:warningPopover
          >
          <span class="warning-text">Beta</span>
        </i>
        </div>
        <el-popover
          :content="latestChangesMessage"
          placement="right"
          v-if="displayLatestChanges"
          :appendToBody="false"
          trigger="manual"
          popper-class="warning-popper flatmap-popper right-popper"
          v-model="hoverVisibilities[7].value"
          ref="latestChangesPopover"
        ></el-popover>
        <i
          class="el-icon-warning latest-changesicon"
          v-if="displayLatestChanges && latestChangesMessage"
          @mouseover="showToolitip(7)"
          @mouseout="hideToolitip(7)"
          v-popover:latestChangesPopover
        >
          <span class="warning-text">What's new?</span>
        </i>
      </div>

      <div class="bottom-right-control">
        <el-popover
          content="Zoom in"
          placement="left"
          :appendToBody="false"
          trigger="manual"
          popper-class="flatmap-popper left-popper"
          v-model="hoverVisibilities[0].value"
        >
          <map-svg-icon
            icon="zoomIn"
            class="icon-button zoomIn"
            slot="reference"
            @click.native="zoomIn()"
            @mouseover.native="showToolitip(0)"
            @mouseout.native="hideToolitip(0)"
          />
        </el-popover>
        <el-popover
          content="Zoom out"
          placement="top-end"
          :appendToBody="false"
          trigger="manual"
          popper-class="flatmap-popper popper-zoomout"
          v-model="hoverVisibilities[1].value"
        >
          <map-svg-icon
            icon="zoomOut"
            class="icon-button zoomOut"
            slot="reference"
            @click.native="zoomOut()"
            @mouseover.native="showToolitip(1)"
            @mouseout.native="hideToolitip(1)"
          />
        </el-popover>
        <el-popover
          content="Reset"
          placement="top"
          :appendToBody="false"
          trigger="manual"
          popper-class="flatmap-popper"
          v-model="hoverVisibilities[2].value"
        >
          <div>
            Fit to
            <br>
            window
          </div>
          <map-svg-icon
            slot="reference"
            icon="fitWindow"
            class="icon-button fitWindow"
            @click.native="resetView()"
            @mouseover.native="showToolitip(2)"
            @mouseout.native="hideToolitip(2)"
          />
        </el-popover>
      </div>
      <el-popover
        content="Change pathway visibility"
        placement="right"
        :appendToBody="false"
        trigger="manual"
        popper-class="flatmap-popper right-popper"
        v-model="hoverVisibilities[4].value"
        ref="checkBoxPopover"
      />
      <div class="pathway-location" :class="{ open: drawerOpen, close: !drawerOpen }">
        <div
          class="pathway-container"
          v-if="pathways.length > 0 && pathControls"
          v-popover:checkBoxPopover
        >
          <svg-legends class= "svg-legends-container"/>
          <el-popover
            content="Find these markers for data"
            placement="right"
            :appendToBody="false"
            trigger="manual"
            popper-class="flatmap-popper popper-bump-right  right-popper"
            v-model="hoverVisibilities[5].value"
            ref="markerPopover"
          ></el-popover>
          <div
            v-show="hoverVisibilities[5].value"
            class="flatmap-marker-help"
            v-html="flatmapMarker"
            v-popover:markerPopover
          ></div>
          <el-row>
            <el-col :span="12">
              <div class="pathways-display-text">Pathways</div>
            </el-col>
            <el-col :span="12">
              <el-checkbox
                class="all-checkbox"
                :indeterminate="isIndeterminate"
                v-model="checkAll"
                @change="handleCheckAllChange"
              >Display all</el-checkbox>
            </el-col>
          </el-row>
          <el-checkbox-group
            v-model="checkedItems"
            size="small"
            class="checkbox-group"
            @change="handleCheckedItemsChange"
          >
            <div class="checkbox-group-inner">
              <el-row v-for="item in pathways" :key="item.type" :label="item.type">
                <div class="checkbox-container">
                  <el-checkbox
                    class="my-checkbox"
                    :label="item.type"
                    @change="visibilityToggle()"
                    :checked="true"
                  >
                    <div class="path-visual" :class="item.type"></div>
                    {{item.label}}
                  </el-checkbox>
                </div>
              </el-row>
            </div>
          </el-checkbox-group>
        </div>
        <div
          @click="toggleDrawer"
          class="drawer-button"
          :class="{ open: drawerOpen, close: !drawerOpen }"
        >
          <i class="el-icon-arrow-left"></i>
        </div>
      </div>
      <el-popover
        ref="backgroundPopover"
        placement="top-start"
        width="175"
        :appendToBody="false"
        trigger="click"
        popper-class="background-popper"
      >
        <el-row class="backgroundText">Organs display</el-row>
        <el-row class="backgroundControl">
          <el-radio-group v-model="colourRadio" class="flatmap-radio" @change="setColour">
            <el-radio :label="true">Colour</el-radio>
            <el-radio :label="false">Greyscale</el-radio>
          </el-radio-group>
        </el-row>
        <el-row class="backgroundSpacer"></el-row>
        <el-row class="backgroundText">Outlines display</el-row>
        <el-row class="backgroundControl">
          <el-radio-group v-model="outlinesRadio" class="flatmap-radio" @change="setOutlines">
            <el-radio :label="true">Show</el-radio>
            <el-radio :label="false">Hide</el-radio>
          </el-radio-group>
        </el-row>
        <el-row class="backgroundSpacer"></el-row>
        <el-row class="backgroundText">Change background</el-row>
        <el-row class="backgroundControl">
          <div
            v-for="item in availableBackground"
            :key="item"
            :class="['backgroundChoice', item, item == currentBackground ? 'active' :'']"
            @click="backgroundChangeCallback(item)"
          />
        </el-row>
      </el-popover>
      <el-popover
        content="Change background color"
        placement="right"
        v-model="hoverVisibilities[3].value"
        :appendToBody="false"
        trigger="manual"
        popper-class="flatmap-popper right-popper"
      >
        <map-svg-icon
          v-popover:backgroundPopover
          icon="changeBckgd"
          class="icon-button background-colour"
          :class="{ open: drawerOpen, close: !drawerOpen }"
          slot="reference"
          @mouseover.native="showToolitip(3)"
          @mouseout.native="hideToolitip(3)"
        />
      </el-popover>
      <Tooltip
        ref="tooltip"
        class="tooltip"
        :content="tooltipContent"
        @resource-selected="resourceSelected"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import Tooltip from "./Tooltip";
import { MapSvgIcon, MapSvgSpriteColor } from "@abi-software/svg-sprite";
import SvgLegends from "./legends/Legends";
import {
  Checkbox,
  CheckboxGroup,
  Col,
  Loading,
  Radio,
  RadioGroup,
  Row
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import flatmapMarker from "../icons/flatmap-marker";

locale.use(lang);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Col);
Vue.use(Loading.directive);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Row);
const ResizeSensor = require("css-element-queries/src/ResizeSensor");

const mapResize = map => {
  return () => {
    if (map) map.resize();
  };
};

export default {
  name: "FlatmapVuer",
  components: {
    MapSvgIcon,
    MapSvgSpriteColor,
    Tooltip,
    SvgLegends
  },
  beforeCreate: function() {
    this.mapManager = undefined;
    this.mapImp = undefined;
  },
  methods: {
    backgroundChangeCallback: function(colour) {
      this.currentBackground = colour;
      if (this.mapImp) {
        this.mapImp.setBackgroundColour(this.currentBackground, 1);
      }
    },
    toggleDrawer: function() {
      this.drawerOpen = !this.drawerOpen;
    },
    /**
     * Function to toggle colour/greyscale of organs.
     */
    setColour: function(flag) {
      this.colourRadio = flag;
      if (this.mapImp) {
        this.mapImp.setColour({ colour: flag, outline: this.outlinesRadio });
      }
    },
    /**
     * Function to toggle outlines f organs.
     */
    setOutlines: function(flag) {
      this.outlineRadio = flag;
      if (this.mapImp) {
        this.mapImp.setColour({ colour: this.colourRadio, outline: flag });
      }
    },
    /**
     * Function to toggle paths to default.
     * Also called when the associated button is pressed.
     */
    resetView: function() {
      if (this.mapImp) {
        this.mapImp.resetMap();
        this.checkedItems = this.mapImp.pathTypes().map(item => item.type);
        this.isIndeterminate = false;
        this.checkAll = true;
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
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.pathways.length;
    },
    handleCheckAllChange(val) {
      this.checkedItems = val ? this.pathways.map(a => a.type) : [];
      this.isIndeterminate = false;
      if (this.mapImp) {
        this.mapImp.showPaths(this.checkedItems);
      }
    },
    enablePanZoomEvents: function(flag) {
      this.mapImp.enablePanZoomEvents(flag);
    },
    eventCallback: function() {
      return (eventType, data, ...args) => {
        if (eventType !== "pan-zoom") {
          const label = data.label;
          const resource = [data.models];
          const taxonomy = this.entry;
          const biologicalSex = this.biologicalSex;
          const payload = {
            dataset: data.dataset,
            biologicalSex: biologicalSex,
            taxonomy: taxonomy,
            resource: resource,
            label: label,
            feature: data,
            userData: args,
            eventType: eventType
          };
          // Disable the nueron pop up for now.
          if (data && data.type !== "marker")
            this.checkAndCreatePopups(payload);
          this.$emit("resource-selected", payload);
        } else {
          this.$emit("pan-zoom-callback", data);
        }
      };
    },
    // checkNeuronClicked shows a neuron path pop up if a path was recently clicked
    checkAndCreatePopups: function(data) {
      if (
        data.eventType == "click" &&
        this.hasNeuronTooltip(data)
      ) {
        this.createTooltipFromNeuronCuration(data);
        this.mapImp.showPopup(
          this.mapImp.modelFeatureIds(data.resource[0])[0],
          this.$refs.tooltip.$el,
          { className: "flatmapvuer-popover", positionAtLastClick: true }
        );
        this.popUpCssHacks();
      }
    },
    popUpCssHacks: function() {
      // Below is a hack to remove flatmap tooltips while popup is open
      let ftooltip = document.querySelector(".flatmap-tooltip-popup");
      if (ftooltip) ftooltip.style.display = "none";
      document.querySelector(".mapboxgl-popup-close-button").style.display =
        "block";
      this.$refs.tooltip.$el.style.display = "flex";
      document.querySelector(".mapboxgl-popup-close-button").onclick = () => {
        document.querySelector(".flatmap-tooltip-popup").style.display =
          "block";
      };
    },
    resourceSelected: function(action) {
      this.$emit("resource-selected", action);
    },
    hasNeuronTooltip: function(data) {

      // neural data check
      if (data.resource[0]){
        if (data.resource[0].includes('ilxtr:neuron')){
          return true
        }
      }
      // annotated with datset check
      if (data.dataset) {
        return true
      }

      // if there is no cuff, neural data, or dataset we do not display neuron tooltip
      return false

    },
    createTooltipFromNeuronCuration: function(data) {
      const feature = data.resource[0];
      let content = {
        title: undefined,
        components: undefined,
        start: undefined,
        distribution: undefined,
        actions: []
      };

      this.tooltipVisible = false;

      // neural data check
      if (feature){
        if (feature.includes('ilxtr:neuron')){
          this.tooltipVisible = true;
          this.tooltipContent = content;
          this.tooltipContent.uberon = feature;
          this.tooltipContent.title = data.label;
          this.tooltipContent.featureIds = [feature];
          this.tooltipContent.actions.push({
            title: "Search for datasets",
            label: "Neuron Datasets",
            resource: feature.split(":")[1],
            type: "Neuron Search",
            feature: feature,
            nervePath: true
          });
        }
      }
      // annotated with datset check
      if (data.dataset) {
        this.tooltipVisible = true;
        this.tooltipContent = content;
        this.tooltipContent.uberon = feature;
        this.tooltipContent.title = data.label;
        this.tooltipContent.actions.push({
          title: "View dataset",
          resource: data.dataset,
          type: "URL",
          feature: feature,
          nervePath: false
        });
      }
    },
    // Keeping this as an API
    showPopup: function(featureId, node, options) {
      let myOptions = options;
      if (this.mapImp) {
        if (myOptions) {
          if (!myOptions.className) myOptions.className = "flatmapvuer-popover";
        } else {
          myOptions = { className: "flatmapvuer-popover", positionAtLastClick: true };
        }
        this.mapImp.showPopup(featureId, node, myOptions);
      }
    },
    showMarkerPopup: function(featureId, node, options) {
      if (this.mapImp) {
        this.mapImp.showMarkerPopup(featureId, node, options);
      }
    },
    setHelpMode: function(helpMode) {
      if (helpMode) {
        this.inHelp = true;
        this.hoverVisibilities.forEach(item => {
          item.value = true;
        });
        this.openFlatmapHelpPopup();
      } else {
        this.inHelp = false;
        this.hoverVisibilities.forEach(item => {
          item.value = false;
        });
        this.closeFlatmapHelpPopup();
      }
    },
    showToolitip: function(tooltipNumber) {
      if (!this.inHelp) {
        this.tooltipWait = setTimeout(() => {
          this.hoverVisibilities[tooltipNumber].value = true;
        }, 500);
      }
    },
    hideToolitip: function(tooltipNumber) {
      if (!this.inHelp) {
        this.hoverVisibilities[tooltipNumber].value = false;
        clearTimeout(this.tooltipWait);
      }
    },
    openFlatmapHelpPopup: function() {
      if (this.mapImp) {
        let heartId = this.mapImp.featureIdsForModel("UBERON:0000948")[0];
        const elm = "Click for more information";
        this.mapImp.showPopup(heartId, elm, {
          anchor: "top",
          className: "flatmap-popup-popper"
        });
      }
    },
    closeFlatmapHelpPopup: function() {
      this.$el
        .querySelectorAll(".mapboxgl-popup-close-button")
        .forEach(item => {
          item.click();
        });
    },
    getLabels: function() {
      let labels = [];
      if (this.mapImp) {
        let annotations = this.mapImp.annotations;
        for (let value of annotations.values()) {
          if (value.label) labels.push(value.label);
        }
        return Array.from(new Set(labels));
      }
    },
    getState: function() {
      if (this.mapImp) {
        let state = {
          entry: this.entry,
          biologicalSex: this.biologicalSex,
          viewport: this.mapImp.getState()
        };
        return state;
      }
      return undefined;
    },
    setState: function(state) {
      if (state) {
        if (this.mapImp && 
          (state.entry && (this.entry == state.entry)) &&
          (!state.biologicalSex || (state.biologicalSex === this.biologicalSex))) 
        {
          if (state.viewport) {
            this.mapImp.setState(state.viewport);
          }
        } else {
          this.createFlatmap(state);
        }
      }
    },
    createFlatmap: function(state) {
      if (!this.mapImp && !this.loading) {
        this.loading = true;
        let minimap = false;
        if (this.displayMinimap) {
          minimap = { position: "top-right" };
        }

        //As for flatmap-viewer@2.2.6, see belowf for the documentation 
        //for the identifier:

        //@arg identifier {string|Object}
        // A string or object identifying the map to load. If a string its
        // value can be either the map's ``uuid``, assigned at generation time,
        // or taxon and biological sex identifiers of the species that the map
        // represents. The latest version of a map is loaded unless it has been
        // identified using a ``uuid`` (see below).
        // @arg identifier.taxon {string} The taxon identifier of the species 
        //  represented by the map. This is specified as metadata in the map's source file.
        // @arg identifier.biologicalSex {string} The biological sex of the species
        // represented by the map. This is specified as metadatain the map's source file.
        // @arg identifier.uuid {string} The unique uuid the flatmap. If given then this exact map will
        //  be loaded, overriding ``taxon`` and ``biologicalSex``.

        let identifier = { taxon: this.entry };
        if (state && state.entry) {
          identifier.taxon = state.entry;
          if (state.biologicalSex) {
            identifier["biologicalSex"] = state.biologicalSex;
          } else if (identifier.taxon === "NCBITaxon:9606") {
            //For backward compatibility
            identifier["biologicalSex"] ="PATO:0000384";
          }
        } else {
          // Set the bioloicalSex now if map is not resumed from
          // a saved state
          if (this.biologicalSex) {
            identifier["biologicalSex"] = this.biologicalSex;
          }
        }

        let promise1 = this.mapManager.loadMap(
          identifier,
          this.$refs.display,
          this.eventCallback(),
          {
            //fullscreenControl: false,
            //annotatable: false,
            //debug: true,
            featureInfo: this.featureInfo,
            "min-zoom": this.minZoom,
            pathControls: false,
            searchable: this.searchable,
            tooltips: this.tooltips,
            minimap: minimap
          }
        );
        promise1.then(returnedObject => {
          this.mapImp = returnedObject;
          this.sensor = new ResizeSensor(
            this.$refs.display,
            mapResize(this.mapImp)
          );
          this.mapImp.setBackgroundOpacity(1);
          this.backgroundChangeCallback(this.currentBackground);
          this.pathways = this.mapImp.pathTypes();
          this.$emit("ready", this);
          this.loading = false;
          if (this._viewportToBeSet)
            this.mapImp.setState(this._viewportToBeSet);
          else if (state && state.viewport)
            this.mapImp.setState(state.viewport);
        });
      } else if (state) {
        if (this.entry == state.entry)
          this._viewportToBeSet = state.viewport;
      }
    },
    showMinimap: function(flag) {
      if (this.mapImp)
        this.mapImp.showMinimap(flag);
    },
    showPathwaysDrawer: function(flag) {
      this.drawerOpen = flag;
    },
    /**
     * Function to display features with annotation matching the provided term.
     */
    searchAndShowResult: function(term) {
      if (this.mapImp) {
        if (term === undefined || term === "") {
          this.mapImp.clearSearchResults();
          return true;
        } else {
          let searchResults = this.mapImp.search(term);
          if (searchResults && searchResults.__featureIds.length > 0) {
            this.mapImp.showSearchResults(searchResults);
            return true;
          }
          else
            this.mapImp.clearSearchResults();
        }
      }
      return false;
    },
    /**
     * Get the list of suggested terms
     */
    searchSuggestions: function(term) {
      if (this.mapImp)
        return this.mapImp.search(term);
      return [];
    },
  },
  props: {
    entry: String,
    biologicalSex: String,
    featureInfo: {
      type: Boolean,
      default: false
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
      default: false
    },
    tooltips: {
      type: Boolean,
      default: true
    },
    helpMode: {
      type: Boolean,
      default: false
    },
    renderAtMounted: {
      type: Boolean,
      default: true
    },
    displayMinimap: {
      type: Boolean,
      default: false
    },
    displayWarning: {
      type: Boolean,
      default: false
    },
    warningMessage: {
      type: String,
      default: "Beta feature - This map is based on the connectivity of a rat. New connectivity and species specificity will be added as the SPARC program progress."
    },
    displayLatestChanges: {
      type: Boolean,
      default: false,
    },
    latestChangesMessage: {
      type: String,
      default: "Search now provide suggested terms. Add new legends. New tilesets. New female map. Improve upstream downstream information",
    },
    /**
     * State containing state of the flatmap.
     */
    state: {
      type: Object,
      default: undefined
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
    },
  },
  provide() {
    return {
      sparcAPI: this.sparcAPI,
      flatmapAPI: this.flatmapAPI
    }
  },
  data: function() {
    return {
      checkedItems: [],
      pathways: [],
      isIndeterminate: false,
      checkAll: true,
      hoverVisibilities: [
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false }
      ],
      inHelp: false,
      currentBackground: "white",
      availableBackground: ["white", "lightskyblue", "black"],
      loading: false,
      flatmapMarker: flatmapMarker,
      drawerOpen: true,
      tooltipContent: { featureIds: []},
      colourRadio: true,
      outlinesRadio: true
    };
  },
  watch: {
    entry: function() {
      if (!this.state) this.createFlatmap();
    },
    helpMode: function(val) {
      this.setHelpMode(val);
    },
    state: {
      handler: function(state) {
        this.setState(state);
      },
      immediate: true,
      deep: true
    }
  },
  mounted: function() {
    const flatmap = require("@abi-software/flatmap-viewer");
    this.mapManager = new flatmap.MapManager(this.flatmapAPI);
    if (this.renderAtMounted) this.createFlatmap();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/checkbox";
@import "~element-ui/packages/theme-chalk/src/checkbox-group";
@import "~element-ui/packages/theme-chalk/src/loading";
@import "~element-ui/packages/theme-chalk/src/row";

.beta-popovers {
  position: absolute;
  top: 90px;
  left: 16px;
  text-align: left;
  font-size: 25px;  
}

.warning-icon {
  color: $warning;

  &:hover {
    cursor: pointer;
  }
}

.warning-text {
  font-family: Asap, sans-serif;
  font-size: 15px;
  vertical-align: 5px;
}

.latest-changesicon {
  color: $success;

  &:hover {
    cursor: pointer;
  }
}

.latest-changestext {
  font-family: Asap, sans-serif;
  font-size: 15px;
  vertical-align: 5px;
}

.path-visual {
  margin: 3px 0;
  height: 3px;
  width: 25px;
  margin-right: 5px;
  display: inline-block;
  &.cns {
    background: #9b1fc1;
  }
  &.lcn {
    background: #f19e38;
  }
  &.para-pre {
    background: #3f8f4a;
  }
  &.para-post {
    background: repeating-linear-gradient(
      90deg,
      #3f8f4a,
      #3f8f4a 6px,
      transparent 0,
      transparent 9px
    );
  }
  &.sensory {
    background: #2a62f6;
  }
  &.somatic {
    background: #98561d;
  }
  &.symp-pre {
    background: #ea3423;
  }
  &.symp-post {
    background: repeating-linear-gradient(
      90deg,
      #ea3423,
      #ea3423 6px,
      transparent 0,
      transparent 9px
    );
  }
}

.flatmap-container {
  height: 100%;
  width: 100%;
}

.pathway-location {
  position: absolute;
  bottom: 0px;
  transition: all 1s ease;
  &.open {
    left: 0px;
  }
  &.close {
    left: -298px;
  }
}

.svg-legends-container {
  width:70%;
  height:auto;
}

.pathway-container {
  float: left;
  padding-left: 16px;
  padding-right: 18px;
  max-height: calc(100% - 184px);
  text-align: left;
  overflow: auto;
  border: 1px solid rgb(220, 223, 230);
  padding-bottom: 16px;
  background: #ffffff;
}

.pathways-display-text {
  width: 59px;
  height: 20px;
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
  margin-left: 8px;
}

.all-checkbox {
  float: right;
}

.checkbox-container {
  display: flex;
  cursor: pointer;
}

.checkbox-group {
  width: 260px;
  border: 1px solid rgb(144, 147, 153);
  border-radius: 4px;
  background: #ffffff;
}

.my-checkbox {
  background-color: #fff;
  width: 100%;
}

.checkbox-group-inner {
  padding: 18px;
}

.flatmap-marker-help {
  display: inline-block;
}

::v-deep .popper-bump-right {
  left: 30px;
}

::v-deep .el-checkbox__label {
  padding-left: 5px;
  color: $app-primary-color;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
}

::v-deep .el-checkbox__input {
  &.is-indeterminate,
  &.is-checked {
    .el-checkbox__inner {
      background-color: $app-primary-color;
      border-color: $app-primary-color;
    }
  }
}

::v-deep .el-checkbox__label {
  color: $app-primary-color !important;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
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

.tooltip {
  display: none;
}

::v-deep .mapboxgl-popup {
  max-width: 300px !important;
}

::v-deep .flatmap-tooltip-popup {
  &.mapboxgl-popup-anchor-bottom {
    .mapboxgl-popup-content {
      margin-bottom: 12px;
      &::after,
      &::before {
        top: 100%;
        border-width: 12px;
      }
      /* this border color controlls the color of the triangle (what looks like the fill of the triangle) */
      &::after {
        margin-top: -1px;
        border-color: rgb(255, 255, 255) transparent transparent transparent;
      }
      /* this border color controlls the outside, thin border */
      &::before {
        margin: 0 auto;
        border-color: $app-primary-color transparent transparent transparent;
      }
    }
  }
  &.mapboxgl-popup-anchor-top {
    .mapboxgl-popup-content {
      margin-top: 18px;
      &::after,
      &::before {
        top: calc(-100% + 6px);
        border-width: 12px;
      }
      /* this border color controlls the color of the triangle (what looks like the fill of the triangle) */
      &::after {
        margin-top: 1px;
        border-color: transparent transparent rgb(255, 255, 255) transparent;
      }
      &::before {
        margin: 0 auto;
        border-color: transparent transparent $app-primary-color transparent;
      }
    }
  }
  .mapboxgl-popup-content {
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    display: none;
    background: #fff;
    border: 1px solid $app-primary-color;
    padding-left: 6px;
    padding-right: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    &::after,
    &::before {
      content: "";
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
      flex-shrink: 0;
    }
  }
  .mapboxgl-popup-tip {
    display: none;
  }
}

::v-deep .mapboxgl-popup {
  &.flatmap-marker-popup {
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    background: #fff;
  }
}

/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root),
::v-deep.flatmap-tooltip-popup {
  .mapboxgl-popup-content::after {
    top: 99.9%;
  }
}

::v-deep .flatmap-tooltip-dialog {
  .mapboxgl-popup-tip {
    display: none;
  }
}

::v-deep .flatmap-marker-popup {
  .mapboxgl-popup-content {
    padding: 0px;
  }
}

::v-deep .flatmapvuer-popover {
  .mapboxgl-popup-close-button {
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
}

.zoomOut {
  padding-left: 8px;
}

.fitWindow {
  padding-left: 8px;
}

.background-colour {
  bottom: 16px;
  position: absolute;
  transition: all 1s ease;
}
.background-colour.open {
  left: 322px;
}
.background-colour.close {
  left: 24px;
}

::v-deep .background-popper {
  padding: 5px 12px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  height: 200px;
  width: 175px;
  min-width: 175px;
  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: $app-primary-color !important;
      &::after {
        border-top-color: #fff !important;
      }
    }
  }
}

.backgroundText {
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
}

.backgroundControl {
  display: flex;
  margin-top: 16px;
}

.backgroundChoice {
  width: 20px;
  height: 20px;
  border: 1px solid rgb(144, 147, 153);
  margin-left: 20px;
  &.active {
    border: 2px solid $app-primary-color;
  }
  &:hover {
    cursor: pointer;
  }
  &.white {
    background-color: white;
    margin-left: 10px;
  }
  &.black {
    background-color: black;
  }
  &.lightskyblue {
    background-color: lightskyblue;
  }
}

.togglePaths {
  top: 201px;
  right: 20px;
  position: absolute;
}

.icon-button {
  height: 24px !important;
  width: 24px !important;
  color: $app-primary-color;
  &:hover {
    cursor: pointer;
  }
}

::v-deep .flatmap-popper {
  padding: 6px 4px;
  font-size: 12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid $app-primary-color;
  white-space: nowrap;
  min-width: unset;
  &.warning-popper {
    min-width: 150px;
    max-width: 400px;
    word-break: keep-all;
    white-space: unset;
  }
  &.left-popper {
    .popper__arrow {
      border-left-color: $app-primary-color !important;
      &::after {
        border-left-color: #f3ecf6 !important;
      }
    }
  }
  &.right-popper {
    .popper__arrow {
      border-right-color: $app-primary-color !important;
      &:after {
        border-right-color: #f3ecf6 !important;
      }
    }
  }
  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: $app-primary-color !important;
      &:after {
        border-top-color: #f3ecf6 !important;
      }
    }
  }
}

::v-deep .el-loading-spinner {
  i,
  .el-loading-text {
    color: $app-primary-color;
  }
}

::v-deep .flatmap-popup-popper {
  .mapboxgl-popup-tip {
    border-bottom-color: $app-primary-color;
  }
  .mapboxgl-popup-content {
    padding: 6px 4px;
    font-size: 12px;
    color: rgb(48, 49, 51);
    background-color: #f3ecf6;
    border: 1px solid $app-primary-color;
    white-space: nowrap;
    min-width: unset;
    .mapboxgl-popup-close-button {
      display: none;
    }
  }
}

::v-deep .flatmap-popper {
  
}

::v-deep .popper-zoomout {
  padding-right: 13px !important;
  left: -21px !important;
}

::v-deep .popper-zoomout {
  .popper__arrow {
    left: 53px !important;
  }
}

::v-deep .mapboxgl-popup-content {
  padding: 0px;
}

.bottom-right-control {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

::v-deep .my-drawer {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}

.drawer {
  ::v-deep .el-drawer:focus {
    outline: none;
  }
}

.open-drawer,
.drawer-button {
  z-index: 8;
  width: 20px;
  height: 40px;
  border: solid 1px $app-primary-color;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.open-drawer {
  position: absolute;
  left: 0px;
  background-color: #f7faff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.drawer-button {
  float: left;
  margin-top: calc(50% - 36px);
  background-color: #F9F2FC;

  i {
    font-weight: 600; 
    margin-top: 12px;
    color: $app-primary-color;
    transition-delay: 0.9s;
  }
  &.open {
    i {
      transform: rotate(0deg) scaleY(2);
    }
  }
  &.close {
    i {
      transform: rotate(180deg) scaleY(2);
    }
  }
}

::v-deep .mapboxgl-canvas-container {
  canvas {
    outline: none;
  }
}

.backgroundSpacer {
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.flatmap-radio {
  ::v-deep label {
    margin-right: 20px;
    &:last-child {
      margin-right: 0px;
    }
  }
  .el-radio__input {
    &.is-checked {
      & + .el-radio__label {
        color: $app-primary-color;
      }
      .el-radio__inner {
        border-color: $app-primary-color;
        background: $app-primary-color;
      }
    }
  }
}
</style>

