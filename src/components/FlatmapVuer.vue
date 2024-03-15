<template>
  <div
    class="flatmap-container"
    ref="flatmapContainer"
    v-loading="loading"
    element-loading-text="Loading..."
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    <map-svg-sprite-color />
    <div
      style="height: 100%; width: 100%; position: relative; overflow-y: none"
    >
      <div style="height: 100%; width: 100%" ref="display"></div>
      <div class="beta-popovers" v-show="!disableUI">
        <div>
          <el-popover
            placement="right"
            popper-class="warning-popper flatmap-popper"
            :teleported="false"
            :visible="hoverVisibilities[6].value"
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
            <template #reference>
              <div
                class="warning-icon"
                v-if="displayWarning"
                @mouseover="showToolitip(6)"
                @mouseout="hideToolitip(6)"
              >
                <el-icon><el-icon-warning-filled /></el-icon>
                <template v-if="isLegacy">
                  <span class="warning-text">Legacy Map</span>
                  <div class="latest-map-text" @click="viewLatestMap">
                    Click here for the latest map
                  </div>
                </template>
                <template v-else>
                  <span class="warning-text">Beta</span>
                </template>
              </div>
            </template>
          </el-popover>
        </div>
        <el-popover
          placement="right"
          v-if="displayLatestChanges"
          :teleported="false"
          trigger="manual"
          popper-class="warning-popper flatmap-popper"
          :visible="hoverVisibilities[7].value"
        >
          <template #reference>
            <div
              class="latest-changesicon"
              v-if="displayLatestChanges"
              @mouseover="showToolitip(7)"
              @mouseout="hideToolitip(7)"
            >
              <el-icon><el-icon-warning-filled /></el-icon>
              <span class="warning-text">What's new?</span>
            </div>
          </template>
          <template #default>
            <b>Network discovery mode</b>
            <p>
              You can now view the network of neurons connected to a selected
              neuron. This mode is located in the settings at the bottom right.
              Once discovery mode is on, click on a neuron to see its
              connections.
            </p>
            <b>Now can display up to 6 panes</b>
            <p>
              You can now display up to 6 panes in the flatmap. This allows you
              to compare between different datasets and/or different views of
              the same dataset.
            </p>
          </template>
        </el-popover>
      </div>

      <!-- The element below is placed onto the flatmap when it is ready -->
      <el-icon
        class="minimap-resize"
        :class="{ enlarge: minimapSmall, shrink: !minimapSmall }"
        ref="minimapResize"
        v-show="minimapResizeShow"
        @click="closeMinimap"
      >
        <el-icon-arrow-down />
      </el-icon>

      <div class="bottom-draw-control"
        v-if="viewingMode === 'Annotation' && userInformation" 
        v-show="!disableUI">
        <el-popover
          content="Relevance"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[10].value"
        >
          <template #reference>
            <map-svg-icon
              icon="connection"
              class="icon-button connection"
              @click="displayRelevanceDialog(true)"
              @mouseover="showToolitip(10)"
              @mouseout="hideToolitip(10)"
              v-show="hasRelevance && !inDrawing"
            />
          </template>
        </el-popover>
        <el-popover
          content="Draw Point"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[11].value"
          v-if="drawnType !== 'LineString' && drawnType !== 'Polygon'"
        >
          <template #reference>
            <map-svg-icon
              icon="drawPoint"
              class="icon-button drawPoint"
              @click="drawnEvent('Point')"
              @mouseover="showToolitip(11)"
              @mouseout="hideToolitip(11)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Draw Line"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[12].value"
          v-if="drawnType !== 'Point' && drawnType !== 'Polygon'"
        >
          <template #reference>
            <map-svg-icon
              icon="drawLine"
              class="icon-button drawLineString"
              @click="drawnEvent('LineString')"
              @mouseover="showToolitip(12)"
              @mouseout="hideToolitip(12)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Draw Polygon"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[13].value"
          v-if="drawnType !== 'Point' && drawnType !== 'LineString'"
        >
          <template #reference>
            <map-svg-icon
              icon="drawPolygon"
              class="icon-button drawPolygon"
              @click="drawnEvent('Polygon')"
              @mouseover="showToolitip(13)"
              @mouseout="hideToolitip(13)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Delete"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[14].value"
        >
          <template #reference>
            <map-svg-icon
              icon="drawTrash"
              class="icon-button drawTrash"
              @click="drawnEvent('Delete')"
              @mouseover="showToolitip(14)"
              @mouseout="hideToolitip(14)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Edit"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="80"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[15].value"
        >
          <template #reference>
            <map-svg-icon
              icon="comment"
              class="icon-button comment"
              @click="drawnEvent('Edit')"
              @mouseover="showToolitip(15)"
              @mouseout="hideToolitip(15)"
            />
          </template>
        </el-popover>
      </div>

      <div class="bottom-right-control" v-show="!disableUI">
        <el-popover
          content="Zoom in"
          placement="left"
          :teleported="false"
          trigger="manual"
          width="70"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[0].value"
        >
          <template #reference>
            <map-svg-icon
              icon="zoomIn"
              class="icon-button zoomIn"
              @click="zoomIn()"
              @mouseover="showToolitip(0)"
              @mouseout="hideToolitip(0)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Zoom out"
          placement="top-end"
          :teleported="false"
          trigger="manual"
          width="70"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[1].value"
        >
          <template #reference>
            <map-svg-icon
              icon="zoomOut"
              class="icon-button zoomOut"
              @click="zoomOut()"
              @mouseover="showToolitip(1)"
              @mouseout="hideToolitip(1)"
            />
          </template>
        </el-popover>
        <el-popover
          content="Reset"
          placement="top"
          :teleported="false"
          trigger="manual"
          width="70"
          popper-class="flatmap-popper"
          :visible="hoverVisibilities[2].value"
        >
          <div>
            Fit to
            <br />
            window
          </div>
          <template #reference>
            <map-svg-icon
              icon="fitWindow"
              class="icon-button fitWindow"
              @click="resetView()"
              @mouseover="showToolitip(2)"
              @mouseout="hideToolitip(2)"
            />
          </template>
        </el-popover>
      </div>
      <el-popover
        content="Change pathway visibility"
        placement="right"
        :teleported="false"
        trigger="manual"
        popper-class="flatmap-popper"
        :visible="hoverVisibilities[4].value"
        ref="checkBoxPopover"
      >
        <template #reference>
          <div
            class="pathway-location"
            :class="{ open: drawerOpen, close: !drawerOpen }"
            v-show="!disableUI"
          >
            <div
              class="pathway-container"
              :class="{ open: drawerOpen, close: !drawerOpen }"
              :style="{ 'max-height': pathwaysMaxHeight + 'px' }"
              v-if="pathControls"
              v-popover:checkBoxPopover
            >
              <svg-legends v-if="!isFC" class="svg-legends-container" />
              <el-popover
                content="Location of the featured dataset"
                placement="right"
                :teleported="false"
                trigger="hover"
                popper-class="flatmap-popper popper-bump-right"
                :visible="hoverVisibilities[9].value"
                ref="featuredMarkerPopover"
              >
                <template #reference>
                  <div
                    v-show="showStarInLegend"
                    v-popover:featuredMarkerPopover
                    class="yellow-star-legend"
                    v-html="yellowstar"
                  ></div>
                </template>
              </el-popover>
              <!-- The line below places the yellowstar svg on the left, and the text "Featured markers on the right" with css so they are both centered in the div -->
              <el-popover
                content="Find these markers for data"
                placement="right"
                :teleported="false"
                trigger="manual"
                popper-class="flatmap-popper popper-bump-right"
                :visible="hoverVisibilities[5].value"
                ref="markerPopover"
              >
                <template #reference>
                  <div
                    v-show="hoverVisibilities[5].value"
                    class="flatmap-marker-help"
                    v-html="flatmapMarker"
                    v-popover:markerPopover
                  ></div>
                </template>
              </el-popover>
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
              <el-icon><el-icon-arrow-left /></el-icon>
            </div>
          </div>
        </template>
      </el-popover>
      <el-popover
        v-if="openMapRef"
        ref="open-map-popover"
        :virtual-ref="openMapRef"
        placement="top-start"
        width="136"
        :teleported="false"
        trigger="click"
        popper-class="open-map-popper non-selectable"
        virtual-triggering
      >
        <el-row v-for="item in openMapOptions" :key="item.key">
          <el-button type="primary" plain @click="$emit('open-map', item.key)">
            {{ item.display }}
          </el-button>
        </el-row>
      </el-popover>
      <el-popover
        ref="backgroundPopover"
        :virtual-ref="backgroundIconRef"
        placement="top-start"
        width="200"
        :teleported="false"
        trigger="click"
        popper-class="background-popper"
        virtual-triggering
      >
        <div>
          <el-row class="backgroundText">Viewing Mode</el-row>
          <el-row class="backgroundControl">
            <el-select
              :teleported="false"
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
          <template v-if="viewingMode === 'Annotation' && userInformation">
            <el-row class="backgroundText">Drawn By*</el-row>
            <el-row class="backgroundControl">
              <el-select
                :teleported="false"
                v-model="drawnType"
                placeholder="Select"
                class="select-box"
                popper-class="flatmap_dropdown"
                @change="setDrawnType"
              >
                <el-option
                  v-for="item in drawnTypes"
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
            <el-row class="backgroundText">Annotated By*</el-row>
            <el-row class="backgroundControl">
              <el-select
                :teleported="false"
                v-model="annotatedType"
                placeholder="Select"
                class="select-box"
                popper-class="flatmap_dropdown"
                @change="setAnnotatedType"
              >
                <el-option
                  v-for="item in annotatedTypes"
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
          </template>
          <el-row class="backgroundSpacer"></el-row>
          <el-row class="backgroundText">Dimension display</el-row>
          <el-row class="backgroundControl">
            <el-radio-group
              v-model="dimensionRadio"
              class="flatmap-radio"
              @change="setDimension"
            >
            <el-radio :label="false">2D</el-radio>
            <el-radio :label="true">3D</el-radio>
            </el-radio-group>
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
        </div>
      </el-popover>
      <div
        class="settings-group"
        :class="{ open: drawerOpen, close: !drawerOpen }"
        v-show="!disableUI"
      >
        <el-row>
          <el-popover
            :visible="hoverVisibilities[8].value"
            content="Open new map"
            placement="right"
            :teleported="false"
            popper-class="flatmap-popper"
          >
            <template #reference>
              <map-svg-icon
                v-if="enableOpenMapUI && openMapOptions.length > 0"
                ref="openMapRef"
                icon="openMap"
                class="icon-button open-map-button"
                @mouseover="showToolitip(8)"
                @mouseout="hideToolitip(8)"
              />
            </template>
          </el-popover>
        </el-row>
        <el-row>
          <el-popover
            content="Change settings"
            placement="right"
            :visible="hoverVisibilities[3].value"
            :teleported="false"
            trigger="manual"
            popper-class="flatmap-popper"
          >
            <template #reference>
              <map-svg-icon
                ref="backgroundIconRef"
                icon="changeBckgd"
                class="icon-button"
                @mouseover="showToolitip(3)"
                @mouseout="hideToolitip(3)"
              />
            </template>
          </el-popover>
        </el-row>
      </div>
      <Tooltip
        ref="tooltip"
        class="tooltip"
        v-show="tooltipDisplay"
        :annotationEntry="annotationEntry"
        :entry="tooltipEntry"
        :annotationDisplay="viewingMode === 'Annotation'"
        @annotation="commitAnnotationEvent"
      />
      <el-dialog
        v-model="relevanceDisplay"
        width="200"
        :modal="false"
        :show-close="false"
        :lock-scroll="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :teleported="false"
        draggable
      >
        <template #header v-if="inDrawing">
          <span class="dialog-title">Finalise drawing</span>
        </template>
        <template #header v-else>
          <el-button type="primary" plain @click="displayRelevanceDialog(false)">
            Close
          </el-button>
        </template>
        <el-row v-if="inDrawing">
          <el-col :span="13">
            <el-button type="primary" plain @click="confirmDrawnFeature">
              Confirm
            </el-button>
          </el-col>
          <el-col :span="11">
            <el-button type="primary" plain @click="cancelDrawnFeature">
              Cancel
            </el-button>
          </el-col>
        </el-row>
        <el-row v-if="hasRelevance">
          <el-col :span="20">
            <b><span>Related Features</span></b>
          </el-col>
          <el-col :span="4">
            <el-icon><el-icon-circle-close @click="closePopup()"/></el-icon>
          </el-col>
          <el-card
            shadow="hover"
            v-for="(value, key) in relevanceEntry" 
            :key="key"
            @click="displayRelevanceTooltip(value)"
          >
            <span>{{ key }}</span>
          </el-card>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { shallowRef, markRaw } from 'vue'
