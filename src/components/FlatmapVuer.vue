<template>
  <div
    class="flatmap-container"
    ref="flatmapContainer"
    v-loading="loading"
    element-loading-text="Loading..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <map-svg-sprite-color />
    <div
      style="height: 100%; width: 100%; position: relative; overflow-y: none"
    >
      <div style="height: 100%; width: 100%" ref="display"></div>
      <div class="beta-popovers">
        <div>
          <el-popover
            placement="right"
            :appendToBody="false"
            trigger="manual"
            popper-class="warning-popper flatmap-popper right-popper"
            v-model="hoverVisibilities[6].value"
            ref="warningPopover"
          >
            <p
              v-if="isLegacy"
              @mouseover="showToolitip(6)"
              @mouseout="hideToolitip(6)"
            >
              This is a legacy map, you may view the latest map instead.
            </p>
            <p
              v-else-if="isFC"
              @mouseover="showToolitip(6)"
              @mouseout="hideToolitip(6)"
            >
              This map displays the connectivity of individual neurons.
              Specifically, those which align with (parts of) the neuron
              populations from the
              <a
                href="https://sparc.science/resources/1ZUKXU2YmLcn2reCyXjlew"
                target="_blank"
              >
                ApiNATOMY
              </a>
              models available in
              <a
                href="https://sparc.science/resources/6eg3VpJbwQR4B84CjrvmyD"
                target="_blank"
              >
                SCKAN </a
              >.
            </p>
            <p v-else @mouseover="showToolitip(6)" @mouseout="hideToolitip(6)">
              This map displays the connectivity of neuron populations.
              Specifically, those from the primarily rat-based
              <a
                href="https://sparc.science/resources/1ZUKXU2YmLcn2reCyXjlew"
                target="_blank"
              >
                ApiNATOMY
              </a>
              models available in
              <a
                href="https://sparc.science/resources/6eg3VpJbwQR4B84CjrvmyD"
                target="_blank"
              >
                SCKAN </a
              >. New connectivity and species specificity will be added as the
              SPARC program progresses.
            </p>
          </el-popover>
          <i
            class="el-icon-warning warning-icon"
            v-if="displayWarning"
            @mouseover="showToolitip(6)"
            @mouseout="hideToolitip(6)"
            v-popover:warningPopover
          >
            <template v-if="isLegacy">
              <span class="warning-text">Legacy Map</span>
              <div class="latest-map-text" @click="viewLatestMap">
                Click here for the latest map
              </div>
            </template>
            <template v-else>
              <span class="warning-text">Beta</span>
            </template>
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

      <!-- The element below is placed onto the flatmap when it is ready -->
      <i
        class="el-icon-arrow-down minimap-resize"
        :class="{ enlarge: minimapSmall, shrink: !minimapSmall }"
        ref="minimapResize"
        v-show="minimapResizeShow"
        @click="closeMinimap"
      ></i>

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
            <br />
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
      <div
        class="pathway-location"
        :class="{ open: drawerOpen, close: !drawerOpen }"
      >
        <div
          class="pathway-container"
          :class="{ open: drawerOpen, close: !drawerOpen }"
          :style="{ 'max-height' : pathwaysMaxHeight + 'px' }"
          v-if="pathControls"
          v-popover:checkBoxPopover
        >
          <svg-legends v-if="!isFC" class="svg-legends-container" />
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
          <tree-controls
            v-if="isFC && systems && systems.length > 0"
            :active="currentActive"
            :hover="currentHover"
            :tree-data="systems"
            ref="treeControls"
            @changed="systemSelected"
            @checkAll="checkAllSystems"
            @change-active="ftuSelected"
          />
          <selections-group
            v-if="!isFC && centreLines && centreLines.length > 0"
            title="Nerves"
            labelKey="label"
            identifierKey="key"
            :selections="centreLines"
            @changed="centreLinesSelected"
            ref="centrelinesSelection"
            key="centrelinesSelection"
          />
          <!--
          <selections-group
            v-if="isFC && sckanDisplay && sckanDisplay.length > 0"
            title="SCKAN"
            labelKey="label"
            identifierKey="key"
            :selections="sckanDisplay"
            @changed="sckanSelected"
            @checkAll="checkAllSCKAN"
            ref="skcanSelection"
            key="skcanSelection"
          />
          <selections-group
            v-if="layers && layers.length > 0"
            title="Layers"
            labelKey="description"
            identifierKey="id"
            :selections="layers"
            @changed="layersSelected"
            @checkAll="checkAllLayers"
            ref="layersSelection"
            key="layersSelection"
          />
          -->
          <selections-group
            v-if="!isFC && taxonConnectivity && taxonConnectivity.length > 0"
            title="Observed in"
            labelKey="label"
            identifierKey="taxon"
            :selections="taxonConnectivity"
            @changed="taxonsSelected"
            @checkAll="checkAllTaxons"
            ref="taxonSelection"
            key="taxonSelection"
          />
          <selections-group
            v-if="pathways && pathways.length > 0"
            title="Pathways"
            labelKey="label"
            identifierKey="type"
            colourStyle="line"
            :selections="pathways"
            @changed="pathwaysSelected"
            @checkAll="checkAllPathways"
            ref="pathwaysSelection"
            key="pathwaysSelection"
          />
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
        ref="open-map-popover"
        placement="top-start"
        width="128"
        :append-to-body="false"
        trigger="click"
        popper-class="open-map-popper non-selectable"
      >
        <el-row v-for="item in openMapOptions" :key="item.key">
          <el-button type="primary" plain @click="$emit('open-map', item.key)">
            {{ item.display }}
          </el-button>
        </el-row>
      </el-popover>
      <el-popover
        ref="backgroundPopover"
        placement="top-start"
        width="175"
        :appendToBody="false"
        trigger="click"
        popper-class="background-popper"
      >
        <el-row class="backgroundText">Viewing Mode</el-row>
        <el-row class="backgroundControl">
          <el-select
            :popper-append-to-body="false"
            v-model="viewingMode"
            placeholder="Select"
            class="select-box"
            popper-class="flatmap_dropdown"
          >
            <el-option
              v-for="item in viewingModes"
              :key="item"
              :label="item"
              :value="item"
            >
              <el-row>
                <el-col :span="12">{{ item }}</el-col>
              </el-row>
            </el-option>
          </el-select>
        </el-row>
        <el-row class="backgroundSpacer"></el-row>
        <el-row class="backgroundText">Organs display</el-row>
        <el-row class="backgroundControl">
          <el-radio-group
            v-model="colourRadio"
            class="flatmap-radio"
            @change="setColour"
          >
            <el-radio :label="true">Colour</el-radio>
            <el-radio :label="false">Greyscale</el-radio>
          </el-radio-group>
        </el-row>
        <el-row class="backgroundSpacer"></el-row>
        <el-row class="backgroundText">Outlines display</el-row>
        <el-row class="backgroundControl">
          <el-radio-group
            v-model="outlinesRadio"
            class="flatmap-radio"
            @change="setOutlines"
          >
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
            :class="[
              'backgroundChoice',
              item,
              item == currentBackground ? 'active' : '',
            ]"
            @click="backgroundChangeCallback(item)"
          />
        </el-row>
      </el-popover>
      <div
        class="settings-group"
        :class="{ open: drawerOpen, close: !drawerOpen }"
      >
        <el-row>
          <el-popover
            v-model="hoverVisibilities[8].value"
            content="Open new map"
            placement="right"
            :append-to-body="false"
            trigger="manual"
            popper-class="flatmap-popper right-popper"
          >
            <map-svg-icon
              v-if="enableOpenMapUI && openMapOptions.length > 0"
              slot="reference"
              v-popover:open-map-popover
              icon="openMap"
              class="icon-button"
              @mouseover.native="showToolitip(8)"
              @mouseout.native="hideToolitip(8)"
            />
          </el-popover>
        </el-row>
        <el-row>
          <el-popover
            content="Change settings"
            placement="right"
            v-model="hoverVisibilities[3].value"
            :appendToBody="false"
            trigger="manual"
            popper-class="flatmap-popper right-popper"
          >
            <map-svg-icon
              v-popover:backgroundPopover
              icon="changeBckgd"
              class="icon-button"
              slot="reference"
              @mouseover.native="showToolitip(3)"
              @mouseout.native="hideToolitip(3)"
            />
          </el-popover>
        </el-row>
      </div>
      <Tooltip
        ref="tooltip"
        class="tooltip"
        :annotationEntry="annotationEntry"
        @highlightConnectedPaths="highlightConnectedPaths"
        @onClose="closeTooltip"
        :entry="tooltipEntry"
        :annotationDisplay="viewingMode === 'Annotation'"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import Tooltip from "./Tooltip";
