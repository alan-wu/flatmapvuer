<template>
  <div>
    <div class="drawtool-container">
      <el-popover
        content="Connection"
        placement="left"
        :teleported="false"
        trigger="manual"
        width="100"
        popper-class="flatmap-popper"
        :visible="hoverVisibilities[10].value"
      >
        <template #reference>
          <map-svg-icon
            icon="connection"
            class="icon-button drawConnection"
            @click="drawConnectionEvent()"
            @mouseover="showTooltip(10)"
            @mouseout="hideTooltip(10)"
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
            @click="drawToolEvent('Point')"
            @mouseover="showTooltip(11)"
            @mouseout="hideTooltip(11)"
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
            @click="drawToolEvent('LineString')"
            @mouseover="showTooltip(12)"
            @mouseout="hideTooltip(12)"
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
            @click="drawToolEvent('Polygon')"
            @mouseover="showTooltip(13)"
            @mouseout="hideTooltip(13)"
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
            class="icon-button drawDelete"
            @click="drawModeEvent('Delete')"
            @mouseover="showTooltip(14)"
            @mouseout="hideTooltip(14)"
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
            class="icon-button drawEdit"
            @click="drawModeEvent('Edit')"
            @mouseover="showTooltip(15)"
            @mouseout="hideTooltip(15)"
          />
        </template>
      </el-popover>
    </div>
    <ConnectionDialog
      class="connection-dialog"
      v-show="connectionDisplay"
      :connectionEntry="connectionEntry"
      :inDrawing="inDrawing"
      :hasConnection="hasConnection"
      @dialogDisplay="drawConnectionEvent()"
      @confirmDrawn="$emit('confirmDrawn', $event)"
      @cancelDrawn="$emit('cancelDrawn', $event)"
      @featureTooltip="$emit('featureTooltip', $event)"
    />
  </div>
</template>

<script>
import { MapSvgIcon } from "@abi-software/svg-sprite";
import "@abi-software/svg-sprite/dist/style.css";
import ConnectionDialog from "./ConnectionDialog.vue";
/* eslint-disable no-alert, no-console */

/**
 * @param scopeElement    Draggable scope area (Optional)
 * @param dragElement     Draggable element
 */
const draggable = (scopeElement, dragElement) => {
  let startX, startY, clickX, clickY, posX, posY;
  // reset position in case previous pupped up dialog is dragged
  dragElement.style.left = "";
  dragElement.style.top = "";
  // const scopeRect = scopeElement.getBoundingClientRect()
  // const dragRect = dragElement.getBoundingClientRect()

  dragElement.addEventListener(
    "mousedown",
    (e) => {
      e.preventDefault();
      startX = dragElement.offsetLeft;
      startY = dragElement.offsetTop;
      clickX = e.clientX;
      clickY = e.clientY;

      dragElement.addEventListener("mousemove", drag, false);
      document.addEventListener(
        "mouseup",
        () => {
          dragElement.removeEventListener("mousemove", drag, false);
        },
        false
      );
    },
    false
  );

  function drag(e) {
    e.preventDefault();
    posX = startX - (clickX - e.clientX);
    posY = startY - (clickY - e.clientY);
    // if (
    //   (posX > scopeRect.left && ((posX + dragRect.width) < scopeRect.right)) &&
    //   (posY > scopeRect.top && ((posY + dragRect.height) < scopeRect.bottom))
    // ) {
    dragElement.style.left = `${posX}px`;
    dragElement.style.top = `${posY}px`;
    // } else {
    //   if (posX <= scopeRect.left) {
    //     dragElement.style.left = '0px';
    //   } else if (posX + dragRect.width >= scopeRect.right) {
    //     dragElement.style.left = `${scopeRect.right - dragRect.width}px`;
    //   }
    //   if (posY <= scopeRect.top) {
    //     dragElement.style.top = '0px';
    //   } else if (posY + dragRect.height >= scopeRect.bottom) {
    //     dragElement.style.top = `${scopeRect.bottom - dragRect.height}px`;
    //   }
    // }
  }
};

