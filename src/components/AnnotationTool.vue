<template>
  <el-main class="main">
    <div class="block">
      <span class="title">Feature Annotations</span>
    </div>
  </el-main>
</template>


<script>
/* eslint-disable no-alert, no-console */
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Main } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Main);

export default {
  name: "AnnotationTool",
  props: {
    entry: {
      type: Object,
    },
  },
};
</script>

<style scoped lang="scss">
.block {
  margin-bottom: 0.5em;
}

.main {
  font-size: 14px;
  text-align: left;
  line-height: 1.5em;
  font-family: Helvetica;
  font-weight: 400;
  /* outline: thin red solid; */
  padding: 1em !important;
  overflow: hidden;
  min-width: 16rem;
}

.title {
  font-size: 18px;
  font-weight: 500;
  font-weight: bold;
  padding-bottom: 8px;
  color: rgb(131, 0, 191);
}
</style>