import SelectionsGroup from "./SelectionsGroup";
import TreeControls from "./TreeControls";
import { MapSvgIcon, MapSvgSpriteColor } from "@abi-software/svg-sprite";
import SvgLegends from "./legends/SvgLegends";
import {
  Button,
  Col,
  Loading,
  Radio,
  RadioGroup,
  Row,
  Select,
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
import flatmapMarker from "../icons/flatmap-marker";
import {
  FlatmapQueries,
  findTaxonomyLabel,
} from "../services/flatmapQueries.js";

locale.use(lang);
Vue.use(Button);
Vue.use(Col);
Vue.use(Loading.directive);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Row);
Vue.use(Select);
const ResizeSensor = require("css-element-queries/src/ResizeSensor");

const processTaxon = (flatmapAPI, taxonIdentifiers) => {
  let processed = [];
  taxonIdentifiers.forEach((taxon) => {
    findTaxonomyLabel(flatmapAPI, taxon).then((value) => {
      const item = { taxon, label: value };
      processed.push(item);
    });
  });

  return processed;
};

const processFTUs = (parent, key) => {
  const ftus = [];
  let items = parent.organs ? parent.organs : parent.ftus;
  const children = items
    ? items.filter(
        (obj, index) =>
          items.findIndex((item) => item.label === obj.label) === index
      )
    : undefined;
  if (children) {
    children.forEach((child) => {
      const data = {
        label: child.label,
        models: child.models,
        key: `${key}.${child.label}`,
      };
      const grandChildren = processFTUs(child, data.key);
      if (grandChildren.length > 0) {
        data.children = grandChildren;
      }
      ftus.push(data);
    });
  }
  return ftus;
};

