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
  CarouselItem
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Link);
Vue.use(Carousel);
Vue.use(CarouselItem);


export default {
  name: "Tooltip",
  props: { 
    featureId: {
      type: String,
      default: ''
    },
  },
  watch: {
    'featureId': function (val){
      console.log('feature id watch triggered', val)
      this.flatmapQuery(val)
    }
  },
  data: function() {
    return {
      pubmeds: [],
      loading: {response: true, publications: true}
    };
  },
  mounted: function() {
    this.flatmapQuery(this.featureId)
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
    flatmapQuery: function(identifier){
      this.pubmeds = []
      this.loading.response = true
      const data = { sql: 'select publication from publications where entity=?', "params": [identifier]};
      fetch('https://mapcore-demo.org/devel/flatmap/v1/knowledge/query/', {
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
        data.values.forEach(identifier => {
          this.titleFromPubmed(this.stripPMIDPrefix(identifier[0])).then( bib=>{
            let [html, link] = this.splitLink(bib)
            this.pubmeds.push({identifier: identifier[0] , html: html, url: link})
          })
        });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
   
  }
};
</script>

<style scoped>
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
  color: #8300bf;
  text-decoration: none;
  word-wrap: break-word;
}

.el-link:hover {
  color: #8300bf;
  text-decoration: underline;
}

.el-link:focus {
  color: #8300bf;
  text-decoration: underline;
}

>>> .el-carousel__button {
  background-color: rgb(131, 0, 191)  
}

</style>