import {
  WarningFilled as ElIconWarningFilled,
  ArrowDown as ElIconArrowDown,
  ArrowLeft as ElIconArrowLeft,
  CircleClose as ElIconCircleClose,
} from '@element-plus/icons-vue'
import Tooltip from './Tooltip.vue'
import SelectionsGroup from './SelectionsGroup.vue'
import TreeControls from './TreeControls.vue'
import { MapSvgIcon, MapSvgSpriteColor } from '@abi-software/svg-sprite'
import '@abi-software/svg-sprite/dist/style.css'
import SvgLegends from './legends/SvgLegends.vue'
import {
  ElButton as Button,
  ElCol as Col,
  ElLoading as Loading,
  ElRadio as Radio,
  ElRadioGroup as RadioGroup,
  ElRow as Row,
  ElSelect as Select,
  ElDialog as Dialog,
} from 'element-plus'
import flatmapMarker from '../icons/flatmap-marker'
import {
  FlatmapQueries,
  findTaxonomyLabel,
} from '../services/flatmapQueries.js'
import yellowstar from '../icons/yellowstar'
import ResizeSensor from 'css-element-queries/src/ResizeSensor'
import * as flatmap from '@abi-software/flatmap-viewer'
import { AnnotationService } from '@abi-software/sparc-annotation'