const processSystems = (systems) => {
  const allSystems = [];
  if (systems && systems.length > 0) {
    const data = { label: "All", key: "All", children: [] };
    systems.forEach((system) => {
      const child = {
        colour: system.colour,
        enabled: system.enabled,
        label: system.id,
        key: system.id,
      };
      const children = processFTUs(system, child.key);
      if (children.length > 0) child.children = children;
      data.children.push(child);
    });

    allSystems.push(data);
  }

  return allSystems;
};

const createUnfilledTooltipData = function () {
  return {
    destinations: [],
    origins: [],
    components: [],
    destinationsWithDatasets: [],
    originsWithDatasets: [],
    componentsWithDatasets: [],
    resource: undefined,
  };
};

export default {
  name: "FlatmapVuer",
  components: {
    MapSvgIcon,
    MapSvgSpriteColor,
    Tooltip,
    TreeControls,
    SelectionsGroup,
    SvgLegends,
  },
  beforeCreate: function () {
    this.mapManager = undefined;
    this.mapImp = undefined;
    //The state watcher may triggered before
    //created causing issue, This flag will
    //resolve this issue.
    this.setStateRequired = false;
  },
  methods: {
    viewLatestMap: function () {
      let biologicalSex = this.biologicalSex ? this.biologicalSex : undefined;
      //Human requires special handling
      if (this.entry === "NCBITaxon:9606") {
        biologicalSex = "PATO:0000384";
      }
      const state = {
        entry: this.entry,
        biologicalSex,
        viewport: this.mapImp.getState(),
      };
      this.$emit("view-latest-map", state);
    },
    backgroundChangeCallback: function (colour) {
      this.currentBackground = colour;
      if (this.mapImp) {
        this.mapImp.setBackgroundColour(this.currentBackground, 1);
      }
    },
    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen;
    },
    /**
     * Function to toggle colour/greyscale of organs.
     */
    setColour: function (flag) {
      this.colourRadio = flag;
      if (this.mapImp) {
        this.mapImp.setColour({ colour: flag, outline: this.outlinesRadio });
      }
    },
    /**
     * Function to toggle outlines f organs.
     */
    setOutlines: function (flag) {
      this.outlineRadio = flag;
      if (this.mapImp) {
        this.mapImp.setColour({ colour: this.colourRadio, outline: flag });
      }
    },
    /**
     * Function to toggle paths to default.
     * Also called when the associated button is pressed.
     */
    resetView: function () {
      if (this.mapImp) {
        this.mapImp.resetMap();
        if (this.$refs.centrelinesSelection) {
          this.$refs.centrelinesSelection.reset();
        }
        if (this.$refs.skcanSelection) {
          this.$refs.skcanSelection.reset();
        }
        if (this.$refs.layersSelection) {
          this.$refs.layersSelection.reset();
        }
        if (this.$refs.systemsSelection) {
          this.$refs.pathwaysSelection.reset();
        }
        if (this.$refs.pathwaysSelection) {
          this.$refs.pathwaysSelection.reset();
        }
      }
    },
    /**
     * Function to zoom in.
     * Also called when the associated button is pressed.
     */
    zoomIn: function () {
      if (this.mapImp) {
        this.mapImp.zoomIn();
      }
    },
    /**
     * Function to zoom out.
     * Also called when the associated button is pressed.
     */
    zoomOut: function () {
      if (this.mapImp) {
        this.mapImp.zoomOut();
      }
    },
    centreLinesSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableCentrelines(payload.value);
      }
    },
    sckanSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableSckanPath(payload.key, payload.value);
      }
    },
    checkAllSCKAN: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enableSckanPath(key, payload.value));
      }
    },
    highlightConnectedPaths: function (payload) {
      if (this.mapImp) {
        let paths = [...this.mapImp.pathModelNodes(payload)];
        // The line below matches the paths to the annIdToFeatureId map to get the feature ids

        let pathFeatures = paths.map(p=>this.mapImp.featureProperties(p));
        let toHighlight = [];
        pathFeatures.forEach(p=>{
          this.mapImp.nodePathModels(p.featureId).forEach(f=>{
            toHighlight.push(f);
          })
        })
        // display connected paths
        this.mapImp.zoomToFeatures(toHighlight, {noZoomIn: true});
      }
    },
    systemSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableSystem(payload.key, payload.value);
      }
    },
    checkAllSystems: function (flag) {
      if (this.mapImp) {
        this.systems[0].children.forEach((key) =>
          this.mapImp.enableSystem(key.label, flag)
        );
      }
    },
    ftuSelected: function (models) {
      this.searchAndShowResult(models, true);
    },
    layersSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableLayer(payload.key, payload.value);
      }
    },
    checkAllLayers: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enableLayer(key, payload.value)
        );
      }
    },
    taxonsSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableConnectivityByTaxonIds(payload.key, payload.value);
      }
    },
    checkAllTaxons: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enableConnectivityByTaxonIds(key, payload.value)
        );
      }
    },
    pathwaysSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enablePath(payload.key, payload.value);
      }
    },
    checkAllPathways: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enablePath(key, payload.value)
        );
      }
    },
    enablePanZoomEvents: function (flag) {
      this.mapImp.enablePanZoomEvents(flag);
    },
    eventCallback: function () {
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
            eventType: eventType,
            provenanceTaxonomy: data.taxons
              ? JSON.parse(data.taxons)
              : undefined,
          };
          if (eventType === "click") {
            if (this.viewingMode === "Network Discovery") {
              this.highlightConnectedPaths([data.models]);
            } else {
              this.currentActive = data.models ? data.models : "";
            }
          } else if (eventType === "mouseenter" && 
          !(this.viewingMode === "Network Discovery")) {
            this.currentHover = data.models ? data.models : "";
          }
          if (
            data &&
            data.type !== "marker" &&
            eventType === "click" &&
            !(this.viewingMode === "Network Discovery")
          ) {
            this.checkAndCreatePopups(payload);
          }
          this.$emit("resource-selected", payload);
        } else {
          this.$emit("pan-zoom-callback", data);
        }
      };
    },
    // checkNeuronClicked shows a neuron path pop up if a path was recently clicked
    checkAndCreatePopups: async function (data) {
      // Call flatmap database to get the connection data
      if (this.viewingMode  === "Annotation") {
        if (data.feature && data.feature.featureId && data.feature.models) {
          this.annotationEntry = { ...data.feature, resourceId: this.serverUUID };
          this.displayTooltip(data.feature.models);
        } else {
          this.annotation = {};
        }
      } else {
        let results =
          await this.flatmapQueries.retrieveFlatmapKnowledgeForEvent(data);
        // The line below only creates the tooltip if some data was found on the path
        // result 0 is the connection, result 1 is the pubmed results from flatmap
        if (
          results[0] ||
          results[1] ||
          (data.feature.hyperlinks && data.feature.hyperlinks.length > 0)
        ) {
          this.resourceForTooltip = data.resource[0];
          data.resourceForTooltip = this.resourceForTooltip;
          this.createTooltipFromNeuronCuration(data);
        }
      }
    },
    popUpCssHacks: function () {
      // Below is a hack to remove flatmap tooltips while popup is open
      let ftooltip = document.querySelector(".flatmap-tooltip-popup");
      if (ftooltip) ftooltip.style.display = "none";
      document.querySelector(".maplibregl-popup-close-button").style.display =
        "block";
      this.$refs.tooltip.$el.style.display = "flex";
      document.querySelector(".maplibregl-popup-close-button").onclick = () => {
        document.querySelector(".flatmap-tooltip-popup").style.display =
          "block";
      };
    },
    closeTooltip: function () {
      this.$refs.tooltip.$el.style.display = "none";
      document.querySelectorAll(".maplibregl-popup").forEach((item) => {
        item.style.display = "none";
      });
    },
    createTooltipFromNeuronCuration: async function (data) {
      this.tooltipEntry = await this.flatmapQueries.createTooltipData(data);
      this.displayTooltip(data.resource[0]);
    },
    // Keeping this as an API
    showPopup: function (featureId, node, options) {
      let myOptions = options;
      if (this.mapImp) {
        if (myOptions) {
          if (!myOptions.className) myOptions.className = "custom-popup";
        } else {
          myOptions = { className: "custom-popup", positionAtLastClick: true };
        }
        this.mapImp.showPopup(featureId, node, myOptions);
      }
    },
    showMarkerPopup: function (featureId, node, options) {
      if (this.mapImp) {
        this.mapImp.showMarkerPopup(featureId, node, options);
      }
    },
    closeMinimap: function () {
      let minimapEl = this.$refs.flatmapContainer.querySelector(
        ".maplibregl-ctrl-minimap"
      ); // find minimap
      if (this.minimapSmall) {
        //switch the classes on the minimap
        minimapEl.classList.add("enlarge");
        minimapEl.classList.remove("shrink");
      } else {
        minimapEl.classList.add("shrink");
        minimapEl.classList.remove("enlarge");
      }
      this.minimapSmall = !this.minimapSmall;
    },
    addResizeButtonToMinimap: function () {
      let minimapEl = this.$refs.flatmapContainer.querySelector(
        ".maplibregl-ctrl-minimap"
      );
      if (minimapEl) {
        this.$refs.minimapResize.parentNode.removeChild(
          this.$refs.minimapResize
        );
        minimapEl.appendChild(this.$refs.minimapResize);
        this.minimapResizeShow = true;
      }
    },
    setHelpMode: function (helpMode) {
      if (helpMode) {
        this.inHelp = true;
        this.hoverVisibilities.forEach((item) => {
          item.value = true;
        });
        this.openFlatmapHelpPopup();
      } else {
        this.inHelp = false;
        this.hoverVisibilities.forEach((item) => {
          item.value = false;
        });
        this.closeFlatmapHelpPopup();
      }
    },
    showToolitip: function (tooltipNumber) {
      if (!this.inHelp) {
        clearTimeout(this.tooltipWait[tooltipNumber]);
        this.tooltipWait[tooltipNumber] = setTimeout(() => {
          this.hoverVisibilities[tooltipNumber].value = true;
        }, 500);
      }
    },
    hideToolitip: function (tooltipNumber) {
      if (!this.inHelp) {
        clearTimeout(this.tooltipWait[tooltipNumber]);
        this.tooltipWait[tooltipNumber] = setTimeout(() => {
          this.hoverVisibilities[tooltipNumber].value = false;
        }, 500);
      }
    },
    displayTooltip: function (feature) {
      this.mapImp.showPopup(
        this.mapImp.modelFeatureIds(feature)[0],
        this.$refs.tooltip.$el,
        { className: "flatmapvuer-popover", positionAtLastClick: true }
      );
      this.popUpCssHacks();
    },
    openFlatmapHelpPopup: function () {
      if (this.mapImp) {
        let heartId = this.mapImp.featureIdsForModel("UBERON:0000948")[0];
        const elm = "Click for more information";
        this.mapImp.showPopup(heartId, elm, {
          anchor: "top",
          className: "flatmap-popup-popper",
        });
      }
    },
    closeFlatmapHelpPopup: function () {
      this.$el
        .querySelectorAll(".maplibregl-popup-close-button")
        .forEach((item) => {
          item.click();
        });
    },
    getLabels: function () {
      let labels = [];
      if (this.mapImp) {
        let annotations = this.mapImp.annotations;
        for (let value of annotations.values()) {
          if (value.label) labels.push(value.label);
        }
        return Array.from(new Set(labels));
      }
    },
    getState: function () {
      if (this.mapImp) {
        let state = {
          entry: this.entry,
          viewport: this.mapImp.getState(),
        };
        const identifier = this.mapImp.getIdentifier();
        if (this.biologicalSex) state["biologicalSex"] = this.biologicalSex;
        else if (identifier && identifier.biologicalSex)
          state["biologicalSex"] = identifier.biologicalSex;
        if (identifier && identifier.uuid) state["uuid"] = identifier.uuid;
        return state;
      }
      return undefined;
    },
    setState: function (state) {
      if (state) {
        if (
          this.mapImp &&
          state.entry &&
          this.entry == state.entry &&
          (!state.biologicalSex || state.biologicalSex === this.biologicalSex)
        ) {
          if (state.viewport) {
            this.mapImp.setState(state.viewport);
          }
        } else {
          this.createFlatmap(state);
        }
        this.setStateRequired = false;
      }
    },
    restoreMapState: function (state) {
      if (state) {
        if (state.viewport) this.mapImp.setState(state.viewport);
        if (state.searchTerm) this.searchAndShowResult(state.searchTerm, true);
      }
    },
    createFlatmap: function (state) {
      if (!this.mapImp && !this.loading) {
        this.loading = true;
        let minimap = false;
        if (this.displayMinimap) {
          minimap = { position: "top-right" };
        }

        //As for flatmap-viewer@2.2.7, see below for the documentation
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
        if (this.uuid) {
          identifier.uuid = this.uuid;
        }
        //This now handle the uses of uuid when resuming states
        if (state) {
          if (state.uuid) {
            identifier = { uuid: state.uuid };
          } else if (state.entry) {
            identifier.taxon = state.entry;
            if (state.biologicalSex) {
              identifier["biologicalSex"] = state.biologicalSex;
            } else if (identifier.taxon === "NCBITaxon:9606") {
              //For backward compatibility
              identifier["biologicalSex"] = "PATO:0000384";
            }
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
            layerControl: true,
            pathControls: true,
            searchable: this.searchable,
            tooltips: this.tooltips,
            minimap: minimap,
          }
        );
        promise1.then((returnedObject) => {
          this.mapImp = returnedObject;
          this.serverUUID = this.mapImp.getIdentifier().uuid;
          this.onFlatmapReady();
          if (this._stateToBeSet) this.restoreMapState(this._stateToBeSet);
          else {
            this.restoreMapState(state);
          }
        });
      } else if (state) {
        this._stateToBeSet = {
          viewport: state.viewport,
          searchTerm: state.searchTerm,
        };
        if (this.mapImp && !this.loading)
          this.restoreMapState(this._stateToBeSet);
      }
    },
    computePathControlsMaximumHeight() {
      const elem = this.$refs.display;
      if (elem) {
        const computed = getComputedStyle(elem);
        const padding =
          parseInt(computed.paddingTop) + parseInt(computed.paddingBottom);
        const height = elem.clientHeight - padding;
        this.pathwaysMaxHeight = height - 170;
      }
    },
    mapResize: function () {
      try {
        this.computePathControlsMaximumHeight();
        if (this.mapImp) {
          this.mapImp.resize();
          this.showMinimap(this.displayMinimap);
          if (this.mapImp._minimap) {
            this.mapImp._minimap.resize();
          }
        }
      } catch {
        console.error("Map resize error");
      }
    },
    onFlatmapReady: function () {
      // onFlatmapReady is used for functions that need to run immediately after the flatmap is loaded
      this.sensor = new ResizeSensor(this.$refs.display, this.mapResize);
      if (this.mapImp.options && this.mapImp.options.style === "functional") {
        this.isFC = true;
      }
      this.mapImp.setBackgroundOpacity(1);
      this.backgroundChangeCallback(this.currentBackground);
      this.pathways = this.mapImp.pathTypes();
      this.mapImp.enableCentrelines(false);
      //Disable layers for now
      //this.layers = this.mapImp.getLayers();
      this.systems = processSystems(this.mapImp.getSystems());
      this.taxonConnectivity = processTaxon(
        this.flatmapAPI,
        this.mapImp.taxonIdentifiers
      );
      this.addResizeButtonToMinimap();
      this.loading = false;
      this.computePathControlsMaximumHeight();
      this.drawerOpen = true;
      this.mapResize();
      this.$emit("ready", this);
    },
    showMinimap: function (flag) {
      if (this.mapImp) this.mapImp.showMinimap(flag);
    },
    showPathwaysDrawer: function (flag) {
      this.drawerOpen = flag;
    },
    /**
     * Function to display features with annotation matching the provided term,
     * with the option to display the label using displayLabel flag.
     */
    searchAndShowResult: function (term, displayLabel) {
      if (this.mapImp) {
        if (term === undefined || term === "") {
          this.mapImp.clearSearchResults();
          return true;
        } else {
          const searchResults = this.mapImp.search(term);
          if (
            searchResults &&
            searchResults.results &&
            searchResults.results.length > 0
          ) {
            this.mapImp.showSearchResults(searchResults);
            if (
              displayLabel &&
              searchResults.results[0].featureId &&
              searchResults.results[0].text
            ) {
              const annotation = this.mapImp.annotation(
                searchResults.results[0].featureId
              );
              this.mapImp.showPopup(
                searchResults.results[0].featureId,
                annotation.label,
                {
                  className: "custom-popup",
                  positionAtLastClick: false,
                  preserveSelection: true,
                }
              );
            }
            return true;
          } else this.mapImp.clearSearchResults();
        }
      }
      return false;
    },
    /**
     * Get the list of suggested terms
     */
    searchSuggestions: function (term) {
      if (this.mapImp) return this.mapImp.search(term);
      return [];
    },
  },
  props: {
    entry: String,
    uuid: String,
    biologicalSex: {
      type: String,
      default: "",
    },
    featureInfo: {
      type: Boolean,
      default: false,
    },
    minZoom: {
      type: Number,
      default: 4,
    },
    pathControls: {
      type: Boolean,
      default: false,
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    layerControl: {
      type: Boolean,
      default: false,
    },
    tooltips: {
      type: Boolean,
      default: true,
    },
    helpMode: {
      type: Boolean,
      default: false,
    },
    renderAtMounted: {
      type: Boolean,
      default: true,
    },
    displayMinimap: {
      type: Boolean,
      default: false,
    },
    displayWarning: {
      type: Boolean,
      default: false,
    },
    /**
     * Flag to determine rather open map UI should be
     * presented or not.
     */
    enableOpenMapUI: {
      type: Boolean,
      default: false,
    },
    openMapOptions: {
      type: Array,
      default: function () {
        return [
          {
            display: "Open AC Map",
            key: "AC",
          },
          {
            display: "Open FC Map",
            key: "FC",
          },
          {
            display: "Open 3D Human Map",
            key: "3D",
          },
        ];
      },
    },
    isLegacy: {
      type: Boolean,
      default: false,
    },
    displayLatestChanges: {
      type: Boolean,
      default: false,
    },
    latestChangesMessage: {
      type: String,
      default:
        "'Observed In' controls and information are now included in AC maps. System control with FTU information has been added to the FC map.",
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
      default: "https://mapcore-demo.org/current/flatmap/v3/",
    },
    sparcAPI: {
      type: String,
      default: "https://api.sparc.science/",
    },
  },
  provide() {
    return {
      flatmapAPI: this.flatmapAPI,
      sparcAPI: this.sparcAPI,
    };
  },
  data: function () {
    return {
      annotationEntry: {},
      serverUUID: undefined,
      layers: [],
      pathways: [],
      sckanDisplay: [
        {
          label: "Display Path with SCKAN",
          key: "VALID",
        },
      ],
      centreLines: [
        {
          label: "Display Nerves",
          key: "centrelines",
          enabled: false,
        },
      ],
      systems: [],
      taxonConnectivity: [],
      pathwaysMaxHeight: 1000,
      hoverVisibilities: [
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
      ],
      isFC: false,
      inHelp: false,
      currentBackground: "white",
      availableBackground: ["white", "lightskyblue", "black"],
      loading: false,
      flatmapMarker: flatmapMarker,
      tooltipEntry: createUnfilledTooltipData(),
      connectivityTooltipVisible: false,
      drawerOpen: false,
      annotationRadio: false,
      colourRadio: true,
      outlinesRadio: true,
      minimapResizeShow: false,
      minimapSmall: false,
      currentActive: "",
      currentHover: "",
      viewingMode: "Exploration",
      viewingModes: ["Annotation", "Exploration", "Network Discovery"],
    };
  },
  watch: {
    entry: function () {
      if (!this.state) this.createFlatmap();
    },
    helpMode: function (val) {
      this.setHelpMode(val);
    },
    state: {
      handler: function (state) {
        if (this.mapManager) {
          this.setState(state);
        } else {
          //this component has not been mounted yet
          this.setStateRequired = true;
        }
      },
      immediate: true,
      deep: true,
    },
  },
  mounted: function () {
    const flatmap = require("@abi-software/flatmap-viewer");
    this.tooltipWait = [];
    this.tooltipWait.length = this.hoverVisibilities.length;
    this.mapManager = new flatmap.MapManager(this.flatmapAPI);
    this.flatmapQueries = new FlatmapQueries();
    this.flatmapQueries.initialise(this.flatmapAPI);
    if (this.state) {
      //State is set and require to set the state
      if (this.setStateRequired) {
        this.setState(this.state);
      }
    } else if (this.renderAtMounted) {
      this.createFlatmap();
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/loading";
@import "~element-ui/packages/theme-chalk/src/row";
@import "~element-ui/packages/theme-chalk/src/select";

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

.latest-map-text {
  color: $app-primary-color;
  font-family: Asap, sans-serif;
  font-size: 12px;
  margin-top: 5px;
  vertical-align: 10px;
  cursor: pointer;
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
  width: 70%;
  height: auto;
  position: relative;
  max-height: 140px;
}

.pathway-container {
  float: left;
  padding-left: 16px;
  padding-right: 18px;
  text-align: left;
  overflow: auto;
  border: 1px solid rgb(220, 223, 230);
  padding-bottom: 16px;
  background: #ffffff;
  overflow-x: hidden;
  scrollbar-width: thin;

  transition: all 1s ease;
  &.open {
    opacity: 1;
  }
  &.close {
    opacity: 0;
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px #c0c4cc;
  }
}

.flatmap-marker-help {
  display: inline-block;
}

::v-deep .popper-bump-right {
  left: 30px;
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

::v-deep .maplibregl-popup {
  max-width: 300px !important;
}

::v-deep .flatmap-tooltip-popup {
  &.maplibregl-popup-anchor-bottom {
    .maplibregl-popup-content {
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
  &.maplibregl-popup-anchor-top {
    .maplibregl-popup-content {
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
  .maplibregl-popup-content {
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
  .maplibregl-popup-tip {
    display: none;
  }
}

::v-deep .maplibregl-popup {
  &.flatmap-marker-popup {
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    background: #fff;
  }
}

/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root),
::v-deep.flatmap-tooltip-popup {
  .maplibregl-popup-content::after {
    top: 99.9%;
  }
}

::v-deep .flatmap-tooltip-dialog {
  .maplibregl-popup-tip {
    display: none;
  }
}

::v-deep .flatmap-marker-popup {
  .maplibregl-popup-content {
    padding: 0px;
  }
}

::v-deep .flatmapvuer-popover {
  .maplibregl-popup-close-button {
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

.settings-group {
  bottom: 16px;
  position: absolute;
  transition: all 1s ease;
  &.open {
    left: 322px;
  }
  &.close {
    left: 24px;
  }
}

::v-deep .background-popper {
  padding: 5px 12px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  height: 270px;
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

::v-deep .open-map-popper {
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  width: 178px;
  min-width: 178px;

  .el-row ~ .el-row {
    margin-top: 8px;
  }

  .el-button {
    padding-top: 5px;
    padding-bottom: 5px;
  }

  &.el-popper[x-placement^="top"] {
    .popper__arrow {
      border-top-color: $app-primary-color !important;
      &:after {
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
  margin-top: 12px;
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

.icon-button {
  height: 24px !important;
  width: 24px !important;
  color: $app-primary-color;
  &:hover {
    cursor: pointer;
  }
}

::v-deep .maplibregl-ctrl-minimap {
  transform-origin: top right;
  @media (max-width: 1250px) {
    height: 125px !important; // important is needed here as we are over-riding the style set by the flatmap
    width: 180px !important;
    >>> .maplibregl-canvas .maplibregl-canvas {
      height: 125px !important;
      width: 180px !important;
    }
  }
  @media (min-width: 1251px) {
    height: 190px !important;
    width: 300px !important;
    >>> .maplibregl-canvas .maplibregl-canvas {
      height: 190px !important;
      width: 300px !important;
    }
  }
  transition: all 1s ease;
  &.shrink {
    transform: scale(0.5);
    transform: scale(0.5);
  }
}

.minimap-resize {
  position: absolute;
  pointer-events: all;
  cursor: pointer;
  top: 0;
  right: 0;
  padding-top: 3px; // needed as icon is offset
  width: 20px;
  height: 14px;
  z-index: 9;
  transition: all 1s ease;
  &.shrink {
    transform: rotate(0deg);
  }
  &.enlarge {
    transform: rotate(180deg) scale(2);
    padding-bottom: 5px; // note padding is added to the opposite side since it is rotated
    padding-left: 5px;
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
  .maplibregl-popup-tip {
    border-bottom-color: $app-primary-color;
  }
  .maplibregl-popup-content {
    padding: 6px 4px;
    font-size: 12px;
    color: rgb(48, 49, 51);
    background-color: #f3ecf6;
    border: 1px solid $app-primary-color;
    white-space: nowrap;
    min-width: unset;
    .maplibregl-popup-close-button {
      display: none;
    }
  }
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

::v-deep .maplibregl-popup-content {
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
  background-color: #f9f2fc;

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

::v-deep .maplibregl-canvas-container {
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
  ::v-deep .el-radio__input {
    &.is-checked {
      & + .el-radio__label {
        color: $app-primary-color;
      }
      .el-radio__inner {
        border-color: $app-primary-color;
        background: $app-primary-color;
      }
    }
    .el-radio__inner:hover {
      border-color: $app-primary-color;
    }
  }
}

::v-deep .custom-popup {
  .maplibregl-popup-tip {
    display: none;
  }
  .maplibregl-popup-content {
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    display: none;
    background: #fff;
    font-family: "Asap", sans-serif;
    font-size: 12pt;
    color: $app-primary-color;
    border: 1px solid $app-primary-color;
    padding-left: 6px;
    padding-right: 6px;
    padding-top: 6px;
    padding-bottom: 6px;
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
    .maplibregl-popup-close-button {
      display: none;
    }
  }
  &.maplibregl-popup-anchor-bottom {
    .maplibregl-popup-content {
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
  &.maplibregl-popup-anchor-top {
    .maplibregl-popup-content {
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
}

.select-box {
  border-radius: 4px;
  border: 1px solid rgb(144, 147, 153);
  background-color: var(--white);
  font-weight: 500;
  color: rgb(48, 49, 51);
  ::v-deep .el-input__inner {
    height: 30px;
    color: rgb(48, 49, 51);
  }
  ::v-deep .el-input__inner {
    &is-focus,
    &:focus {
      border: 1px solid $app-primary-color;
    }
  }
  ::v-deep .el-input__icon {
    line-height: 30px;
  }
}

::v-deep .flatmap_dropdown {
  min-width: 160px !important;
  .el-select-dropdown__item {
    white-space: nowrap;
    text-align: left;
    &.selected {
      color: $app-primary-color;
      font-weight: normal;
    }
  }
}
</style>

