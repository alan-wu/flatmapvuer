<template>
  <div class="resource-container">

    <span class="attribute-title">Resources</span>
    <template v-for="resource in resources">
      <div class="resource" :key="resource.id">
        <div><strong>{{capitalise(resource.id)}}</strong></div>
        <el-link :href="resource.url" target="_blank" class="el-link">{{resource.url}}</el-link>
      </div>
    </template>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { link } from "element-ui";
Vue.use(link);

export default {
  name: "ExternalResourceCard",
  props: {
    resources: {
      type: Array,
      default: () => []
    },
  },
  data: function() {
    return {
      pubmeds: [],
      pubmedIds: [],
    };
  },
  methods: {
    capitalise: function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
  }
};
</script>

<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/link";
@import "~element-ui/packages/theme-chalk/src/carousel";
@import "~element-ui/packages/theme-chalk/src/carousel-item";

.attribute-title{
  font-size: 16px;
  font-weight: 600;
  /* font-weight: bold; */
  text-transform: uppercase;
}

.attribute-content{
  font-size: 14px;
  font-weight: 400;
}

.el-link {
  color: $app-primary-color;
  text-decoration: none;
  word-wrap: break-word;
  &:hover, &:focus{
    color: $app-primary-color;
  }
}

::v-deep .el-carousel__button {
  background-color: $app-primary-color;  
}

.attribute-title{
  font-size: 16px;
  font-weight: 600;
  /* font-weight: bold; */
  text-transform: uppercase;
}

.button {
  margin-left: 0px !important;
  margin-top: 0px !important;
  font-size: 14px !important;
  background-color: $app-primary-color;
  color: #fff;
  &:hover{
    color: #fff !important;
    background: #ac76c5 !important;
    border: 1px solid #ac76c5 !important;
  }
  &+.button {
    margin-top: 10px !important;
    background-color: $app-primary-color;
    color: #fff; 
  }
}

</style>