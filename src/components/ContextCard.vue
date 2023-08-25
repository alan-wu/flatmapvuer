<template>
  <div class="context-card-container"  ref="container">
    <div v-show="showContextCard">
      <el-card v-loading="loading" class="context-card" >
        <div class="card-left">
          <img :src="banner" class="context-image">
        </div>
        <div class="card-right scrollbar">
          <div class="title">{{heading}}</div>
          <div>{{description}}</div>
            Flatmap published on:
            {{flatmapPublishedDisplay}}
            <br>
            SKAN version: <a :href="skanReleaseLink" target="_blank"> {{skanReleaseDisplay}} </a>
            <br>
            View dataset <a :href="flatmapSource" target="_blank">here</a>
          <br/>
        </div>
      </el-card>
    </div>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Link, Icon, Card, Button, Select, Input } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

// import { marked } from 'marked'
// import xss from 'xss'

locale.use(lang);
Vue.use(Link);
Vue.use(Icon);
Vue.use(Card);
Vue.use(Button);
Vue.use(Select);
Vue.use(Input);

// const addFilesToPathIfMissing = function(path){
//   if (!path.includes('files')){
//     return 'files/' + path
//   } else {
//     return path
//   }
// }

// const convertBackslashToForwardSlash = function(path){
//   path = path.replaceAll('\\','/')
//   path = path.replaceAll('\\\\', '/')
//   return path
// }

// const switchPathToDirectory = function(path){
//   let newPath = path.split('/')
//   newPath.pop()
//   return newPath.join('/')
// }


export default {
  name: "contextCard",
  props: {
    /**
     * Object containing information for
     * the required viewing.
     */
    mapImp: Object,
    banner: String
  },
  data: function () {
    return {
      contextData: {},
      showDetails: true,
      showContextCard: true,
      sampleDetails: {},
      loading: false
    };
  },
  computed: {
    flatmapPublishedDisplay: function() {
      let flatmapPublished = "Unknown"
      if(this.mapImp && this.mapImp.provenance){
        flatmapPublished = new Date(this.mapImp.provenance.created).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
      }
      return flatmapPublished 
    },
    skanReleaseDisplay: function() {
      let skanRelease = "Unknown"
      if(this.mapImp && this.mapImp.provenance){
        let isoTime = this.mapImp.provenance.sckan.created.replace(',', '.') // Date time does not accept commas but Sckan uses them
        skanRelease = new Date(isoTime).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
      }
      return skanRelease 
    },
    skanReleaseLink: function() {
      let skanRelease = "Unknown"
      if(this.mapImp && this.mapImp.provenance){
        skanRelease = this.mapImp.provenance.sckan.release
      }
      return skanRelease 
    },
    flatmapSource: function() {
      let flatmapSource = "Unknown"
      if(this.mapImp && this.mapImp.provenance){
        flatmapSource = this.mapImp.provenance.source
      }
      return flatmapSource
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/card";
@import "~element-ui/packages/theme-chalk/src/icon";
@import "~element-ui/packages/theme-chalk/src/input";
@import "~element-ui/packages/theme-chalk/src/link";
@import "~element-ui/packages/theme-chalk/src/select";

.hide{
  color: #e4e7ed;
  cursor: pointer;
}

.context-card{
  background-color: white;
  max-height: 10  50px;
  padding: 8px;
  font-size: 14px;
  margin-bottom: 18px;
  position: relative;
  border: solid 1px #e4e7ed;
  display: flex;
  width: 500px;
  max-height: 258px;
}

.context-card-view{
  cursor: pointer;
  padding-bottom: 8px;
  display: flex;
}

.view-image {
  width: 34px;
  height: 34px;
  flex: 1;
  margin-right: 4px;
}

.view-descriptions {
  flex: 8;
}

.context-card ::v-deep .el-card__body {
  padding: 0px;
  display: flex;
  width: 516px;
}

.context-image{
  width: 250px;
  height: auto;
}

.color-box {
  width: 16px;
  height: 16px;
  border: solid 1px $app-primary-color;
  border-radius: 2px;
  margin-right: 8px;
}

.card-left{
  flex: 1
}

.card-right {
  flex: 1.3;
  padding-left: 6px;
  overflow-y: scroll;
  scrollbar-width: thin;
}

.cursor-pointer {
  cursor: pointer;
}

.info{
  transform: rotate(180deg);
  color: $app-primary-color;
  margin-left: 8px;
}

.padding {
  padding-bottom: 8px;
}

.title{
  font-weight: bold;
}

.subtitle{
  font-weight: bold;
}

.scrollbar::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar {
  width: 12px;
  right: -12px;
  background-color: #f5f5f5;
}

.scrollbar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  background-color: #979797;
}

</style>
