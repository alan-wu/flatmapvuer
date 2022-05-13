<template>
  <div class="pubmed-container">
      <div v-loading="loading.response" class="block">
        <div class="attribute-title">Pubmed Resources</div>
        <br/>
        <el-carousel 
          :autoplay="false" 
          indicator-position="outside"
          height="250px" width="200px"
        >
          <el-carousel-item v-for="(pub, i) in pubmeds" :key="i">
            <div class="attribute-content">
                <div v-html="pub.html"/>
                <el-link :href="pub.url" :underline="false" class="el-link" target="_blank">{{pub.url}}</el-link>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Link,
  Carousel,
  CarouselItem,
  Button
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Link);
Vue.use(Carousel);
Vue.use(CarouselItem);
Vue.use(Button);


export default {
  name: "Tooltip",
  props: {
        /**
     * Specify the endpoint of the flatmap server.
     */
    flatmapAPI: {
      type: String,
      default: 'https://mapcore-demo.org/current/flatmap/v2/'
    },
    entry: {
      type: Object,
      default: () => {}
    },
  },
  watch: {
    'entry.featureId': function (val){
      this.flatmapQuery(val).then(pb => this.pubmeds = pb)
    },
    'entry.featureIds': {
      handler: function(ids) {
        this.flatmapQuery(ids)
      }
    }
  },
  data: function() {
    return {
      data: {},
      pubmeds: [],
      pubmedIds: [],
      loading: {response: true, publications: true}
    };
  },
  mounted: function() {
    if (this.entry.featureIds)
      this.flatmapQuery(this.entry.featureIds)
  },
  methods: {
    stripPMIDPrefix: function (pubmedId){
      return pubmedId.split(':')[1]
    },
    titleFromPubmed: function (pubmedId){
      return new Promise((resolve) => {
        fetch(`https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/pubmed/?format=citation&contenttype=json&id=${pubmedId}`)
        .then(response => response.json())
        .then(data => {
          resolve(data.apa.format)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      })
    },
    splitLink(bibliographyString){
      let split = bibliographyString.split('https')
      return [split[0], 'https' + split[1]]
    },
    buildPubmedSqlStatement: function(keastIds) {
      let sql = 'select distinct publication from publications where entity in ('
      if (keastIds.length === 1) {
        sql += `'${keastIds[0]}')`
      } else if (keastIds.length > 1) {
        for (let i in keastIds) {
          sql += `'${keastIds[i]}'${i >= keastIds.length - 1 ? ')' : ','} `
        }
      }
      return sql
    },
    flatmapQuery: function(keastIds){
      if(!keastIds || keastIds.length === 0) return
      this.pubmeds = []
      this.loading.response = true

      // fetch pubmed publications for the given ids
      const data = { sql: this.buildPubmedSqlStatement(keastIds)};
      console.log(data)
      fetch(`${this.flatmapAPI}knowledge/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(data => {
        this.responseData = data
        this.loading.response = false

        // create links for each pubmedId
        data.values.forEach(identifier => {
          let ids = this.stripPMIDPrefix(identifier[0])
          this.titleFromPubmed(ids).then( bib=>{
            let [html, link] = this.splitLink(bib)
            this.pubmeds.push({identifier: identifier[0] , html: html, url: link})
          })
        });
        this.$emit('pubmedSearchUrl', this.pubmedSearchUrl(data.values.map(id=>this.stripPMIDPrefix(id[0]))))
      })
      .catch((error) => {
        console.error('Error:', error);
    })
    },
    pubmedSearchUrl: function(ids) {
      let url = 'https://pubmed.ncbi.nlm.nih.gov/?'
      let params = new URLSearchParams()
      params.append('term', ids)
      return url + params.toString()
    }
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
    text-decoration: underline;
  }
}

::v-deep .el-carousel__button {
  background-color: $app-primary-color;  
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