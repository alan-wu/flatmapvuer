<template>
  <div class="pubmed-container">
    <!-- To view old pubmed display go to: https://github.com/Tehsurfer/flatmapvuer/commit/eca131f8d32cdcac4d136d1722d7fe4df25f6c3a -->
  </div>
</template>


<script>
/* eslint-disable no-alert, no-console */

export default {
  name: "Tooltip",
  props: {
    entry: {
      type: Object,
      default: () => {}
    },
  },
  watch: {
    'entry.featureId': function (val){
      this.pubmedQueryOnIds(val).then(pb => this.pubmeds = pb)
    },
    'entry.featureIds': {
      handler: function(ids) {
        this.pubmedQueryOnIds(ids)
      }
    }
  },
  inject: ['flatmapAPI'],
  data: function() {
    return {
      pubmeds: [],
      pubmedIds: [],
    };
  },
  mounted: function() {
    if (this.entry.featureIds)
      this.pubmedQueryOnIds(this.entry.featureIds)
  },
  methods: {
    stripPMIDPrefix: function (pubmedId){
      return pubmedId.split(':')[1]
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
    buildPubmedSqlStatementForModels: function(model) {
      return `select distinct publication from publications where entity = '${model}'`
    },
    flatmapQuery: function(sql){
      const data = { sql: sql}
      return fetch(`${this.flatmapAPI}knowledge/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .catch((error) => {
        console.error('Error:', error)
      })
    },
    pubmedQueryOnIds: function(keastIds){
      if(!keastIds || keastIds.length === 0) return
      const sql = this.buildPubmedSqlStatement(keastIds)
      this.flatmapQuery(sql).then(data=>{
        this.responseData = data
        // Create pubmed url on paths if we have them
        if (data.values.length > 0){
          this.$emit('pubmedSearchUrl', this.pubmedSearchUrl(data.values.map(id=>this.stripPMIDPrefix(id[0]))))
        } else { // Create pubmed url on models
          this.pubmedQueryOnModels(this.entry.source)
        }
      })
    },
    pubmedQueryOnModels(source){
      this.flatmapQuery(this.buildPubmedSqlStatementForModels(source)).then(data=>{
        if (data.values.length > 0){
          this.$emit('pubmedSearchUrl', this.pubmedSearchUrl(data.values.map(id=>this.stripPMIDPrefix(id[0]))))
        } else {
          this.$emit('pubmedSearchUrl', '') // Clears the pubmed search button 
        } 
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