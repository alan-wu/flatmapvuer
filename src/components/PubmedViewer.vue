<template>
  <div class="pubmed-container">
      <div v-loading="loading.response" class="block">
        <div class="attribute-title">Pubmed Resources</div>
        <br/>
        <div class="attribute-content" v-for="(pub, i) in pubmeds" :key="i">
          <el-link  class="link" :href="pub.url" target="_blank" :underline="false">{{pub.title}}</el-link>
          <br/>
          <br/>
        </div> 
      </div>
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Link
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Link);


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
        fetch(`http://localhost:5000/pubmed/${pubmedId}`)
        .then(response => response.text())
        .then(data => {
          let pubmedDocument = new DOMParser().parseFromString(data, "text/html");
          resolve(pubmedDocument.querySelector('.heading-title').innerText)
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      })
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
        data.values.forEach(val => {
          this.titleFromPubmed(this.stripPMIDPrefix(val[0])).then(title=>{
            this.pubmeds.push({title: title, url: `https://pubmed.ncbi.nlm.nih.gov/${identifier}/`})
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
}

.el-link:hover {
  color: #8300bf;
  text-decoration: underline;
}

.el-link:focus {
  color: #8300bf;
  text-decoration: underline;
}
</style>