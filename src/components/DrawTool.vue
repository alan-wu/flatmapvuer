<template>
  <div class="drawtool-container">
    <el-popover
      content="Draw Connection"
      placement="top"
      :teleported="false"
      trigger="manual"
      width="80"
      popper-class="flatmap-popper"
    >
      <template #reference>
        <map-svg-icon
          icon="connection"
          class="icon-button drawConnection inactive"
          @click="$emit('display', true)"
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
      v-if="drawnType !== 'LineString' && drawnType !== 'Polygon'"
    >
      <template #reference>
        <map-svg-icon
          icon="drawPoint"
          class="icon-button drawPoint"
          @click="drawingEvent('Point')"
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
      v-if="drawnType !== 'Point' && drawnType !== 'Polygon'"
    >
      <template #reference>
        <map-svg-icon
          icon="drawLine"
          class="icon-button drawLineString"
          @click="drawingEvent('LineString')"
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
      v-if="drawnType !== 'Point' && drawnType !== 'LineString'"
    >
      <template #reference>
        <map-svg-icon
          icon="drawPolygon"
          class="icon-button drawPolygon"
          @click="drawingEvent('Polygon')"
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
    >
      <template #reference>
        <map-svg-icon
          icon="drawTrash"
          class="icon-button drawDelete"
          @click="drawingEvent('Delete')"
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
    >
      <template #reference>
        <map-svg-icon
          icon="comment"
          class="icon-button drawEdit"
          @click="drawingEvent('Edit')"
        />
      </template>
    </el-popover>
  </div>
</template>

<script>
import { MapSvgIcon } from "@abi-software/svg-sprite";
import "@abi-software/svg-sprite/dist/style.css";
/* eslint-disable no-alert, no-console */

export default {
  name: "DrawTool",
  components: {
    MapSvgIcon,
  },
  props: {
    activeDrawTool: {
      type: String,
    },
    drawnType: {
      type: String,
    },
    drawnTypes: {
      type: Array,
    },
    activeDrawMode: {
      type: String,
    },
    drawModes: {
      type: Array,
    },
    connectionDisplay: {
      type: Boolean,
    },
  },
  data: function () {
    return {};
  },
  watch: {
    activeDrawTool: function () {
      this.drawIconCssHacks();
    },
    activeDrawMode: function () {
      this.drawIconCssHacks();
    },
    connectionDisplay: function (display) {
      const connectionIcon = this.$el.querySelector(".drawConnection");
      if (display) {
        connectionIcon.classList.add("iconSelected");
        this.$emit('cssHacks', true)
      } else {
        connectionIcon.classList.remove("iconSelected");
      }
      this.drawIconCssHacks();
    },
  },
  methods: {
    drawingEvent: function (type) {
      this.$emit("drawingEvent", type);
    },
    drawIconCssHacks: function () {
      // set tool/mode icon status
      if (this.$el.querySelector(".iconSelected") || !this.connectionDisplay) {
        this.drawnTypes.map((t) => {
          const dtype = this.$el.querySelector(`.draw${t}`);
          if (dtype) {
            dtype.classList.remove("iconSelected");
            dtype.classList.remove("inactive");
          }
        });
        this.drawModes.map((m) => {
          this.$el.querySelector(`.draw${m}`).classList.remove("iconSelected");
          this.$el.querySelector(`.draw${m}`).classList.remove("inactive");
        });
      }
      if (this.activeDrawTool) {
        this.$el
          .querySelector(`.draw${this.activeDrawTool}`)
          .classList.add("iconSelected");
        this.drawModes.map((m) => {
          this.$el.querySelector(`.draw${m}`).classList.add("inactive");
        });
      } else if (this.activeDrawMode || this.connectionDisplay) {
        if (this.activeDrawMode) {
          this.$el
            .querySelector(`.draw${this.activeDrawMode}`)
            .classList.add("iconSelected");
        }
        this.drawnTypes.map((t) => {
          const dtype = this.$el.querySelector(`.draw${t}`);
          if (dtype) dtype.classList.add("inactive");
        });
      }
    },
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

.iconSelected {
  color: var(--el-color-primary-light-5) !important;
}

.inactive {
  color: #dddddd !important;
  cursor: not-allowed !important;
}
</style>
