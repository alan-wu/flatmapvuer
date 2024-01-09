<template>
  <div class="container">
    <el-row>
      <el-col :span="12">
        <div class="title-text">Systems</div>
      </el-col>
    </el-row>
    <div class="tree-container">
      <el-tree
        ref="tree"
        node-key="key"
        show-checkbox
        :check-strictly="false"
        :data="treeData"
        :render-after-expand="false"
        :default-expanded-keys="defaultExpandedKeys"
        @check="checkChanged"
      >
        <template #default="{ node, data }">
          <span
            class="region-tree-node"
            :class="{
              activeItem: nodeIsActive(data),
              hoverItem: nodeIsHover(data),
            }"
            @click="changeActiveByNode(data)"
            @mouseover="changeHoverByNode(data)"
          >
            <div :style="getBackgroundStyles(data)">
              {{ node.label }}
            </div>
          </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import {
  ElCheckbox as Checkbox,
  ElCheckboxGroup as CheckboxGroup,
  ElColorPicker as ColorPicker,
  ElRow as Row,
  ElTree as Tree,
} from 'element-plus'

/**
 * A vue component for toggling visibility of various regions.
 */
export default {
  name: 'TreeControls',
  components: {
    Checkbox,
    CheckboxGroup,
    ColorPicker,
    Row,
    Tree,
  },
  props: {
    treeData: {
      type: Array,
      default: function () {
        return []
      },
    },
    active: {
      type: String,
      default: '',
    },
    hover: {
      type: String,
      default: '',
    },
  },
  data: function () {
    return {
      defaultExpandedKeys: ['All'],
    }
  },
  destroyed: function () {
    this.sortedPrimitiveGroups = undefined
  },
  methods: {
    nodeIsActive: function (data) {
      return this.active === data.models
    },
    nodeIsHover: function (data) {
      return this.hover === data.models
    },
    changeActiveByNode: function (data) {
      if (data.models) {
        this.$emit('change-active', data.models)
      }
    },
    changeHoverByNode: function () {
      //if (data.models) {
      //  this.$emit("change-active", data.models);
      //}
    },
    checkChanged: function (node, data) {
      const isChecked = data.checkedKeys.includes(node.key)
      if (node.key === 'All') {
        this.$emit('checkAll', isChecked)
      } else {
        this.$emit('changed', { key: node.key, value: isChecked })
      }
    },
    getBackgroundStyles: function (node) {
      if ('colour' in node) {
        return { background: node.colour }
      }
      return {}
    },
  },
}
</script>

<style lang="scss" scoped>
@use 'element-plus/theme-chalk/src/checkbox';
@use 'element-plus/theme-chalk/src/row';
@use 'element-plus/theme-chalk/src/tree';

.checkbox-container {
  display: flex;
  cursor: pointer;
}

.tree-controls {
  position: absolute;
  bottom: 0px;
  transition: all 1s ease;

  &:focus {
    outline: none;
  }
}

.container {
  text-align: left;
  overflow: none;
  padding-top: 7px;
  padding-bottom: 16px;
  background: #ffffff;
}

.title-text {
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

.tree-container {
  width: 260px;
  border: 1px solid rgb(144, 147, 153);
  border-radius: 4px;
  background: #ffffff;
  margin-top: 6px;
  scrollbar-width: thin;

  :deep(.el-tree) {
    max-height: 240px;
    min-height: 130px;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      box-shadow: inset 0 0 6px #c0c4cc;
    }
  }

  :deep(.el-tree-node__content) {
    height: 22px;
  }
}

:deep(.el-checkbox__input) {
  &.is-indeterminate,
  &.is-checked {
    .el-checkbox__inner {
      background-color: $app-primary-color;
      border-color: $app-primary-color;
    }
  }
}

:deep(
  .el-tree-node__children
  .el-tree-node__children
  .el-tree-node__content
  > label.el-checkbox) {
  display: none;
}

:deep(.el-checkbox__label) {
  padding-left: 5px;
  color: $app-primary-color !important;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
}

.activeItem {
  background-color: #bbb !important;
}

.region-tree-node {
  flex: 1;
  color: $app-primary-color !important;
  display: flex;
  font-size: 12px;
  line-height: 14px;
  padding-left: 0px;
  background-color: #fff;
  width: 100%;
}

.hoverItem {
  background-color: #eee !important;
}
</style>
