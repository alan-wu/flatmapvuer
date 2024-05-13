<template>
  <div class="help-mode-dialog" :class="{'finish': lastItem}">
    <h4>Help Mode</h4>

    <template v-if="lastItem">
      <p>
        All caught up! <br>
        Click 'Help mode' to restart.
      </p>
      <div>
        <el-button class="button" @click="finishHelpMode">
          Finish
        </el-button>
      </div>
    </template>
    <template v-else>
      <p>Click "Next" to see the next item.</p>
      <div>
        <el-button class="button" @click="showNext">
          Next
        </el-button>
      </div>
    </template>
  </div>
</template>

<script>
  import {
    ElButton as Button,
  } from 'element-plus';

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
        this.$emit('show-next');
      },
      finishHelpMode: function () {
        this.$emit('finish-help-mode');
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
    font-family: inherit;
    font-size: 14px;
    background: white;
    box-shadow: 0px 0px 160px 80px rgba(0,0,0,0.5);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;

    &.finish {
      animation: shake 0.35s;
    }

    h4 {
      color: $app-primary-color;
    }

    h4, p {
      margin: 0;
    }

    p {
      line-height: 1.5;
    }

    .button {
      color: #fff;
      background-color: $app-primary-color;
      transform: scale(1);
      transform-origin: 50% 50%;
      transition: transform var(--el-transition-duration);

      &:hover {
        color: #fff !important;
        background: #ac76c5 !important;
        border: 1px solid #ac76c5 !important;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  @keyframes shake {
    0% {
      transform: translate(-50%, -50%) rotate(2deg);
    }
    25% {
      transform: translate(-50%, -50%) rotate(-2deg);
    }
    50% {
      transform: translate(-50%, -50%) rotate(2deg);
    }
    75% {
      transform: translate(-50%, -50%) rotate(-2deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(2deg);
    }
  }
</style>
