// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import FlatmapVuer from "./FlatmapVuer.vue";


const Components = {
  FlatmapVuer
};
  
Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});
  
export default Components;
  