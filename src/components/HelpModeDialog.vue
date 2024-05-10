<template>
  <div class="help-mode-dialog">
    <h4>Help Mode</h4>
    <p>Click "Next" to see the next item.</p>

    <el-button type="primary" v-if="lastItem">
      Finish
    </el-button>
    <el-button type="primary" v-else>
      Next
    </el-button>
  </div>
</template>

<script>
  export default {
    name: 'HelpModeDialog',
    props: {
      lastItem: {
        type: Boolean,
        default: false,
        required: false,
      }
    }
  }
</script>

<style type="scss" scoped>
  .help-mode-dialog {
    display: block;
    width: 300px;
    padding: 1rem;
    background: white;
    box-shadow: 0px 0px 160px 80px rgba(0,0,0,0.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    h4 {
      margin-top: 0;
    }

    h4, p {
      margin-bottom: 1rem;
    }
  }
</style>
