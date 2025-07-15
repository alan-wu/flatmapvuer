<template>
  <div class="legends-group">
    <div 
      class="legends-container"
      v-for="item in entry" 
      :key="item[identifierKey]" 
      :label="item[identifierKey]"
    >
      <div :class="item[styleKey]" :style="{ 'background-color': item[colourKey] }"></div>
      <div class="label">{{ capitalise(item[identifierKey]) }}</div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
export default {
  name: 'DynamicLegends',
  props: {
    identifierKey: {
      type: String,
      default: 'id',
    },
    colourKey: {
      type: String,
      default: 'colour',
    },
    styleKey: {
      type: String,
      default: 'style',
    },
    title: {
      type: String,
      default: '',
    },
    lists: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  computed: {
    entry: function () {
      return this.lists.filter((item) => {
        return item[this.identifierKey] !== 'Featured dataset marker'
      })
    },
  },
  methods: {
    capitalise: function (label) {
      return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
    },
  },
}
</script>

<style lang="scss" scoped>
.legends-group {
  padding: 5px 0;
}

.legends-container {
  width: 100%;
  display: flex;
  align-items: center;
  margin: 10px 12.5px;
  padding: 1px 0;
}

.circle {
  height: 20px;
  width: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
}

// hexagon
.star {
  width: 21px;
  height: 25px;
  background-color: #ffffff;
  opacity: 0.64;
  clip-path: path('M10.48 0.76 c-2.12 3.72 -6.12 6.04 -10.44 6.04 l-0.16 0.24 c2.04 3.6 2.04 8 0 11.6 l0.16 0.24 c4.28 0 8.32 2.32 10.44 6.04 c2.12 -3.72 6.12 -6.04 10.44 -6.04 c-2.12 -3.72 -2.12 -8.36 0 -12.16 C16.64 6.84 12.68 4.52 10.48 0.76z');
  -webkit-clip-path: path('M10.48 0.76 c-2.12 3.72 -6.12 6.04 -10.44 6.04 l-0.16 0.24 c2.04 3.6 2.04 8 0 11.6 l0.16 0.24 c4.28 0 8.32 2.32 10.44 6.04 c2.12 -3.72 6.12 -6.04 10.44 -6.04 c-2.12 -3.72 -2.12 -8.36 0 -12.16 C16.64 6.84 12.68 4.52 10.48 0.76z');
}

.label {
  margin-left: 14px;
  font-size: 12px;
  color: rgb(48, 49, 51);
}
</style>
