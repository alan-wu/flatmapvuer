<template>
  <div>
    <el-row>
      <el-col :span="12">
        <div class="checkall-display-text">{{labelName}}</div>
      </el-col>
      <el-col :span="12">
        <el-checkbox
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
      @change="handleCheckedChange"
    >
      <div class="checkbox-group-inner">
        <el-row v-for="item in selections" :key="item.type" :label="item.type">
          <div class="checkbox-container">
            <el-checkbox
              class="my-checkbox"
              :label="item.type"
              @change="visibilityToggle()"
              :checked="true"
            >
              <div class="path-visual" :class="item.type"></div>
              {{item.label}}
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
      this.checkedItems = this.selections.map(item => item.type);
      this.isIndeterminate = false;
      this.checkAll = true;
    },
    visibilityToggle: function() {
      this.$emit("changed", this.checkedItems);
    },
    handleCheckedChange: function(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.selections.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.selections.length;
    },
    handleCheckAllChange(val) {
      this.checkedItems = val ? this.selections.map(a => a.type) : [];
      this.isIndeterminate = false;
      this.$emit("changed", this.checkedItems);
    },
  },
  props: {
    labelName: {
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
  data: function() {
    return {
      checkedItems: [],
      isIndeterminate: false,
      checkAll: true,
    };
  },
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
  &.cns {
    background: #9b1fc1;
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

