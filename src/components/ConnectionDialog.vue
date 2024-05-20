<template>
  <div class="dialog-container">
    <el-row>
      <span class="dialog-title" v-if="inDrawing">Finalise drawing</span>
      <span class="dialog-title" v-else>Visualise connection</span>
      <el-row v-if="inDrawing">
        <el-col :span="13">
          <el-button type="primary" plain @click="$emit('confirmDrawn', true)">
            Confirm
          </el-button>
        </el-col>
        <el-col :span="11">
          <el-button type="primary" plain @click="$emit('cancelDrawn', true)">
            Cancel
          </el-button>
        </el-col>
      </el-row>
      <el-row v-else>
        <el-button type="primary" plain @click="$emit('dialogDisplay', false)">
          Close
        </el-button>
      </el-row>
    </el-row>
    <el-row v-if="connection">
      <el-col>
        <b><span>Related Features</span></b>
        <el-row v-for="(value, key) in connectionEntry" :key="key">
          <el-col :span="20">
            <el-card shadow="hover" @click="handleTooltipOpen(key)">
              <span>{{ capitalise(value.label) }}</span>
            </el-card>
          </el-col>
          <el-col :span="4" v-if="key === tooltipId">
            <el-icon>
              <el-icon-circle-close @click="handleTooltipClose(key)" />
            </el-icon>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import { CircleClose as ElIconCircleClose } from "@element-plus/icons-vue";
import { ElRow as Row, ElCol as Col, ElCard as Card } from "element-plus";

export default {
  name: "ConnectionDialog",
  components: {
    Row,
    Col,
    Card,
  },
  props: {
    connectionEntry: {
      type: Object,
    },
    inDrawing: {
      type: Boolean,
      default: false,
    },
    connection: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      tooltipId: undefined,
    };
  },
  watch: {
    connection: function () {
      this.tooltipId = undefined;
    },
  },
  methods: {
    capitalise: function (label) {
      return label[0].toUpperCase() + label.slice(1);
    },
    handleTooltipOpen: function (value) {
      this.tooltipId = value;
      this.$emit("showFeatureTooltip", value);
    },
    handleTooltipClose: function (value) {
      this.tooltipId = undefined;
      this.$emit("hideFeatureTooltip", value);
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-container {
  width: 200px;
  height: fit-content;
  text-align: justify;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  background: #fff;
  border: 1px solid $app-primary-color;
  display: flex;
  flex-direction: column;
  padding: 0.8em;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: rgb(131, 0, 191);
}

.el-icon {
  cursor: pointer;
}

:deep(.el-card) {
  --el-card-padding: 8px;
  border: 0;
  cursor: pointer;
}
</style>
