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
          :style="customStyle(item)"
        ></div>
        <div class="label">{{ capitalise(item[identifierKey]) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const starTemplate = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="<fillColor>" stroke="<borderColor>" stroke-width="<borderWidth>" d="M11.0748 3.25583C11.4141 2.42845 12.5859 2.42845 12.9252 3.25583L14.6493 7.45955C14.793 7.80979 15.1221 8.04889 15.4995 8.07727L20.0303 8.41798C20.922 8.48504 21.2841 9.59942 20.6021 10.1778L17.1369 13.1166C16.8482 13.3614 16.7225 13.7483 16.8122 14.1161L17.8882 18.5304C18.1 19.3992 17.152 20.0879 16.3912 19.618L12.5255 17.2305C12.2034 17.0316 11.7966 17.0316 11.4745 17.2305L7.60881 19.618C6.84796 20.0879 5.90001 19.3992 6.1118 18.5304L7.18785 14.1161C7.2775 13.7483 7.1518 13.3614 6.86309 13.1166L3.3979 10.1778C2.71588 9.59942 3.07796 8.48504 3.96971 8.41798L8.50046 8.07727C8.87794 8.04889 9.20704 7.80979 9.35068 7.45955L11.0748 3.25583Z"/></svg>'
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
    customStyle: function(item) {
      if (item[this.styleKey] === 'star') {
        let star = starTemplate.replace('<fillColor>', item[this.colourKey]);
        star = star.replace('<borderColor>', item.border);
        star = star.replace('<borderWidth>', item.border ? '2' : '0');
        star = 'data:image/svg+xml,' + encodeURIComponent(star);
        return { 'color': item[this.colourKey], 'background-image': `url(${star})` };
      } else {
        return { 'background-color': item[this.colourKey] };
      }
    },
    legendStyle: function (item) {
      if (item[this.styleKey] === "star") {
        if (item[this.identifierKey] === "Featured dataset marker") {
          if (!this.showStarInLegend) {
            return;
          }
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

.rounded-square {
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  border-radius: 20%;
  display: inline-block;
}

.square {
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  display: inline-block;
}

.exoid {
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

// .star {
//   margin: 10px 0;
//   scale: 0.7;
//   position: relative;
//   display: block;
//   width: 0px;
//   height: 0px;
//   border-right: 20px solid transparent;
//   border-bottom: 14px solid;
//   border-left: 20px solid transparent;
//   transform: rotate(35deg);
//   &:before {
//     border-bottom: 16px solid;
//     border-bottom-color: inherit;
//     border-left: 6px solid transparent;
//     border-right: 6px solid transparent;
//     position: absolute;
//     height: 0;
//     width: 0;
//     top: -9px;
//     left: -13px;
//     display: block;
//     content: '';
//     transform: rotate(-35deg);
//   }
//   &:after {
//     position: absolute;
//     display: block;
//     top: 0px;
//     left: -21px;
//     width: 0px;
//     height: 0px;
//     border-bottom-color: inherit;
//     border-right: 20px solid transparent;
//     border-bottom: 15px solid;
//     border-left: 20px solid transparent;
//     transform: rotate(-70deg);
//     content: '';
//   }
// }

.star {
  width: 25px;
  height: 25px;
  background-color: #ffffff !important;
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  margin: -3px;
  padding-right: 2px;
}

.label {
  margin-left: 14px;
  font-size: 12px;
  color: rgb(48, 49, 51);
}
</style>
