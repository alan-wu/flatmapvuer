<template>
  <div class="legend-group">
    <div
      class="legend-container"
      v-for="item in legends"
      :key="item[identifierKey]"
      :label="item[identifierKey]"
    >
      <template v-if="item[identifierKey] === 'Featured dataset marker'">
        <el-popover
          content="Location of the featured dataset"
          placement="right"
          :teleported="true"
          trigger="manual"
          width="max-content"
          popper-class="flatmap-popper flatmap-teleport-popper"
          :visible="showDatasetMarkerTooltip"
        >
          <template #reference>
            <LegendItem
              :item="item"
              :identifierKey="identifierKey"
              :styleKey="styleKey"
              :showStarInLegend="showStarInLegend"
            />
          </template>
        </el-popover>
      </template>
      <template v-else>
        <LegendItem
          :item="item"
          :identifierKey="identifierKey"
          :styleKey="styleKey"
          :showStarInLegend="showStarInLegend"
        />
      </template>
    </div>
  </div>
</template>

<script>
import LegendItem from './LegendItem.vue';

/* eslint-disable no-alert, no-console */
export default {
  name: "DynamicLegends",
  components: {
    LegendItem,
  },
  props: {
    identifierKey: {
      type: String,
      default: "id",
    },
    styleKey: {
      type: String,
      default: "style",
    },
    title: {
      type: String,
      default: "",
    },
    legends: {
      type: Array,
      default: function () {
        return [];
      },
    },
    showStarInLegend: {
      type: Boolean,
      default: false,
    },
    showDatasetMarkerTooltip: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.legend-group {
  padding: 6px 0;
}

.legend-container {
  width: max-content;
}
</style>
