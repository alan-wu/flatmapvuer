<template>
  <div class="legend-group">
    <div
      class="legend-container"
      v-for="item in legends"
      :key="item[identifierKey]"
      :label="item[identifierKey]"
    >
      <div
        v-if="legendStyle(item) === 'yellow-star'"
        :class="legendStyle(item)"
        v-html="showStarInLegend ? yellowstar : ''"
      ></div>
      <div v-else class="legend-item">
        <div
          :class="legendStyle(item)"
          :style="{ 'background-color': item[colourKey] }"
        ></div>
        <div class="label">{{ capitalise(item[identifierKey]) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import yellowstar from "../../icons/yellowstar";
/* eslint-disable no-alert, no-console */
export default {
  name: "DynamicLegends",
  props: {
    identifierKey: {
      type: String,
      default: "id",
    },
    colourKey: {
      type: String,
      default: "colour",
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
  },
  data: function () {
    return {
      yellowstar: yellowstar,
    };
  },
  methods: {
    capitalise: function (label) {
      return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    },
    legendStyle: function (item) {
      if (item[this.styleKey] === "star") {
        if (item[this.identifierKey] === "Featured dataset marker") {
          return "yellow-star";
        } else if (item[this.identifierKey] === "Gaglionated nerve plexus") {
          return "hexagon-star";
        }
      }
      return item[this.styleKey];
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

.legend-item {
  display: flex;
  align-items: center;
  margin: 8px 12.5px;
}

.circle {
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
}

.hexagon-star {
  width: 20px;
  height: 25px;
  background-color: #ffffff;
  opacity: 0.64;
  clip-path: path(
    "M9.96 0.72 c-2.01 3.53 -5.81 5.74 -9.92 5.74 l-0.15 0.23 c1.94 3.42 1.94 7.6 0 11.02 l0.15 0.23 c4.07 0 7.9 2.2 9.92 5.74 c2.01 -3.53 5.81 -5.74 9.92 -5.74 c-2.01 -3.53 -2.01 -7.94 0 -11.55 C15.81 6.5 12.04 4.29 9.96 0.72z"
  );
  -webkit-clip-path: path(
    "M9.96 0.72 c-2.01 3.53 -5.81 5.74 -9.92 5.74 l-0.15 0.23 c1.94 3.42 1.94 7.6 0 11.02 l0.15 0.23 c4.07 0 7.9 2.2 9.92 5.74 c2.01 -3.53 5.81 -5.74 9.92 -5.74 c-2.01 -3.53 -2.01 -7.94 0 -11.55 C15.81 6.5 12.04 4.29 9.96 0.72z"
  );
}

.label {
  margin-left: 14px;
  font-size: 12px;
  color: rgb(48, 49, 51);
}
</style>
