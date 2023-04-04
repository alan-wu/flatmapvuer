<template>
  <div>
    <el-row>
      <el-col :span="12">
        <div class="title-display-text">{{ title }}</div>
      </el-col>
    </el-row>
    <div class="legends-group">
      <el-row
        v-for="item in lists"
        :key="item[identifierKey]"
        :label="item[identifierKey]"
      >
        <div class="legends-container">
          <div
            class="legends-visual"
            :style="{ background: item[colourKey] }"
          ></div>
          <div class="label">
            {{ capitalise(item[identifierKey]) }}
          </div>
        </div>
      </el-row>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Col, Row } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

locale.use(lang);
Vue.use(Col);
Vue.use(Row);

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
    title: {
      type: String,
      default: "",
    },
    lists: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  methods: {
    capitalise: function (label) {
      return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/row";

.legends-visual {
  margin: 2px;
  width: 11px;
  margin-right: 5px;
  display: inline-block;
}

.title-display-text {
  width: 59px;
  height: 20px;
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
  margin-left: 8px;
}

.label {
  padding-left: 35px;
  color: $app-primary-color;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
}

.legends-container {
  display: flex;
  cursor: pointer;
}

.legends-group {
  width: 224;
  border: 1px solid rgb(144, 147, 153);
  border-radius: 4px;
  background: #ffffff;
  padding: 18px;
}
</style>

