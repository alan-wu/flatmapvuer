<template>
  <el-main class="main">
    <div class="block">
      <el-row class="info-field">
        <span class="title">Feature Annotations</span>
      </el-row>
      <template v-if="annotationEntry">
        <el-row
          v-for="(key, label) in displayPair"
          v-show="annotationEntry[key]"
          class="dialog-text"
          :key="key"
        >
            <strong>{{ label }}: </strong> {{ annotationEntry[key] }}
        </el-row>
        <template v-if="prevSubs.length > 0">
          <div v-show="showSubmissions" class="hide" @click="showSubmissions = false">
            Hide previous submissions
            <i class="el-icon-arrow-up"></i>
          </div>
          <div v-show="!showSubmissions" class="hide" @click="showSubmissions = true">
            Show previous submissions
            <i class="el-icon-arrow-down"></i>
          </div>
          <template v-if="showSubmissions">
            <el-row class="dialog-spacer"></el-row>
            <el-row class="dialog-text">
              <strong class="sub-title">Previous submissions:</strong>
            </el-row>
            <div class="entry" v-for="(sub, index) in prevSubs" :key="index">
              <el-row class="dialog-text">
                <strong>{{ sub.timestamp }}</strong> Anonoymous
              </el-row>
              <el-row class="dialog-text">
                <strong>Evidence: </strong> {{ sub.evidence.join(', ') }}
              </el-row>
              <el-row class="dialog-text">
                <strong>Comment: </strong> {{ sub.comment }}
              </el-row>
            </div>
          </template>
        </template>
        <el-row class="dialog-spacer"></el-row>
        <el-row v-if="!editing">
          <i
            class="el-icon-edit standard-icon"
            @click="editing = true"
          />
        </el-row>
        <template v-else>
          <el-row class="dialog-text">
            <strong class="sub-title">Suggest changes:</strong>
          </el-row>
          <el-row class="dialog-text">
            <strong>Evidvence:</strong>
          </el-row>
          <el-row v-for="(value, index) in evidence" :key="value">
            <el-col :span="20">   
              {{ evidence[index] }}
            </el-col>
            <el-col :span="4">
              <i
                class="el-icon-close standard-icon"
                @click="removeEvidence(index)"
              />
            </el-col>
          </el-row>
          <el-row>
            <el-input
              size="mini"
              placeholder="Enter"
              v-model="newEvidence"
              @change="evidenceEntered($event)"
            >
              <el-select
                :popper-append-to-body="false"
                v-model="evidencePrefix"
                placeholder="Select"
                class="select-box"
                popper-class="flatmap_dropdown"
                slot="prepend"
              >
                <el-option v-for="item in evidencePrefixes" :key="item" :label="item" :value="item">
                  <el-row>
                    <el-col :span="12">{{ item }}</el-col>
                  </el-row>
                </el-option>
              </el-select>
            </el-input>
          </el-row>
          <el-row>
            <strong>Comment:</strong>
          </el-row>
          <el-row class="dialog-text">
            
            <el-input
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4}"
              placeholder="Enter"
              v-model="comment"
            />
          </el-row>
            <el-row class="dialog-text">
              <el-button
                class="button"
                type="primary"
                plain
                @click="submit"
              >
                Submit
              </el-button>
          </el-row>
        </template>
      </template>
    </div>
  </el-main>
</template>


<script>
/* eslint-disable no-alert, no-console */
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import { Button, Col, Input, Main, Row, Select } from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";
locale.use(lang);
Vue.use(Button);
Vue.use(Col);
Vue.use(Input);
Vue.use(Main);
Vue.use(Row);
Vue.use(Select);

export default {
  name: "AnnotationTool",
  props: {
    annotationEntry: {
      type: Object,
    },
  },
  data: function() {
    return {
      displayPair: {
        "Feature": "id",
        "Tooltip": "label",
        "Models": "models",
        "Name": "name",
        "Map layer": "layer",
      },
      editing: false,
      evidencePrefixes:  [
        "DOI:",
        "PMID:",
      ],
      evidencePrefix: "DOI:", 
      evidence: [ ],
      newEvidence: '',
      comment: '',
      submissions: [ ],
      showSubmissions: true
    }
  },
  computed: {
    prevSubs: function() {
      return this.submissions.filter(sub => {
        if (this.annotationEntry) {
          if (sub.id === this.annotationEntry.id && 
            sub.layer === this.annotationEntry.layer) {
              return true;
            }
        }
        return false;
      });
    }
  },
  methods: {
    evidenceEntered: function(value) {
      if (value) {
        this.evidence.push(this.evidencePrefix + value);
        this.newEvidence = "";
      }
    },
    submit: function() {
      const now = new Date();
      if ((this.evidence.length > 0) || this.comment) {
        this.submissions.push( {
          id: this.annotationEntry['id'],
          layer: this.annotationEntry['layer'],
          evidence: this.evidence,
          comment: this.comment,
          timestamp: now.toLocaleString(),
        });
        this.resetSubmission();
      }
    },
    removeEvidence: function(index) {
      this.evidence.splice(index, 1);
    },
    resetSubmission: function() {
      this.editing = false;
      this.evidence = [];
      this.newFeature = '';
      this.comment = '';
    },
  },
  watch: {
    annotationEntry: {
      handler: function() {
        this.resetSubmission();
      },
      immediate: false,
      deep: false,
    }
  }
};
</script>

<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/button";
@import "~element-ui/packages/theme-chalk/src/col";
@import "~element-ui/packages/theme-chalk/src/input";
@import "~element-ui/packages/theme-chalk/src/main";
@import "~element-ui/packages/theme-chalk/src/row";
@import "~element-ui/packages/theme-chalk/src/select";

.info-field {
  display:flex;
}

.block {
  margin-bottom: 0.5em;
}

.button {
  padding-top:5px;
  padding-bottom:5px;
}

.standard-icon {
  color: $app-primary-color;
  &:hover {
    cursor: pointer;
  }
}

.dialog-text {
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
}

.main {
  font-size: 14px;
  text-align: left;
  line-height: 1.5em;
  font-family: Asap, sans-serif,Helvetica;
  font-weight: 400;
  /* outline: thin red solid; */
  padding: 1em !important;
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 20rem;
  max-height: 400px;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 6px #c0c4cc;
  }
}

.title {
  font-size: 18px;
  font-weight: 500;
  font-weight: bold;
  padding-bottom: 8px;
  color: rgb(131, 0, 191);
}

.sub-title {
  font-size: 16px;
}


.dialog-spacer {
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.submit {
  color: $app-primary-color;
  &:hover {
    cursor: pointer;
  }
}

.entry ~ .entry {
  border-top: 1px solid #e4e7ed;
  margin-top: 10px;
}

.hide{
  color: $app-primary-color;
  cursor: pointer;
  margin-right: 6px;
  margin-top: 3px;
}

::v-deep .el-input__inner, ::v-deep .el-textarea__inner{
  font-family: Asap, sans-serif;
}

.select-box {
  width:80px;
  background-color: var(--white);
  font-weight: 500;
  color:rgb(48, 49, 51);;
  ::v-deep .el-input__inner {
    height:30px;
    color: rgb(48, 49, 51);
  }
  ::v-deep .el-input__icon {
    line-height:30px
  }
}

::v-deep .flatmap_dropdown {
  min-width: 80px!important;
  .el-select-dropdown__item {
    white-space: nowrap;
    text-align: left;
    &.selected {
      color: $app-primary-color;
      font-weight: normal;
    }
  }
}
</style>