const centroid = (geometry) => {
  let featureGeometry = {
    lng: 0,
    lat: 0,
  }
  let coordinates
  if (geometry.type === "Polygon") {
    coordinates = geometry.coordinates[0]
  } else {
    coordinates = geometry.coordinates
  }
  if (!(geometry.type === 'Point')) {
    coordinates.map((coor) => {
      featureGeometry.lng += parseFloat(coor[0])
      featureGeometry.lat += parseFloat(coor[1])
    })
    featureGeometry.lng = featureGeometry.lng / coordinates.length
    featureGeometry.lat = featureGeometry.lat / coordinates.length
  } else {
    featureGeometry.lng += parseFloat(coordinates[0])
    featureGeometry.lat += parseFloat(coordinates[1])
  }
  return featureGeometry
}

const processFTUs = (parent, key) => {
  const ftus = []
  let items = parent.organs ? parent.organs : parent.ftus
  const children = items
    ? items.filter(
        (obj, index) =>
          items.findIndex((item) => item.label === obj.label) === index
      )
    : undefined
  if (children) {
    children.forEach((child) => {
      const data = {
        label: child.label,
        models: child.models,
        key: `${key}.${child.label}`,
      }
      const grandChildren = processFTUs(child, data.key)
      if (grandChildren.length > 0) {
        data.children = grandChildren
      }
      ftus.push(data)
    })
  }
  return ftus
}

const processSystems = (systems) => {
  const allSystems = []
  if (systems && systems.length > 0) {
    const data = { label: 'All', key: 'All', children: [] }
    systems.forEach((system) => {
      const child = {
        colour: system.colour,
        enabled: system.enabled,
        label: system.id,
        key: system.id,
      }
      const children = processFTUs(system, child.key)
      if (children.length > 0) child.children = children
      data.children.push(child)
    })

    allSystems.push(data)
  }

  return allSystems
}

const createUnfilledTooltipData = function () {
  return {
    destinations: [],
    origins: [],
    components: [],
    destinationsWithDatasets: [],
    originsWithDatasets: [],
    componentsWithDatasets: [],
    resource: undefined,
  }
}

