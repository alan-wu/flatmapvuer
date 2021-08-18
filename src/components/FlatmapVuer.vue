<template>
  <div class="flatmap-container"
      v-loading="loading"
      element-loading-text="Loading..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.3)">
    <SvgSpriteColor/>
    <div style="height:100%;width:100%;position:relative;overflow-y:none">
      <div style="height:100%;width:100%;" ref="display"></div>
      <el-popover :content="warningMessage" placement="right"
        v-if="displayWarning" :appendToBody=false trigger="manual" popper-class="warning-popper right-popper" v-model="hoverVisibilities[6].value"
        ref="warningPopover">
      </el-popover>
      <i class="el-icon-warning warning-icon" v-if="displayWarning" 
        @mouseover="showToolitip(6)" @mouseout="hideToolitip(6)"
        v-popover:warningPopover>
        <span class="warning-text">Beta</span>
      </i>
      <div class="bottom-right-control">
        <el-popover content="Zoom in" placement="left" 
          :appendToBody=false trigger="manual" popper-class="flatmap-popper left-popper" v-model="hoverVisibilities[0].value">
          <SvgIcon icon="zoomIn" class="icon-button zoomIn" slot="reference" @click.native="zoomIn()"
            @mouseover.native="showToolitip(0)" @mouseout.native="hideToolitip(0)"/>
        </el-popover>
        <el-popover content="Zoom out" placement="top-end"
          :appendToBody=false trigger="manual" popper-class="flatmap-popper popper-zoomout" v-model="hoverVisibilities[1].value">
          <SvgIcon icon="zoomOut" class="icon-button zoomOut" slot="reference" @click.native="zoomOut()"
            @mouseover.native="showToolitip(1)" @mouseout.native="hideToolitip(1)"/>
        </el-popover>
        <el-popover content="Reset" placement="top"
          :appendToBody=false trigger="manual" popper-class="flatmap-popper" v-model="hoverVisibilities[2].value">
          <SvgIcon icon="resetZoom" class="icon-button resetView" slot="reference" @click.native="resetView()"
            @mouseover.native="showToolitip(2)" @mouseout.native="hideToolitip(2)"/>
        </el-popover>
      </div>
      <el-popover content="Change pathway visibility" placement="right"
        :appendToBody=false trigger="manual" popper-class="flatmap-popper right-popper" v-model="hoverVisibilities[4].value" ref="checkBoxPopover"/>
      <div class="pathway-location" :class="{ open: drawerOpen, close: !drawerOpen }">
        <div class="pathway-container" v-if="pathways.length > 0 && pathControls"
           v-popover:checkBoxPopover>
          <el-popover content="Find these markers for data" placement="right"
            :appendToBody=false trigger="manual" popper-class="flatmap-popper popper-bump-right  right-popper" v-model="hoverVisibilities[5].value" ref="markerPopover">
          </el-popover>
          <div v-show="hoverVisibilities[5].value" class="flatmap-marker-help" v-html="flatmapMarker" v-popover:markerPopover></div>
          <el-row>
            <el-col :span="12">
              <div class="pathways-display-text">
                Pathways
              </div>
            </el-col>
            <el-col :span="12">
              <el-checkbox class="all-checkbox" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">Display all</el-checkbox>
            </el-col>
          </el-row>
          <el-checkbox-group v-model="checkedItems" size="small" 
            class="checkbox-group" @change="handleCheckedItemsChange">
            <div class="checkbox-group-inner">
              <el-row v-for="item in pathways" :key="item.type" :label="item.type">
                <div class="checkbox-container">
                  <el-checkbox
                    class="my-checkbox"
                    :label="item.type"
                    @change="visibilityToggle()"
                    :checked="true"
                  ><div class="path-visual" :class="item.type"></div>{{item.label}}</el-checkbox>
                </div>
              </el-row>
            </div>
          </el-checkbox-group>
        </div>
        <div @click="toggleDrawer" class="drawer-button" :class="{ open: drawerOpen, close: !drawerOpen }">
          <i class="el-icon-arrow-left"></i>
        </div>
      </div>
      <el-popover
        ref="backgroundPopover"
        placement="top-start"
        width="175"
        :appendToBody=false
        trigger="click"
        popper-class="background-popper">
        <el-row class="backgroundText">
          Organ display
        </el-row>
        <el-row class="backgroundControl" >
          <el-radio-group v-model="radio" class="flatmap-radio"
            @change="setColour">
            <el-radio :label="true">Colour</el-radio>
            <el-radio :label="false">Greyscale</el-radio>
          </el-radio-group>
        </el-row>
        <el-row class="backgroundSpacer">
        </el-row>
        <el-row class="backgroundText">
          Change background
        </el-row>
        <el-row class="backgroundControl" >
          <div v-for="item in availableBackground" :key="item" 
            :class="['backgroundChoice', item, item == currentBackground ? 'active' :'']" 
            @click="backgroundChangeCallback(item)"/>
        </el-row>
      </el-popover>
      <el-popover  content="Change background color" placement="right" v-model="hoverVisibilities[3].value"
        :appendToBody=false trigger="manual" popper-class="flatmap-popper right-popper">
        <SvgIcon v-popover:backgroundPopover icon="changeBckgd" class="icon-button background-colour" 
          :class="{ open: drawerOpen, close: !drawerOpen }" slot="reference"
          @mouseover.native="showToolitip(3)" @mouseout.native="hideToolitip(3)"/>
      </el-popover>
      <Tooltip ref="tooltip" class="tooltip" :content="tooltipContent" @resource-selected="resourceSelected"/>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import Tooltip from './Tooltip'
