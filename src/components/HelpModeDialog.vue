<template>
  <div class="help-mode-dialog">
    <h4>Help Mode</h4>
    <p>Click "Next" to see the next item.</p>

    <div>
      <el-button class="button" v-if="lastItem"
        @click="finishHelp"
      >
        Finish
      </el-button>
      <el-button class="button" v-else
        @click="showNext"
      >
        Next
      </el-button>
    </div>
  </div>
</template>

<script>
  import {
    ElButton as Button,
  } from 'element-plus'

  export default {
    name: 'HelpModeDialog',
    components: {
      Button,
    },
    props: {
      lastItem: {
        type: Boolean,
        default: false,
        required: false,
      }
    },
    methods: {
      showNext: function () {
        console.log('show next')
      },
      finishHelp: function () {
        console.log('finish help')
      },
    }
  }
</script>

<style lang="scss" scoped>
  .help-mode-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 300px;
    padding: 1rem;
    background: white;
    box-shadow: 0px 0px 160px 80px rgba(0,0,0,0.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;

    h4 {
      color: $app-primary-color;
    }

    h4, p {
      margin: 0;
    }

    .button {
      color: #fff;
      background-color: $app-primary-color;

      &:hover {
        color: #fff !important;
        background: #ac76c5 !important;
        border: 1px solid #ac76c5 !important;
      }
    }
  }
</style>