export default {
  name: 'FlatmapVuer',
  components: {
    Button,
    Col,
    Loading,
    Radio,
    RadioGroup,
    Row,
    Select,
    Dialog,
    MapSvgIcon,
    MapSvgSpriteColor,
    Tooltip,
    TreeControls,
    SelectionsGroup,
    SvgLegends,
    ElIconWarningFilled,
    ElIconArrowDown,
    ElIconArrowLeft,
  },
  beforeCreate: function () {
    this.mapManager = undefined
    this.mapImp = undefined
    //The state watcher may triggered before
    //created causing issue, This flag will
    //resolve this issue.
    this.setStateRequired = false
  },
  setup(props) {
    const annotator = markRaw(new AnnotationService(`${props.flatmapAPI}annotator`));
    return { annotator }
  },
  methods: {
    displayRelevanceTooltip: function (value) {
      if (this.mapImp) {
        this.checkAndCreatePopups(value)
      }
    },
    // This should be called when create is confirmed or cancelled
    initialiseDraw: function () {
      this.inDrawing = false
      this.relevanceDisplay = false
      this.relevanceEntry = {}
      this.activeDrawTool = undefined
      this.createdEvent = undefined
      this.setActiveDrawIcon()
    },
    cancelDrawnFeature: function () {
      if (this.createdEvent) {
        // For 'created' callback
        this.closePopup()
        this.annotationEntry = {
          ...this.createdEvent.feature,
          resourceId: this.serverUUID,
        }
        this.rollbackAnnotationEvent()
        this.initialiseDraw()
      }
    },
    confirmDrawnFeature: function () {
      if (this.createdEvent) {
        this.checkAndCreatePopups(this.createdEvent)
        // Add relevance if exist to annotationEntry
        // Relevance will only be added in creating draw annotation
        // And will not be updated if move drawn annotation
        if (Object.keys(this.relevanceEntry).length > 0) {
          this.annotationEntry.feature.relevance = this.relevanceEntry
        }
        this.initialiseDraw()
      }
    },
    displayRelevanceDialog: function (display) {
      this.relevanceDisplay = display
      this.closePopup()
      // Used when check exist drawn annotation relevance
      if (
        !this.createdEvent && !this.currentDrawnFeature &&
        Object.keys(this.relevanceEntry).length === 0
      ) {
        // Reset drawn event
        this.drawnEvent()
      } else if (this.createdEvent || Object.keys(this.relevanceEntry).length > 0) {
        this.relevanceDisplay = display
        if (!display && this.activeDrawMode === 'Delete') this.relevanceEntry = {}
      }
    },
    setActiveDrawIcon: function () {
      let mclass
      if (this.$el.querySelector('.toolSelected')) {
        this.drawnTypes.map((t) => {
          if (t !== 'All tools' && t !== 'None') {
            this.$el.querySelector(`.draw${t}`).classList.remove('toolSelected');
          }
        })
        this.drawModes.map((m) => {
          if (m === 'Delete') mclass = '.drawTrash'
          else if (m === 'Edit') mclass = '.comment'
          this.$el.querySelector(mclass).classList.remove('toolSelected');
        })
      }
      if (this.activeDrawTool) {
        this.$el.querySelector(`.draw${this.activeDrawTool}`).classList.add('toolSelected');
      } else if (this.activeDrawMode) {
        if (this.activeDrawMode === 'Delete') mclass = '.drawTrash'
        else if (this.activeDrawMode === 'Edit') mclass = '.comment'
        this.$el.querySelector(mclass).classList.add('toolSelected');
      }
    },
    drawnEvent: function (type = undefined) {
      this.closePopup()
      if (!type) {
        this.activeDrawTool = undefined
        this.activeDrawMode = undefined
        this.inDrawing = false
      } else if (this.drawnTypes.includes(type)) {
        if (this.activeDrawMode) {
          this.$el.querySelector('.mapbox-gl-draw_trash').click()
          this.activeDrawMode = undefined
        }
        if (type === 'Point') {
          const point = this.$el.querySelector('.mapbox-gl-draw_point')
          this.$el.querySelector('.mapbox-gl-draw_point').click()
          this.activeDrawTool = point.classList.contains('active') ? 'Point' : undefined
        } else if (type === 'LineString') {
          const line = this.$el.querySelector('.mapbox-gl-draw_line')
          this.$el.querySelector('.mapbox-gl-draw_line').click()
          this.activeDrawTool = line.classList.contains('active') ? 'LineString' : undefined
        } else if (type === 'Polygon') {
          const polygon = this.$el.querySelector('.mapbox-gl-draw_polygon')
          this.$el.querySelector('.mapbox-gl-draw_polygon').click()
          this.activeDrawTool = polygon.classList.contains('active') ? 'Polygon' : undefined
        }
      } else if (this.drawModes.includes(type)) {
        if (this.activeDrawTool) {
          this.$el.querySelector('.mapbox-gl-draw_trash').click()
          this.activeDrawTool = undefined
        }
        if (type === 'Delete') {
          if (this.currentDrawnFeature && !this.activeDrawMode) {
            // Force simple_select a feature for delete event
            this.doubleClickedFeature = false
            this.changeAnnotationDrawMode({
              mode: 'simple_select',
              options: { featureIds: [this.currentDrawnFeature.id] }
            })
            this.trashAnnotationFeature()
          }
          this.activeDrawMode = this.activeDrawMode === 'Delete' ? undefined : 'Delete'
        } else if (type === 'Edit') {
          this.activeDrawMode = this.activeDrawMode === 'Edit' ? undefined : 'Edit'
        }
      }
      this.setActiveDrawIcon()
    },
    changeAnnotationDrawMode: function (mode) {
      if (this.mapImp) {
        this.mapImp.changeAnnotationDrawMode(mode)
      }
    },
    // Remove all drawn annotations from annotation layer
    clearAnnotationFeature: function () {
      if (
        this.mapImp &&
        this.drawnAnnotationFeatures &&
        this.drawnAnnotationFeatures.length > 0
      ) {
        this.mapImp.clearAnnotationFeature()
      }
    },
    trashAnnotationFeature: function () {
      if (this.mapImp) {
        this.mapImp.trashAnnotationFeature()
      }
    },
    rollbackAnnotationEvent: function () {
      if (this.mapImp) {
        // For 'updated' and 'deleted' callback
        if (this.drawnAnnotationEvent.includes(this.annotationEntry.type)) {
          this.mapImp.rollbackAnnotationEvent(this.annotationEntry)
        }
      }
    },
    commitAnnotationEvent: function (annotation) {
      if (
        this.mapImp &&
        this.drawnAnnotationEvent.includes(this.annotationEntry.type) &&
        // Only when annotation comments stored successfully
        annotation
      ) {
        this.annotationSubmitted = true
        if (this.annotationEntry.type === 'deleted') this.closePopup()
        this.mapImp.commitAnnotationEvent(this.annotationEntry)
        // Use to update 'this.drawnAnnotationFeatures'
        this.addAnnotationFeature()
      }
    },
    setFeatureAnnotated: function () {
      if (this.mapImp) {
        this.annotator.annotatedItemIds(this.serverUUID)
          .then((annotatedItemIds) => {
            for (const id of annotatedItemIds) {
              this.mapImp.setFeatureAnnotated(id)
            }
          })
          .catch((reason) => {
            console.log(reason) // Error!
          })
      }
    },
    addAnnotationFeature: function () {
      if (this.mapImp) {
        if (!this.annotationSubmitted) this.clearAnnotationFeature()
        if (this.drawnType !== 'None') {
          this.annotator.drawnFeatures(this.serverUUID)
            .then((drawnFeatures) => {
              // Use to switch the displayed feature type
              if (this.drawnType !== 'All tools') {
                drawnFeatures = drawnFeatures.filter((feature) => {
                  return feature.geometry.type === this.drawnType
                })
              }
              this.drawnAnnotationFeatures = drawnFeatures
              // No need to call 'addAnnotationFeature' when a new feature created
              if (!this.annotationSubmitted) {
                for (const feature of drawnFeatures) {
                  if (this.annotatedType !== 'Everyone') {
                    this.annotator
                      .itemAnnotations(this.serverUUID, feature.id)
                      .then((value) => {
                        let participated = value.filter((v) => {
                          return (
                            v.creator.name === this.userInformation.name &&
                            v.creator.email === this.userInformation.email
                          )
                        }).length > 0
                        if (
                          (this.annotatedType === 'Only me' && participated) ||
                          (this.annotatedType === 'Others' && !participated)
                        ) {
                          this.mapImp.addAnnotationFeature(feature)
                        }
                      })
                      .catch((reason) => {
                        console.log(reason) // Error!
                      })
                  } else this.mapImp.addAnnotationFeature(feature)
                }
              }
            })
            .catch((reason) => {
              console.log(reason) // Error!
            })
        }
      }
    },
    showAnnotator: function (flag) {
      if (this.mapImp) {
        // Control the show/hide of the drawn annotations
        this.mapImp.showAnnotator(flag)
        // Hide default toolbar, we will use customised SVG icons instead
        this.$el.querySelector('.maplibregl-ctrl-group').style.display = 'none'
      }
    },
    setDrawnType: function (flag) {
      this.drawnType = flag
      if (this.mapImp) {
        this.addAnnotationFeature()
      }
    },
    setAnnotatedType: function (flag) {
      this.annotatedType = flag
      if (this.mapImp) {
        this.addAnnotationFeature()
      }
    },
    setDimension: function (flag) {
      this.dimensionRadio = flag
      if (this.mapImp) {
        this.mapImp.enable3dPaths(flag)
      }
    },
    viewLatestMap: function () {
      let biologicalSex = this.biologicalSex ? this.biologicalSex : undefined
      //Human requires special handling
      if (this.entry === 'NCBITaxon:9606') {
        biologicalSex = 'PATO:0000384'
      }
      const state = {
        entry: this.entry,
        biologicalSex,
        viewport: this.mapImp.getState(),
      }
      this.$emit('view-latest-map', state)
    },
    backgroundChangeCallback: function (colour) {
      this.currentBackground = colour
      if (this.mapImp) {
        this.mapImp.setBackgroundColour(this.currentBackground, 1)
      }
    },
    processSystems: function (systems) {
      this.systems.length = 0
      if (systems && systems.length > 0) {
        const data = { label: 'All', key: 'All', children: [] }
        systems.forEach((system) => {
          const child = {
            colour: system.colour,
            enabled: system.enabled,
            label: system.id,
            key: system.id,
          }
          const children = processFTUs(system, child.key)
          if (children.length > 0) child.children = children
          data.children.push(child)
        })

        this.systems.push(data)
      }
    },
    processTaxon: function (flatmapAPI, taxonIdentifiers) {
      this.taxonConnectivity.length = 0
      taxonIdentifiers.forEach((taxon) => {
        findTaxonomyLabel(flatmapAPI, taxon).then((value) => {
          const item = { taxon, label: value }
          this.taxonConnectivity.push(item)
        })
      })
    },
    toggleDrawer: function () {
      this.drawerOpen = !this.drawerOpen
    },
    /**
     * Function to toggle colour/greyscale of organs.
     */
    setColour: function (flag) {
      this.colourRadio = flag
      if (this.mapImp) {
        this.mapImp.setColour({ colour: flag, outline: this.outlinesRadio })
      }
    },
    /**
     * Function to toggle outlines f organs.
     */
    setOutlines: function (flag) {
      this.outlineRadio = flag
      if (this.mapImp) {
        this.mapImp.setColour({ colour: this.colourRadio, outline: flag })
      }
    },
    /**
     * Function to toggle paths to default.
     * Also called when the associated button is pressed.
     */
    resetView: function () {
      if (this.mapImp) {
        this.mapImp.resetMap()
        if (this.$refs.centrelinesSelection) {
          this.$refs.centrelinesSelection.reset()
        }
        if (this.$refs.skcanSelection) {
          this.$refs.skcanSelection.reset()
        }
        if (this.$refs.layersSelection) {
          this.$refs.layersSelection.reset()
        }
        if (this.$refs.systemsSelection) {
          this.$refs.pathwaysSelection.reset()
        }
        if (this.$refs.pathwaysSelection) {
          this.$refs.pathwaysSelection.reset()
        }
      }
    },
    /**
     * Function to zoom in.
     * Also called when the associated button is pressed.
     */
    zoomIn: function () {
      if (this.mapImp) {
        this.mapImp.zoomIn()
      }
    },
    /**
     * Function to zoom out.
     * Also called when the associated button is pressed.
     */
    zoomOut: function () {
      if (this.mapImp) {
        this.mapImp.zoomOut()
      }
    },
    centreLinesSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableCentrelines(payload.value)
      }
    },
    sckanSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableSckanPath(payload.key, payload.value)
      }
    },
    checkAllSCKAN: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enableSckanPath(key, payload.value)
        )
      }
    },
    highlightConnectedPaths: function (payload) {
      if (this.mapImp) {
        let paths = [...this.mapImp.pathModelNodes(payload)]
        // The line below matches the paths to the annIdToFeatureId map to get the feature ids

        let pathFeatures = paths.map((p) => this.mapImp.featureProperties(p))
        let toHighlight = []
        pathFeatures.forEach((p) => {
          this.mapImp.nodePathModels(p.featureId).forEach((f) => {
            toHighlight.push(f)
          })
        })
        // display connected paths
        this.mapImp.zoomToFeatures(toHighlight, { noZoomIn: true })
      }
    },
    systemSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableSystem(payload.key, payload.value)
      }
    },
    checkAllSystems: function (flag) {
      if (this.mapImp) {
        this.systems[0].children.forEach((key) =>
          this.mapImp.enableSystem(key.label, flag)
        )
      }
    },
    ftuSelected: function (models) {
      this.searchAndShowResult(models, true)
    },
    layersSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableLayer(payload.key, payload.value)
      }
    },
    checkAllLayers: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enableLayer(key, payload.value)
        )
      }
    },
    taxonsSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enableConnectivityByTaxonIds(payload.key, payload.value)
      }
    },
    checkAllTaxons: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enableConnectivityByTaxonIds(key, payload.value)
        )
      }
    },
    pathwaysSelected: function (payload) {
      if (this.mapImp) {
        this.mapImp.enablePath(payload.key, payload.value)
      }
    },
    checkAllPathways: function (payload) {
      if (this.mapImp) {
        payload.keys.forEach((key) =>
          this.mapImp.enablePath(key, payload.value)
        )
      }
    },
    enablePanZoomEvents: function (flag) {
      this.mapImp.enablePanZoomEvents(flag)
    },
    eventCallback: function () {
      return (eventType, data, ...args) => {
        if (eventType === 'annotation') {
          const payload = {
            feature: data,
            userData: args,
            eventType: eventType,
          }
          // Popup closed will trigger aborted event
          if (data.type === 'aborted') {
            // Rollback drawing when no new annotation submitted
            if (!this.annotationSubmitted) this.rollbackAnnotationEvent()
            else this.annotationSubmitted = false
          } else if (data.type === 'modeChanged') {
            // 'modeChanged' event is before 'created' event
            if (data.feature.mode.startsWith('draw_')) {
              // Reset data entry for every draw
              this.relevanceEntry = {}
              this.inDrawing = true
            } else if (data.feature.mode === 'simple_select' && this.inDrawing) {
              this.displayRelevanceDialog(true)
            } else if (data.feature.mode === 'direct_select') {
              this.doubleClickedFeature = true
            }
          } else if (data.type === 'selectionChanged') {
            this.currentDrawnFeature =
              data.feature.features.length === 0 ?
                undefined :
                data.feature.features[0]
            payload.feature.feature = this.currentDrawnFeature
            // For exist drawn annotation features
            this.checkAndCreateDrawnFeaturePopups(payload)
          } else {
            if (data.type === 'created' || data.type === 'updated') {
              if (data.type === 'updated' && data.feature.action) {
                data.positionUpdated = data.feature.action === 'move'
              }
              const feature = this.mapImp.refreshAnnotationFeatureGeometry(data.feature)
              payload.feature.feature = feature
              // NB. this might now be `null` if user has deleted it (before OK/Submit)
              // so maybe then no `service.addAnnotation` ??
            }
            // Once double click mouse to confirm drawing, 'aborted' event will be triggered.
            // Hence disable direct popup when 'created' event, dialog will be used instead.
            if (data.type === 'created') {
              this.createdEvent = payload
            } else {
              this.checkAndCreatePopups(payload)
            }
          }
        } else {
          if (eventType !== 'pan-zoom') {
            const label = data.label
            const resource = [data.models]
            const taxonomy = this.entry
            const biologicalSex = this.biologicalSex
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
            }
            if (eventType === 'click') {
              if (this.viewingMode === 'Network Discovery') {
                this.highlightConnectedPaths([data.models])
              } else {
                this.currentActive = data.models ? data.models : ''
                this.allocateRelevance(payload)
              }
            } else if (
              eventType === 'mouseenter' &&
              !(this.viewingMode === 'Network Discovery')
            ) {
              this.currentHover = data.models ? data.models : ''
            }
            if (
              data &&
              data.type !== 'marker' &&
              eventType === 'click' &&
              !(this.viewingMode === 'Network Discovery') &&
              // Disable popup when drawing
              !this.inDrawing
            ) {
              this.checkAndCreatePopups(payload)
            }
            this.$emit('resource-selected', payload)
          } else {
            this.$emit('pan-zoom-callback', data)
          }
        }
      }
    },
    allocateRelevance: function (data = undefined) {
      if (data && data.feature) {
        // Only clicked relevance data will be added 
        let relevance = data.feature.models ?
          data.feature.models :
          data.feature.featureId
        if (
          relevance &&
          this.inDrawing &&
          // only the linestring will have relevance at the current stage
          this.activeDrawTool === 'LineString' &&
          !(relevance in this.relevanceEntry)
        ) {
          this.relevanceEntry[relevance] = data
        }
      } else if (this.currentDrawnFeature && this.drawnAnnotationFeatures) {
        let feature = this.drawnAnnotationFeatures
          .filter((feature) => feature.id === this.currentDrawnFeature.id)[0]
        if (feature && feature.relevance) this.relevanceEntry = feature.relevance
      }
    },
    checkAndCreateDrawnFeaturePopups: function (data) {
      if (!this.inDrawing) {
        this.relevanceEntry = {}
        if (this.currentDrawnFeature) {
          this.allocateRelevance()
          if (this.activeDrawMode) {
            // double click fires 'updated' callback
            if (this.doubleClickedFeature) {
              if (data.feature.feature.geometry.type !== 'Point') {
                // show tooltip and enter edit mode
                this.changeAnnotationDrawMode({
                  mode: 'direct_select',
                  options: { featureId: data.feature.feature.id }
                })
                this.trashAnnotationFeature()
              }
              this.doubleClickedFeature = false
            } else { // single click
              if (this.activeDrawMode === 'Delete') {
                this.changeAnnotationDrawMode({
                  mode: 'simple_select',
                  options: { featureIds: [data.feature.feature.id] }
                })
                this.trashAnnotationFeature()
              }
            }
          }
        }
      }
    },
    // checkNeuronClicked shows a neuron path pop up if a path was recently clicked
    checkAndCreatePopups: async function (data) {
      // Call flatmap database to get the connection data
      if (this.viewingMode === 'Annotation') {
        if (data.feature) {
          this.annotationEntry = {
            ...data.feature,
            resourceId: this.serverUUID,
          }
          if (data.feature.featureId && data.feature.models) {
            this.displayTooltip(data.feature.models)
          } else if (data.feature.feature) {
            if (this.inDrawing || this.activeDrawMode) {
              this.annotationSubmitted = false
              this.annotationEntry.featureId = data.feature.feature.id
              let featureGeometry = centroid(data.feature.feature.geometry)
              this.displayTooltip(data.feature.feature.id, featureGeometry)
            } else {
              // Not allowed to update feature if edit mode not on
              if (data.feature.type === 'updated') {
                this.rollbackAnnotationEvent()
              }
            }
          }
        } else {
          this.annotation = {}
        }
      } else {
        let results =
          await this.flatmapQueries.retrieveFlatmapKnowledgeForEvent(data)
        // The line below only creates the tooltip if some data was found on the path
        // result 0 is the connection, result 1 is the pubmed results from flatmap
        if (
          results[0] ||
          results[1] ||
          (data.feature.hyperlinks && data.feature.hyperlinks.length > 0)
        ) {
          this.resourceForTooltip = data.resource[0]
          data.resourceForTooltip = this.resourceForTooltip
          this.createTooltipFromNeuronCuration(data)
        }
      }
    },
    popUpCssHacks: function () {
      // Below is a hack to remove flatmap tooltips while popup is open
      let ftooltip = document.querySelector('.flatmap-tooltip-popup')
      if (ftooltip) ftooltip.style.display = 'none'
      document.querySelector('.maplibregl-popup-close-button').style.display =
        'block'
      this.$refs.tooltip.$el.style.display = 'flex'
      document.querySelector('.maplibregl-popup-close-button').onclick = () => {
        if (ftooltip) ftooltip.style.display = 'block'
      }
    },
    closePopup: function () {
      let cbutton = document.querySelector('.maplibregl-popup-close-button')
      if (cbutton) cbutton.click()
    },
    closeTooltip: function () {
      this.$refs.tooltip.$el.style.display = 'none'
      document.querySelectorAll('.maplibregl-popup').forEach((item) => {
        item.style.display = 'none'
      })
    },
    createTooltipFromNeuronCuration: async function (data) {
      this.tooltipEntry = await this.flatmapQueries.createTooltipData(data)
      this.displayTooltip(data.resource[0])
    },
    // Keeping this as an API
    showPopup: function (featureId, node, options) {
      let myOptions = options
      if (this.mapImp) {
        if (myOptions) {
          if (!myOptions.className) myOptions.className = 'custom-popup'
        } else {
          myOptions = { className: 'custom-popup', positionAtLastClick: true }
        }
        this.mapImp.showPopup(featureId, node, myOptions)
      }
    },
    showMarkerPopup: function (featureId, node, options) {
      if (this.mapImp) {
        this.mapImp.showMarkerPopup(featureId, node, options)
      }
    },
    closeMinimap: function () {
      let minimapEl = this.$refs.flatmapContainer.querySelector(
        '.maplibregl-ctrl-minimap'
      ) // find minimap
      if (this.minimapSmall) {
        //switch the classes on the minimap
        minimapEl.classList.add('enlarge')
        minimapEl.classList.remove('shrink')
      } else {
        minimapEl.classList.add('shrink')
        minimapEl.classList.remove('enlarge')
      }
      this.minimapSmall = !this.minimapSmall
    },
    addResizeButtonToMinimap: function () {
      let minimapEl = this.$refs.flatmapContainer.querySelector(
        '.maplibregl-ctrl-minimap'
      )
      if (minimapEl) {
        if (this.$refs.minimapResize &&
        this.$refs.minimapResize.$el.parentNode) {
          this.$refs.minimapResize.$el.parentNode.removeChild(
            this.$refs.minimapResize.$el)
        }
        minimapEl.appendChild(this.$refs.minimapResize.$el)
        this.minimapResizeShow = true
      }
    },
    setHelpMode: function (helpMode) {
      if (helpMode) {
        this.inHelp = true
        this.hoverVisibilities.forEach((item) => {
          item.value = true
        })
        this.openFlatmapHelpPopup()
      } else {
        this.inHelp = false
        this.hoverVisibilities.forEach((item) => {
          item.value = false
        })
        this.closeFlatmapHelpPopup()
      }
    },
    showToolitip: function (tooltipNumber) {
      if (!this.inHelp) {
        clearTimeout(this.tooltipWait[tooltipNumber])
        this.tooltipWait[tooltipNumber] = setTimeout(() => {
          this.hoverVisibilities[tooltipNumber].value = true
        }, 500)
      }
    },
    hideToolitip: function (tooltipNumber) {
      if (!this.inHelp) {
        clearTimeout(this.tooltipWait[tooltipNumber])
        this.tooltipWait[tooltipNumber] = setTimeout(() => {
          this.hoverVisibilities[tooltipNumber].value = false
        }, 500)
      }
    },
    displayTooltip: function (feature, geometry = undefined) {
      this.tooltipDisplay = true
      let featureId = undefined
      let options = { className: 'flatmapvuer-popover' }
      if (geometry) {
        featureId = feature
        options.annotationFeatureGeometry = geometry
      } else {
        featureId = this.mapImp.modelFeatureIds(feature)[0]
        if (!this.inDrawing) {
          options.positionAtLastClick = true
        }
      }
      if (!this.disableUI) {
        this.mapImp.showPopup(featureId, this.$refs.tooltip.$el, options)
      }
      this.popUpCssHacks()
    },
    openFlatmapHelpPopup: function () {
      if (this.mapImp) {
        let heartId = this.mapImp.modelFeatureIds('UBERON:0000948')
        if (heartId && heartId.length > 0) {
          const elm = 'Click for more information'
          this.mapImp.showPopup(heartId[0], elm, {
            anchor: 'top',
            className: 'flatmap-popup-popper',
          })
        }
      }
    },
    closeFlatmapHelpPopup: function () {
      this.$el
        .querySelectorAll('.maplibregl-popup-close-button')
        .forEach((item) => {
          item.click()
        })
    },
    getLabels: function () {
      let labels = []
      if (this.mapImp) {
        let annotations = this.mapImp.annotations
        for (let value of annotations.values()) {
          if (value.label) labels.push(value.label)
        }
        return Array.from(new Set(labels))
      }
    },
    getState: function () {
      if (this.mapImp) {
        let state = {
          entry: this.entry,
          viewport: this.mapImp.getState(),
        }
        const identifier = this.mapImp.getIdentifier()
        if (this.biologicalSex) state['biologicalSex'] = this.biologicalSex
        else if (identifier && identifier.biologicalSex)
          state['biologicalSex'] = identifier.biologicalSex
        if (identifier && identifier.uuid) state['uuid'] = identifier.uuid
        return state
      }
      return undefined
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
            this.mapImp.setState(state.viewport)
          }
        } else {
          this.createFlatmap(state)
        }
        this.setStateRequired = false
      }
    },
    restoreMapState: function (state) {
      if (state) {
        if (state.viewport) this.mapImp.setState(state.viewport)
        if (state.searchTerm) this.searchAndShowResult(state.searchTerm, true)
      }
    },
    createFlatmap: function (state) {
      if (!this.mapImp && !this.loading) {
        this.loading = true
        let minimap = false
        if (this.displayMinimap) {
          minimap = { position: 'top-right' }
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

        let identifier = { taxon: this.entry }
        if (this.uuid) {
          identifier.uuid = this.uuid
        }
        //This now handle the uses of uuid when resuming states
        if (state) {
          if (state.uuid) {
            identifier = { uuid: state.uuid }
          } else if (state.entry) {
            identifier.taxon = state.entry
            if (state.biologicalSex) {
              identifier['biologicalSex'] = state.biologicalSex
            } else if (identifier.taxon === 'NCBITaxon:9606') {
              //For backward compatibility
              identifier['biologicalSex'] = 'PATO:0000384'
            }
          }
        } else {
          // Set the bioloicalSex now if map is not resumed from
          // a saved state
          if (this.biologicalSex) {
            identifier['biologicalSex'] = this.biologicalSex
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
            'min-zoom': this.minZoom,
            layerControl: true,
            pathControls: true,
            searchable: this.searchable,
            tooltips: this.tooltips,
            minimap: minimap,
          }
        )
        promise1.then((returnedObject) => {
          this.mapImp = returnedObject
          this.serverUUID = this.mapImp.getIdentifier().uuid
          this.onFlatmapReady()
          if (this._stateToBeSet) this.restoreMapState(this._stateToBeSet)
          else {
            this.restoreMapState(state)
          }
        })
      } else if (state) {
        this._stateToBeSet = {
          viewport: state.viewport,
          searchTerm: state.searchTerm,
        }
        if (this.mapImp && !this.loading)
          this.restoreMapState(this._stateToBeSet)
      }
    },
    computePathControlsMaximumHeight() {
      const elem = this.$refs.display
      if (elem) {
        const computed = getComputedStyle(elem)
        const padding =
          parseInt(computed.paddingTop) + parseInt(computed.paddingBottom)
        const height = elem.clientHeight - padding
        this.pathwaysMaxHeight = height - 170
      }
    },
    mapResize: function () {
      try {
        this.computePathControlsMaximumHeight()
        if (this.mapImp) {
          this.mapImp.resize()
          this.showMinimap(this.displayMinimap)
          if (this.mapImp._minimap) {
            this.mapImp._minimap._miniMap.resize()
          }
        }
      } catch {
        console.error('Map resize error')
      }
    },
    onFlatmapReady: function () {
      // onFlatmapReady is used for functions that need to run immediately after the flatmap is loaded
      this.sensor = new ResizeSensor(this.$refs.display, this.mapResize)
      if (this.mapImp.options && this.mapImp.options.style === 'functional') {
        this.isFC = true
      }
      this.mapImp.setBackgroundOpacity(1)
      this.backgroundChangeCallback(this.currentBackground)
      this.pathways = this.mapImp.pathTypes()
      this.mapImp.enableCentrelines(false)
      //Disable layers for now
      //this.layers = this.mapImp.getLayers();
      this.processSystems(this.mapImp.getSystems())
      this.processTaxon(this.flatmapAPI, this.mapImp.taxonIdentifiers)
      this.addResizeButtonToMinimap()
      this.loading = false
      this.computePathControlsMaximumHeight()
      this.drawerOpen = true
      this.mapResize()
      this.$emit('ready', this)
    },
    showMinimap: function (flag) {
      if (this.mapImp) this.mapImp.showMinimap(flag)
    },
    showPathwaysDrawer: function (flag) {
      this.drawerOpen = flag
    },
    /**
     * Function to display features with annotation matching the provided term,
     * with the option to display the label using displayLabel flag.
     */
    searchAndShowResult: function (term, displayLabel) {
      if (this.mapImp) {
        if (term === undefined || term === '') {
          this.mapImp.clearSearchResults()
          return true
        } else {
          const searchResults = this.mapImp.search(term)
          if (
            searchResults &&
            searchResults.results &&
            searchResults.results.length > 0
          ) {
            this.mapImp.showSearchResults(searchResults)
            if (
              displayLabel &&
              searchResults.results[0].featureId &&
              searchResults.results[0].text
            ) {
              const annotation = this.mapImp.annotation(
                searchResults.results[0].featureId
              )
              this.mapImp.showPopup(
                searchResults.results[0].featureId,
                annotation.label,
                {
                  className: 'custom-popup',
                  positionAtLastClick: false,
                  preserveSelection: true,
                }
              )
            }
            return true
          } else this.mapImp.clearSearchResults()
        }
      }
      return false
    },
    /**
     * Get the list of suggested terms
     */
    searchSuggestions: function (term) {
      if (this.mapImp) return this.mapImp.search(term)
      return []
    },
  },
  props: {
    entry: String,
    uuid: String,
    biologicalSex: {
      type: String,
      default: '',
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
            display: 'Open AC Map',
            key: 'AC',
          },
          {
            display: 'Open FC Map',
            key: 'FC',
          },
          {
            display: 'Open 3D Human Map',
            key: '3D',
          },
        ]
      },
    },
    showStarInLegend: {
      type: Boolean,
      default: false,
    },
    isLegacy: {
      type: Boolean,
      default: false,
    },
    displayLatestChanges: {
      type: Boolean,
      default: false,
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
      default: 'https://mapcore-demo.org/current/flatmap/v3/',
    },
    sparcAPI: {
      type: String,
      default: 'https://api.sparc.science/',
    },
    /**
     * Flag to disable UIs on Map
     */
     disableUI: {
      type: Boolean,
      default: false,
    }
  },
  provide() {
    return {
      flatmapAPI: this.flatmapAPI,
      sparcAPI: this.sparcAPI,
      $annotator: this.annotator
    }
  },
  data: function () {
    return {
      annotationEntry: {},
      //tooltip display has to be set to false until it is rendered
      //for the first time, otherwise it may display an arrow at a
      //undesired location.
      tooltipDisplay: true,
      serverUUID: undefined,
      layers: [],
      pathways: [],
      sckanDisplay: [
        {
          label: 'Display Path with SCKAN',
          key: 'VALID',
        },
      ],
      centreLines: [
        {
          label: 'Display Nerves',
          key: 'centrelines',
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
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
        { value: false },
      ],
      yellowstar: yellowstar,
      isFC: false,
      inHelp: false,
      currentBackground: 'white',
      availableBackground: ['white', 'lightskyblue', 'black'],
      loading: false,
      flatmapMarker: flatmapMarker,
      tooltipEntry: createUnfilledTooltipData(),
      connectivityTooltipVisible: false,
      drawerOpen: false,
      dimensionRadio: false,
      colourRadio: true,
      outlinesRadio: true,
      minimapResizeShow: false,
      minimapSmall: false,
      currentActive: '',
      currentDrawnFeature: undefined, // Clicked drawn annotation
      currentHover: '',
      viewingMode: 'Exploration',
      viewingModes: ['Annotation', 'Exploration', 'Network Discovery'],
      drawnType: 'All tools',
      drawnTypes: ['All tools', 'Point', 'LineString', 'Polygon', 'None'],
      annotatedType: 'Everyone',
      annotatedTypes: ['Everyone', 'Only me', 'Others'],
      openMapRef: undefined,
      backgroundIconRef: undefined,
      annotator: undefined,
      userInformation: undefined,
      activeDrawTool: undefined,
      drawnAnnotationEvent: ['created', 'updated', 'deleted'],
      createdEvent: undefined,
      annotationSubmitted: false,
      inDrawing: false,
      relevanceDisplay: false,
      relevanceEntry: {},
      drawnAnnotationFeatures: undefined, // Store all exist drawn annotations
      doubleClickedFeature: false,
      activeDrawMode: undefined,
      drawModes: ['Delete', 'Edit'],
    }
  },
  computed: {
    hasRelevance: function () {
      return Object.keys(this.relevanceEntry).length > 0
    }
  },
  watch: {
    entry: function () {
      if (!this.state) this.createFlatmap()
    },
    helpMode: function (val) {
      this.setHelpMode(val)
    },
    state: {
      handler: function (state) {
        if (this.mapManager) {
          this.setState(state)
        } else {
          //this component has not been mounted yet
          this.setStateRequired = true
        }
      },
      immediate: true,
      deep: true,
    },
    viewingMode: function (mode) {
      if (mode === 'Annotation') {
        this.showAnnotator(true)
        this.annotator.authenticate().then((userData) => {
          if (userData.name && userData.email) {
            this.userInformation = userData
            this.setFeatureAnnotated()
            if (!this.drawnAnnotationFeatures) {
              this.addAnnotationFeature()
            }
          }
        })
      } else this.showAnnotator(false)
    },
    disableUI: function (isUIDisabled) {
      if (isUIDisabled) {
        this.closeTooltip()
      }
    }
  },
  mounted: function () {
    this.openMapRef = shallowRef(this.$refs.openMapRef)
    this.backgroundIconRef = shallowRef(this.$refs.backgroundIconRef)
    this.tooltipWait = []
    this.tooltipWait.length = this.hoverVisibilities.length
    this.mapManager = new flatmap.MapManager(this.flatmapAPI)
    this.flatmapQueries = new FlatmapQueries()
    this.flatmapQueries.initialise(this.flatmapAPI)
    if (this.state) {
      //State is set and require to set the state
      if (this.setStateRequired) {
        this.setState(this.state)
      }
    } else if (this.renderAtMounted) {
      this.createFlatmap()
    }
  },
}
</script>