import { SvgIcon, SvgSpriteColor} from '@abi-software/svg-sprite'
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
const ResizeSensor = require('css-element-queries/src/ResizeSensor');

const mapResize = map => {
  return () => {
    if (map)
      map.resize();
  }
}

export default {
  name: "FlatmapVuer",
  components: {
    SvgIcon,
    SvgSpriteColor,
    Tooltip
  },
  beforeCreate: function() {
    this.mapManager = undefined;
    this.mapImp = undefined;
  },
  methods: {
    backgroundChangeCallback: function(colour) {
      this.currentBackground = colour;
      if (this.mapImp) {
        this.mapImp.setBackgroundColour(this.currentBackground, 1 );
      }
    },
    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen;
    },
    /**
     * Function to toggle colour/greyscale of organs.
     */
    setColour: function(flag) {
      this.label = flag;
      if (this.mapImp) {
        this.mapImp.setColour(flag);
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
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.pathways.length;
    },
    handleCheckAllChange(val) {
      this.checkedItems = val ? this.pathways.map(a => a.type) : [];
      this.isIndeterminate = false;
      if (this.mapImp) {
        this.mapImp.showPaths(this.checkedItems);
      }
    },
    eventCallback: function() {
      
      return (eventType, feature, ...args) => {
        const label = feature.label;
        const resource = [ feature.models ];
        const taxonomy = this.entry;
        const data = { dataset: feature.dataset, taxonomy: taxonomy, resource: resource, label: label,
          feature: feature, userData: args, eventType: eventType};
        if (feature && feature.type !== "marker")
          this.checkAndCreatePopups(data)
        this.$emit("resource-selected", data);
      }
    },
    // checkNeuronClicked shows a neuron path pop up if a path was recently clicked
    checkAndCreatePopups: function(data){
      if (data.eventType == 'click' && this.createTooltipFromNeuronCuration(data)) { 
        this.mapImp.showPopup(this.mapImp.modelFeatureIds(data.resource[0])[0],this.$refs.tooltip.$el,
          {className: "flatmap-tooltip-dialog"})
        this.popUpCssHack()
      }
    },
    popUpCssHack: function(){
      // Below is a hack to remove flatmap tooltips while popup is open
      let ftooltip = document.querySelector('.flatmap-tooltip-popup')
      if (ftooltip) ftooltip.style.display = 'none'
      document.querySelector('.mapboxgl-popup-close-button').style.display = 'block'
      this.$refs.tooltip.$el.style.display = 'flex'
      document.querySelector('.mapboxgl-popup-close-button').onclick = ()=>{
        document.querySelector('.flatmap-tooltip-popup').style.display = 'block'
      }
    },
    resourceSelected: function(action){
      this.$emit("resource-selected", action)
    },
    createTooltipFromNeuronCuration: function(data){
      const feature = data.resource[0]
      let content = {
        title: undefined, components: undefined, start: undefined, distribution: undefined, actions: []
      }
      
      let foundAnnotations = false
      this.tooltipVisible = false

      // neural data check
      if (feature){
        if (feature.includes('ilxtr:neuron')){
          foundAnnotations = true
          this.tooltipVisible = true
          this.tooltipContent = content
          this.tooltipContent.uberon = feature
          this.tooltipContent.title = data.label
          this.tooltipContent.featureId = feature
          this.tooltipContent.actions.push({
            title: 'Search for dataset',
            label: 'Neuron Datasets',
            resource: feature.split(':')[1],
            type: 'Neuron Search',
            nervePath: true,
          })
        }
      }
      // annotated with datset check
      if (data.dataset){
        foundAnnotations = true
        this.tooltipVisible = true
        this.tooltipContent = content
        this.tooltipContent.uberon = feature
        this.tooltipContent.title = data.label
        this.tooltipContent.actions.push({
          title: "View dataset",
          resource: data.dataset,
          type: "URL",
          nervePath: false,
        })
      }
    
      if(foundAnnotations) { return true } else { return false }
    },
    // Keeping this as an API 
    showPopup: function(featureId, node, options) {
      let myOptions = options;
      if (this.mapImp) {
        if (myOptions) {
          if (!myOptions.className)
            myOptions.className = "flatmapvuer-popover";
        } else {
          myOptions = {className: "flatmapvuer-popover"};
        }
        this.mapImp.showPopup(featureId, node, myOptions);
      }
    },
    showMarkerPopup: function(featureId, node, options) {
      if (this.mapImp) {
        this.mapImp.showMarkerPopup(featureId, node, options);
      }
    },
    setHelpMode: function(helpMode){
      if (helpMode){
        this.inHelp = true;
        this.hoverVisibilities.forEach( (item) =>{
          item.value = true;
        });
        this.openFlatmapHelpPopup();
      } else {
        this.inHelp = false;
        this.hoverVisibilities.forEach( (item) =>{
          item.value = false;
        });
        this.closeFlatmapHelpPopup();
      }
    },
    showToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.tooltipWait = setTimeout( ()=>{
          this.hoverVisibilities[tooltipNumber].value = true}, 500);
      }
    },
    hideToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.hoverVisibilities[tooltipNumber].value = false;
        clearTimeout(this.tooltipWait);
      }
    },
    openFlatmapHelpPopup: function(){
      if (this.mapImp) {
        let heartId = this.mapImp.featureIdsForModel('UBERON:0000948')[0];
        const elm = 'Click for more information';
        this.mapImp.showPopup(heartId, elm, {anchor: "top", className: "flatmap-popup-popper"});
      }
    },
    closeFlatmapHelpPopup: function(){
      this.$el.querySelectorAll('.mapboxgl-popup-close-button').forEach((item) => {item.click()});
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
    getState: function() {
      if (this.mapImp) {
        let state = {
          entry: this.entry,
          viewport: this.mapImp.getState(),
        }
        return state;
      }
      return undefined;
    },
    setState: function(state) {
      if (state) {
        if (this.mapImp && state.entry) {
          if (this.entry == state.entry)
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
        let entry = this.entry;
        if (state && state.entry)
          entry = state.entry;
        let promise1 = this.mapManager.loadMap(entry, this.$refs.display,
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
          });
        promise1.then(returnedObject => {
          this.mapImp = returnedObject;
          this.sensor = new ResizeSensor(this.$refs.display, mapResize(this.mapImp));
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
    /**
     * Function to display features with annotation matching the provided term.
     */
    searchAndShowResult: function(term) {
      if (this.mapImp) {
        if (term === undefined || term === "") {
          this.mapImp.clearSearchResults();
        }
        else {
          let searchResults = this.mapImp.search(term);
          if (searchResults && searchResults.__featureIds.length > 0)
            this.mapImp.showSearchResults(searchResults);
          else
            this.mapImp.clearSearchResults();
        }
      }
    }
  },
  props: {
    entry: String,
    featureInfo: {
      type: Boolean,
      default: false,
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
      default: false,
    },
    tooltips: {
      type: Boolean,
      default: true,      
    },
    helpMode: {
      type: Boolean,
      default: false
    },
    renderAtMounted: {
      type: Boolean,
      default: true, 
    },
    displayWarning: {
      type: Boolean,
      default: true
    },
    displayMinimap: {
      type: Boolean,
      default: false
    },
    warningMessage: {
      type: String,
      default: "Beta feature - under active development"
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
      default: undefined
    },
  },
  data: function() {
    return {
      checkedItems: [],
      pathways: [],
      isIndeterminate: false,
      checkAll: true,
      hoverVisibilities: [{value: false}, {value: false}, {value: false},
        {value: false}, {value: false}, {value: false}, {value: false}],
      inHelp: false,
      currentBackground: 'white',
      availableBackground: ['white', 'lightskyblue', 'black' ],
      loading: false,
      flatmapMarker: flatmapMarker,
      drawerOpen: true,
      tooltipContent: {},
      radio: true
    };
  },
  watch: {
    entry: function() {
      if (!this.state)
        this.createFlatmap();
    },
    helpMode: function(val){
      this.setHelpMode(val);
    },
    state: {
      handler: function(state) {
        this.setState(state);
      },
      immediate: true,
      deep: true,
    }
  },
  mounted: function() {
    const flatmap = require("@abi-software/flatmap-viewer");
    let endpoint = this.flatmapAPI;
    if (!endpoint)
      endpoint = "https://mapcore-demo.org/flatmaps/";
    this.mapManager = new flatmap.MapManager(endpoint);
    if (this.renderAtMounted)
      this.createFlatmap();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.warning-icon {
  position: absolute;
  top: 90px;
  left: 37px;
  text-align: left;
  font-size: 25px;
  color: #ff8400;
}
.warning-icon:hover {
  cursor: pointer;
}
>>> .warning-popper {
  padding:9px 10px;
  min-width:150px;
  font-size:12px;
  color: #fff;
  background-color: #ff8400;
}
>>> .warning-popper.right-popper .popper__arrow::after{
  border-right-color: #ff8400 !important;
}

.warning-text{
  font-size: 15px;
  vertical-align:5px;
}

.path-visual {
  margin: 3px 0;
  height: 3px;
  width:25px;
  margin-right: 5px;
  display: inline-block;
}

.path-visual.cns {
  background:#9b1fc1;
}

.path-visual.lcn {
  background:#f19e38;
}

.path-visual.para-pre {
  background:#3f8f4a;
}

.path-visual.para-post {
  background:repeating-linear-gradient(90deg,#3f8f4a,#3f8f4a 6px,transparent 0,transparent 9px);
}

.path-visual.sensory {
  background:#2a62f6;
}

.path-visual.somatic {
  background:#98561d;
}

.path-visual.symp-pre {
  background: #ea3423;
}

.path-visual.symp-post {
  background: repeating-linear-gradient(90deg,#ea3423,#ea3423 6px,transparent 0,transparent 9px);
}

.flatmap-container {
  height: 100%;
  width: 100%;
}

.pathway-location {
  position: absolute;
  bottom: 0px;
  transition: all 1s ease;
}
.pathway-location.open {
  left: 0px;
}
.pathway-location.close {
  left: -298px;
}

.pathway-container {
  float: left;
  padding-left: 16px;
  padding-right: 18px;
  max-height: calc(100% - 184px);
  text-align: left;
  overflow: auto;
  border: 1px solid rgb(220, 223, 230);
  padding-top:7px;
  padding-bottom:16px;
  background:#ffffff;
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
  width:100%;
}

.checkbox-group-inner {
  padding:18px;
}

.flatmap-marker-help{
  display: inline-block;
}

>>> .popper-bump-right{
  left: 30px;
}

>>> .el-checkbox__label {
  padding-left:5px;
  color: rgb(131, 0, 191);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
}

>>> .el-checkbox__input.is-indeterminate .el-checkbox__inner
{
  background-color: #8300bf;
  border-color:  #8300bf;
}

>>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #8300bf;
  border-color:  #8300bf;
}

>>> .el-checkbox__label {
  color:  #8300bf !important;
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

.tooltip {
  display: none;
}

>>> .mapboxgl-popup{
  max-width: 300px !important;
}

>>>.flatmap-tooltip-popup .mapboxgl-popup-content {
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,.1);
  pointer-events: none;
  display: none;
  background: #fff;
  border: 1px solid rgb(131, 0, 191);
  padding-left: 6px;
  padding-right: 6px;
  display: flex;
  justify-content: center;
  align-items: center;

}

>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-content {
  margin-bottom: 12px;
}

>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-content {
  margin-top: 18px;
}

>>> .mapboxgl-popup.flatmap-marker-popup{
  box-shadow: 1px 1px 2px rgba(0,0,0,.1);
  pointer-events: auto;
  background: #fff;
}


>>>.flatmap-tooltip-popup .mapboxgl-popup-content::after,
>>>.flatmap-tooltip-popup .mapboxgl-popup-content::before {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    flex-shrink: 0;
}

>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-content::after,
>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-content::before {
    top: 100%;
}

/* this border color controlls the color of the triangle (what looks like the fill of the triangle) */
>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-content::after {
    margin-top: -1px;
    border-color: rgb(255, 255, 255) transparent transparent  transparent ;
    border-width: 12px;
}

>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-content::after,
>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-content::before {
    top: calc(-100% + 6px);
}

/* this border color controlls the color of the triangle (what looks like the fill of the triangle) */
>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-content::after {
    margin-top: 1px;
    border-color:  transparent transparent rgb(255, 255, 255) transparent ;
    border-width: 12px;
}

/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root), >>>.flatmap-tooltip-popup .mapboxgl-popup-content::after{
  top: 99.9%;
}

/* this border color controlls the outside, thin border */
>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-bottom .mapboxgl-popup-content::before {
    margin: 0 auto;
    border-color: rgb(131, 0, 191)  transparent  transparent transparent ;
    border-width: 12px;
}

>>>.flatmap-tooltip-popup.mapboxgl-popup-anchor-top .mapboxgl-popup-content::before {
    margin: 0 auto;
    border-color: transparent  transparent rgb(131, 0, 191) transparent ;
    border-width: 12px;
}

>>> .flatmap-tooltip-popup .mapboxgl-popup-tip{
  display: none;
}

>>> .flatmap-tooltip-dialog .mapboxgl-popup-tip {
  display: none;
}

>>> .flatmap-marker-popup .mapboxgl-popup-content {
  padding: 0px;
}

>>>.flatmapvuer-popover .mapboxgl-popup-close-button {
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

.zoomOut{
  padding-left: 8px;
}

.resetView {
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

>>> .background-popper {
  padding: 5px 12px;
  background-color: #ffffff;
  border: 1px solid rgb(131, 0, 191);
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  height: 144px;
  width: 128px;
  min-width:128px;
}

.backgroundText {
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
}

.backgroundControl {
  display: flex;
  margin-top:16px;
}

.backgroundChoice {
  width:20px;
  height:20px;
  border: 1px solid rgb(144, 147, 153);
  margin-left:20px;
}
.backgroundChoice.active {
  border:2px solid #8300bf;
}
.backgroundChoice:hover {
  cursor: pointer;
}

.backgroundChoice.white {
  background-color: white;
  margin-left:10px;
}
.backgroundChoice.black {
  background-color: black;
}
.backgroundChoice.lightskyblue {
  background-color: lightskyblue;
}

.togglePaths {
  top:201px;
  right:20px;
  position: absolute;
}

.icon-button {
  height:24px!important;
  width:24px!important;
  color: #8300bf;
}
.icon-button:hover {
  cursor:pointer;
}

>>> .flatmap-popper {
  padding: 6px 4px;
  font-size:12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid rgb(131, 0, 191);
  white-space: nowrap;
  min-width: unset;
}

>>> .flatmap-marker{
  cursor: pointer;
}

>>>.el-loading-spinner i{
  color: #8300bf;  
}
>>>.el-loading-spinner .el-loading-text {
  color: #8300bf; 
}

>>> .flatmap-popup-popper .mapboxgl-popup-content {
  padding: 6px 4px;
  font-size:12px;
  color: rgb(48, 49, 51);
  background-color: #f3ecf6;
  border: 1px solid rgb(131, 0, 191);
  white-space: nowrap;
  min-width: unset;
}

>>>.flatmap-popper.left-popper .popper__arrow{
  border-left-color: #8300bf !important;
}

>>>.flatmap-popper.left-popper .popper__arrow:after{
  border-left-color: #f3ecf6 !important;
}

>>>.flatmap-popper.right-popper .popper__arrow{
  border-right-color: #8300bf !important;
}

>>>.flatmap-popper.right-popper .popper__arrow:after{
  border-right-color: #f3ecf6 !important;
}

>>>.flatmap-popper.el-popper[x-placement^="top"] .popper__arrow {
  border-top-color:#8300bf !important;
}

>>>.flatmap-popper.el-popper[x-placement^="top"] .popper__arrow:after{
  border-top-color: #f3ecf6 !important;
}

>>>.popper-zoomout {
  padding-right:13px!important;
  left:-21px!important;
}

>>>.popper-zoomout .popper__arrow{
  left:53px!important;
}

>>> .flatmap-popup-popper .mapboxgl-popup-content .mapboxgl-popup-close-button {
  display: none;
}

>>> .mapboxgl-popup-content {
  padding: 0px;
}

>>> .flatmap-popup-popper .mapboxgl-popup-tip {
  border-bottom-color: #8300bf;  
}

.bottom-right-control {
  position:absolute;
  right:16px;
  bottom:16px;
}

>>> .my-drawer {
  background: rgba(0,0,0,0);
  box-shadow: none;
}

.drawer >>> .el-drawer:focus{
  outline:none;
}

.open-drawer{
  width: 20px;
  height: 40px;
  z-index: 8;
  position: absolute;
  left: 0px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
  border: solid 1px #e4e7ed;
  background-color: #F7FAFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.drawer-button {
  float: left;
  width: 20px;
  height: 40px;
  z-index: 8;
  margin-top:calc(50% - 36px);
  border: solid 1px #e4e7ed;
  border-left: 0;
  background-color: #FFFFFF;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  pointer-events: auto;
}

.drawer-button i{
  margin-top:12px;
  color: #8300bf;
  transition-delay: 0.9s;
}

.drawer-button.open i{
  transform: rotate(0deg) scaleY(2.5);
}

.drawer-button.close i{
  transform: rotate(180deg) scaleY(2.5);
}

>>>.mapboxgl-canvas-container canvas {
  outline:none;
}

.backgroundSpacer {
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.flatmap-radio >>> label{
  margin-right:20px;
}

.flatmap-radio >>> label:last-child{
  margin-right:0px;
}

.flatmap-radio >>> .el-radio__input.is-checked+.el-radio__label {
  color: #8300bf;
}

.flatmap-radio >>> .el-radio__input.is-checked .el-radio__inner {
  border-color: #8300bf;
  background: #8300bf;
}

</style>

<style scoped src="../styles/purple/checkbox.css">
</style>
<style scoped src="../styles/purple/checkbox-group.css">
</style>
<style scoped src="../styles/purple/row.css">
</style>
<style scoped src="../styles/purple/button.css">
</style>
<style scoped src="../styles/purple/loading.css">
</style>