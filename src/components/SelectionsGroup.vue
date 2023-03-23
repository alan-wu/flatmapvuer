<template>
  <div>
    <el-row>
      <el-col :span="12">
        <div class="checkall-display-text">{{title}}</div>
      </el-col>
      <el-col :span="12">
        <el-checkbox
          v-if="selections && selections.length > 1"
          class="all-checkbox"
          :indeterminate="isIndeterminate"
          v-model="checkAll"
          @change="handleCheckAllChange"
        >Display all</el-checkbox>
      </el-col>
    </el-row>
    <el-checkbox-group
      v-model="checkedItems"
      size="small"
      class="checkbox-group"
      @change="handleCheckedItemsChange"
    >
      <div class="checkbox-group-inner">
        <el-row v-for="item in selections" :key="item[identifierKey]" :label="item[identifierKey]">
          <div class="checkbox-container">
            <el-checkbox
              class="my-checkbox"
              :label="item[identifierKey]"
              @change="visibilityToggle(item[identifierKey], $event)"
              :checked="!(('enable' in item) && item.enable === false)">
              <div class="path-visual" :class="item[identifierKey]"></div>
              {{item[labelKey]}}
            </el-checkbox>
          </div>
        </el-row>
      </div>
    </el-checkbox-group>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import Vue from "vue";
import {
  Checkbox,
  CheckboxGroup,
  Col,
  Row
} from "element-ui";
import lang from "element-ui/lib/locale/lang/en";
import locale from "element-ui/lib/locale";

locale.use(lang);
Vue.use(Checkbox);
Vue.use(CheckboxGroup);
Vue.use(Col);
Vue.use(Row);


export default {
  name: "SelectionsGroup",
  methods: {
    /**
     * Function to toggle paths to default.
     * Also called when the associated button is pressed.
     */
    reset: function() {
      this.checkAll = true;
      this.checkedItems = [];
      this.selections.forEach(item => {
        if (!(('enable' in item) && item.enable === false)) {
          this.checkedItems.push(item[this.identifierKey]);
        } else {
          this.checkAll = false;
        }
      });
    },
    visibilityToggle: function(key, value) {
      this.$emit("changed", {key, value});
    },
    handleCheckedItemsChange: function(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.selections.length;
    },
    handleCheckAllChange(val) {
      this.checkedItems = val ? this.selections.map(a => a[this.identifierKey]) : [];
      this.$emit("checkAll",
      {
        keys: this.selections.map(a => a[this.identifierKey]),
        value: val
      });
    },
  },
  props: {
    identifierKey: {
      type: String,
      default: "id"
    },
    labelKey: {
      type: String,
      default: "label"
    },
    title: {
      type: String,
      default: ""
    },
    selections: {
      type: Array,
      default: function() {
        return [];
      },
    },
  },
  computed: {
    isIndeterminate: function() {
      const count = this.checkedItems.length;
      if ((count === 0) || this.checkAll){
        return false;
      }
      return true;
    }
  },
  data: function() {
    return {
      checkedItems: [],
      checkAll: true,
    };
  },
  mounted: function() {
    this.reset();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~element-ui/packages/theme-chalk/src/checkbox";
@import "~element-ui/packages/theme-chalk/src/checkbox-group";
@import "~element-ui/packages/theme-chalk/src/row";

.path-visual {
  margin: 3px 0;
  height: 3px;
  width: 25px;
  margin-right: 5px;
  display: inline-block;
  &.arterial {
    background: #f00;
  }
  &.cns {
    background: #9b1fc1;
  }
  &.centreline {
    background: repeating-linear-gradient(
      90deg,
      #2f6eba,
      #2f6eba 6px,
      transparent 0,
      transparent 9px
    );
  }
  &.intracardiac {
    background: repeating-linear-gradient(
      90deg,
      #f19e38,
      #f19e38 6px,
      transparent 0,
      transparent 9px
    );
  }
  &.lcn {
    background: #f19e38;
  }
  &.para-pre {
    background: #3f8f4a;
  }
  &.para-post {
    background: repeating-linear-gradient(
      90deg,
      #3f8f4a,
      #3f8f4a 6px,
      transparent 0,
      transparent 9px
    );
  }
  &.sensory {
    background: #2a62f6;
  }
  &.somatic {
    background: #98561d;
  }
  &.symp-pre {
    background: #ea3423;
  }
  &.symp-post {
    background: repeating-linear-gradient(
      90deg,
      #ea3423,
      #ea3423 6px,
      transparent 0,
      transparent 9px
    );
  }
  &.venous {
    background: #2f6eba;
  }
  &.other {
    background: #888;
  }
}

.checkall-display-text {
  width: 59px;
  height: 20px;
  color: rgb(48, 49, 51);
  font-size: 14px;
  font-weight: normal;
  line-height: 20px;
  margin-left: 8px;
}

.all-checkbox {
  float: right;
}

.checkbox-container {
  display: flex;
  cursor: pointer;
}

.checkbox-group {
  width: 260px;
  border: 1px solid rgb(144, 147, 153);
  border-radius: 4px;
  background: #ffffff;
}

.my-checkbox {
  background-color: #fff;
  width: 100%;
}

.checkbox-group-inner {
  padding: 18px;
}

::v-deep .el-checkbox__label {
  padding-left: 5px;
  color: $app-primary-color;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
}

::v-deep .el-checkbox__input {
  &.is-indeterminate,
  &.is-checked {
    .el-checkbox__inner {
      background-color: $app-primary-color;
      border-color: $app-primary-color;
    }
  }
}

::v-deep .el-checkbox__label {
  color: $app-primary-color !important;
}

</style>