<style lang="scss" scoped>

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

:deep(.popper-bump-right) {
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

:deep(.maplibregl-popup) {
  max-width: 300px !important;
}

:deep(.flatmap-tooltip-popup) {
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
      content: '';
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

:deep(.maplibregl-popup) {
  &.flatmap-marker-popup {
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    background: #fff;
  }
}

/* Fix for chrome bug where under triangle pops up above one on top of it  */
.selector:not(*:root),
:deep(.flatmap-tooltip-popup) {
  .maplibregl-popup-content::after {
    top: 99.9%;
  }
}

:deep(.flatmap-tooltip-dialog) {
  .maplibregl-popup-tip {
    display: none;
  }
}

:deep(.flatmap-marker-popup){
  .maplibregl-popup-content {
    padding: 0px;
  }
}

:deep(.flatmapvuer-popover) {
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

.drawPoint, .drawLineString, .drawPolygon, .drawTrash, 
.connection, .comment, .zoomIn, .zoomOut, .fitWindow {
  padding-left: 8px;
}

.toolSelected {
  color: var(--el-color-primary-light-5) !important;
}

.yellow-star-legend {
  width: 130px;
  cursor: pointer;
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

:deep(.background-popper.el-popover.el-popper) {
  padding: 5px 12px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  height: fit-content;
  min-width: 200px;
  .el-popper__arrow {
    &:before {
      border-color: $app-primary-color;
    }
  }
}

:deep(.open-map-popper.el-popover.el-popper) {
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #ffffff;
  border: 1px solid $app-primary-color;
  box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.06);
  min-width: 188px;

  .el-row ~ .el-row {
    margin-top: 8px;
  }

  .el-button {
    padding-top: 5px;
    padding-bottom: 5px;
    background: #f3e6f9;
    border-color: $app-primary-color;
    color: $app-primary-color;
  }

  .el-popper__arrow {
    &:before {
      border-color: $app-primary-color;
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

  &.open-map-button {
    margin-bottom:4px;
  }

  &:hover {
    cursor: pointer;
  }
}

:deep(.maplibregl-ctrl-minimap) {
  transform-origin: top right;
  @media (max-width: 1250px) {
    height: 125px !important; // important is needed here as we are over-riding the style set by the flatmap
    width: 180px !important;
    :deep(.maplibregl-canvas .maplibregl-canvas) {
      height: 125px !important;
      width: 180px !important;
    }
  }
  @media (min-width: 1251px) {
    height: 190px !important;
    width: 300px !important;
    :deep(.maplibregl-canvas .maplibregl-canvas) {
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

:deep(.flatmap-popper.el-popper) {
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
  .el-popper__arrow {
    &:before {
      border-color: $app-primary-color;
      background-color: #f3ecf6;
    }
  }
}

:deep(.el-loading-spinner) {
  .path {
    stroke: $app-primary-color;
  }
  .el-loading-text {
    color: $app-primary-color;
  }
}

:deep(.flatmap-popup-popper) {
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

:deep(.maplibregl-popup-content) {
  padding: 0px;
}

.bottom-draw-control {
  position: absolute;
  right: 40%;
  bottom: 16px;
}

.bottom-right-control {
  position: absolute;
  right: 16px;
  bottom: 16px;
}

:deep(.my-drawer) {
  background: rgba(0, 0, 0, 0);
  box-shadow: none;
}

.drawer {
  :deep(.el-drawer:focus) {
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

:deep(.maplibregl-canvas-container) {
  canvas {
    outline: none;
  }
}

.backgroundSpacer {
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.flatmap-radio {
  :deep(label) {
    margin-right: 20px;
    &:last-child {
      margin-right: 0px;
    }
  }
  :deep(.el-radio__input) {
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

:deep(.custom-popup) {
  .maplibregl-popup-tip {
    display: none;
  }
  .maplibregl-popup-content {
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    display: none;
    background: #fff;
    font-family: 'Asap', sans-serif;
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
      content: '';
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
  width: 150px!important;
}

:deep(.flatmap_dropdown) {
  min-width: 160px !important;
  .el-select-dropdown__item {
    white-space: nowrap;
    text-align: left;
    &.is-selected {
      color: $app-primary-color;
      font-weight: normal;
    }
  }
}

:deep(.el-dialog) {
  text-align: justify;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  background: #fff;
  border: 1px solid $app-primary-color;
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 40%;
  bottom: 40px;
}

:deep(.el-dialog__body, .el-dialog__header) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: rgb(131, 0, 191);
}

:deep(.el-card) {
  --el-card-padding: 12px;
  border: 0;
}
</style>

<style lang="scss">

.flatmap-container {
  --el-color-primary: #8300BF;
  --el-color-primary-light-5: #CD99E5;
  --el-color-primary-light-9: #F3E6F9;
  --el-color-primary-dark-2: var(--el-color-primary);
}

</style>