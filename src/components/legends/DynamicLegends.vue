<template>
  <div class="legend-group">
    <div
      class="legend-container"
      v-for="item in legends"
      :key="item[identifierKey]"
      :label="item[identifierKey]"
    >
      <div class="legend-item" v-if="legendStyle(item)">
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
  methods: {
    capitalise: function (label) {
      return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    },
    legendStyle: function (item) {
      if (item[this.styleKey] === "star") {
        if (item[this.identifierKey] === "Featured dataset marker") {
          if (!this.showStarInLegend) {
            return;
          }
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

.yellow-star {
  width: 20px;
  height: 20px;
  background-color: #ffffff !important;
  background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20fill%3D%22yellow%22%20stroke%3D%22%23000%22%20stroke-width%3D%222%22%20d%3D%22M11.0748%203.25583C11.4141%202.42845%2012.5859%202.42845%2012.9252%203.25583L14.6493%207.45955C14.793%207.80979%2015.1221%208.04889%2015.4995%208.07727L20.0303%208.41798C20.922%208.48504%2021.2841%209.59942%2020.6021%2010.1778L17.1369%2013.1166C16.8482%2013.3614%2016.7225%2013.7483%2016.8122%2014.1161L17.8882%2018.5304C18.1%2019.3992%2017.152%2020.0879%2016.3912%2019.618L12.5255%2017.2305C12.2034%2017.0316%2011.7966%2017.0316%2011.4745%2017.2305L7.60881%2019.618C6.84796%2020.0879%205.90001%2019.3992%206.1118%2018.5304L7.18785%2014.1161C7.2775%2013.7483%207.1518%2013.3614%206.86309%2013.1166L3.3979%2010.1778C2.71588%209.59942%203.07796%208.48504%203.96971%208.41798L8.50046%208.07727C8.87794%208.04889%209.20704%207.80979%209.35068%207.45955L11.0748%203.25583Z%22/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
}

.label {
  margin-left: 14px;
  font-size: 12px;
  color: rgb(48, 49, 51);
}
</style>