export default {
  name: "DrawTool",
  components: {
    MapSvgIcon,
  },
  props: {
    flatmapCanvas: undefined,
    drawnType: {
      type: String,
    },
    activeDrawTool: {
      type: String,
    },
    activeDrawMode: {
      type: String,
    },
    drawnCreatedEvent: {
      type: Object,
    },
    connectionEntry: {
      type: Object,
    },
    hoverVisibilities: {
      type: Array,
    },
  },
  data: function () {
    return {
      activeTool: undefined,
      activeMode: undefined,
      connectionDisplay: false,
      dialogPosition: {
        offsetX: 0,
        offsetY: 0,
        x: undefined,
        y: undefined,
      },
      toolbarIcons: {
        supports: [{ name: "Connection", active: false, disabled: true }],
        tools: [
          { name: "Point", active: false, disabled: false },
          { name: "LineString", active: false, disabled: false },
          { name: "Polygon", active: false, disabled: false },
        ],
        modes: [
          { name: "Edit", active: false, disabled: false },
          { name: "Delete", active: false, disabled: false },
        ],
      },
    };
  },
  computed: {
    inDrawing: function () {
      return this.activeDrawTool !== undefined;
    },
    isFeatureDrawn: function () {
      return this.drawnCreatedEvent !== undefined
    },
    hasConnection: function () {
      return Object.keys(this.connectionEntry).length > 0;
    },
  },
  watch: {
    activeDrawTool: function (value) {
      this.updateToolbarIcons({ value: value }, "tools", "modes");
      if (!value) this.connectionDisplay = false
    },
    activeDrawMode: function (value) {
      this.updateToolbarIcons({ value: value }, "modes", "tools");
      if (value === 'Delete') this.connectionDisplay = false
    },
    hasConnection: function (value) {
      this.updateToolbarIcons({ value: value, type: "disabled" }, "supports");
    },
    isFeatureDrawn: function (value) {
      if (value) this.connectionDisplay = true
    },
    connectionDisplay: function (value) {
      this.updateToolbarIcons({ value: value, type: "active" }, "supports");
      if (value) this.dialogCssHacks();
      else this.$emit("featureTooltip", undefined);
    },
    dialogPosition: {
      handler: function () {
        const containerRect = this.$el.getBoundingClientRect();
        this.dialogPosition.offsetX = containerRect.x;
        this.dialogPosition.offsetY = containerRect.y;
      },
      deep: true,
      once: true,
    },
  },
  methods: {
    drawConnectionEvent: function () {
      if (this.hasConnection && !this.activeDrawTool) {
        this.connectionDisplay = !this.connectionDisplay
      }
    },
    updateToolbarIcons: function (input, primary, secondary = undefined) {
      if (!input.type || input.type === "active") {
        this.toolbarIcons[primary].map((icon) => {
          const activeCondition = secondary
            ? icon.name === input.value
            : input.value;
          if (activeCondition) icon.active = true;
          else icon.active = false;
        });
      }
      if (!input.type || input.type === "disabled") {
        const disabledTarget = secondary ? secondary : primary;
        this.toolbarIcons[disabledTarget].map((icon) => {
          const disabledBool = secondary ? true : false;
          if (input.value) icon.disabled = disabledBool;
          else icon.disabled = !disabledBool;
        });
      }
      this.toolbarCssHacks();
    },
    drawToolEvent: function (type) {
      if (!this.activeDrawMode && !this.connectionDisplay) {
        if (type === "Point") {
          const point = this.flatmapCanvas.querySelector(
            ".mapbox-gl-draw_point"
          );
          point.click();
          this.activeTool = point.classList.contains("active")
            ? "Point"
            : undefined;
        } else if (type === "LineString") {
          const line = this.flatmapCanvas.querySelector(".mapbox-gl-draw_line");
          line.click();
          this.activeTool = line.classList.contains("active")
            ? "LineString"
            : undefined;
        } else if (type === "Polygon") {
          const polygon = this.flatmapCanvas.querySelector(
            ".mapbox-gl-draw_polygon"
          );
          polygon.click();
          this.activeTool = polygon.classList.contains("active")
            ? "Polygon"
            : undefined;
        }
        this.$emit("drawToolbarEvent", this.activeTool);
      }
    },
    drawModeEvent: function (type) {
      if (!this.activeDrawTool) {
        this.activeMode = type;
        this.$emit("drawToolbarEvent", this.activeMode);
      }
    },
    toolbarCssHacks: function () {
      // set toolbar icon style
      Object.values(this.toolbarIcons).forEach((icons) => {
        icons.map((icon) => {
          const iconClassList = this.$el.querySelector(
            `.draw${icon.name}`
          ).classList;
          if (icon.active) iconClassList.add("active");
          else iconClassList.remove("active");
          if (icon.disabled) iconClassList.add("disabled");
          else iconClassList.remove("disabled");
        });
      });
    },
    dialogCssHacks: function () {
      this.$nextTick(() => {
        const dialog = this.$el.querySelector(".connection-dialog");
        draggable(this.flatmapCanvas, dialog);
        // dialog popup at the click position
        // slightly change x or y if close to boundary
        let posX, posY;
        const containerRect = this.flatmapCanvas.getBoundingClientRect();
        const dialogRect = dialog.getBoundingClientRect();
        if (this.dialogPosition.x > containerRect.width / 2) {
          posX = this.dialogPosition.x - dialogRect.width;
        } else {
          posX = this.dialogPosition.x;
        }
        if (this.dialogPosition.y > containerRect.height / 2) {
          posY = this.dialogPosition.y - dialogRect.height;
        } else {
          posY = this.dialogPosition.y;
        }
        dialog.style.transform = `translate(${
          posX - this.dialogPosition.offsetX
        }px, ${posY - this.dialogPosition.offsetY}px)`;
      });
    },
    showTooltip: function (tooltipNumber) {
      this.$emit('showTooltip', tooltipNumber)
    },
    hideTooltip: function (tooltipNumber) {
      this.$emit('hideTooltip', tooltipNumber)
    },
  },
  mounted: function () {
    this.toolbarCssHacks();
    this.flatmapCanvas.querySelector(".maplibregl-canvas").addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        this.dialogPosition.x = e.clientX;
        this.dialogPosition.y = e.clientY;
        // use to fix the draw point pop up position issue
        if (this.activeDrawTool === "Point") {
          this.dialogCssHacks();
        }
      },
      false
    );
  },
};
</script>

<style lang="scss" scoped>
.drawtool-container {
  background-color: var(--el-color-primary-light-9);
  padding: 4px 4px 2px 4px;
  border-style: solid;
  border-color: var(--el-color-primary-light-5);
  border-radius: 1rem;
  position: absolute;
  right: calc(50vw - 100px);
  bottom: 16px;
  z-index: 10;
}

.drawPoint,
.drawLineString,
.drawPolygon,
.drawDelete,
.drawEdit,
.drawConnection {
  padding: 4px;
  color: var(--el-color-primary-light-5) !important;
}

.icon-button {
  height: 24px !important;
  width: 24px !important;
  color: $app-primary-color;

  &.open-map-button {
    margin-bottom: 4px;
  }

  &:hover {
    cursor: pointer;
  }
}

.active {
  color: var(--el-color-primary) !important;
}

.disabled {
  color: #dddddd !important;
  cursor: not-allowed !important;
}

.connection-dialog {
  position: absolute;
  z-index: 10;
  cursor: move;
}
</style>
