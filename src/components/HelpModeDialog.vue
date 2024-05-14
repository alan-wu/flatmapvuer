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
  import EventBus from './EventBus';

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
    mounted: function () {
      this.toggleHelpModeHighlight(true);
      // 'shown-tooltip' is emitted from FlatmapVuer component
      EventBus.on('shown-tooltip', this.toggleTooltipHighlight);
    },
    unmounted: function () {
      this.toggleHelpModeHighlight(false);
    },
    methods: {
      showNext: function () {
        this.$emit('show-next');
      },
      finishHelpMode: function () {
        this.$emit('finish-help-mode');
      },
      toggleTooltipHighlight: function () {
        this.$nextTick(() => {
          const activePoppers = document.querySelectorAll('.el-popper:not([style*="none"])');
          activePoppers.forEach((activePopper) => {
            if (activePopper.classList.contains('el-fade-in-linear-enter-active')) {
              this.toggleOpacity(activePopper);
            }
          });
        });
      },
      toggleOpacity: function (el) {
        const prevEl = el.previousElementSibling;
        const popperId = el.id;
        const targetPin = document.querySelector(`[aria-describedby="${popperId}"]`);
        const currentFlatmapEl = this.getCurrentFlatmapContainer();
        const classNames = ['bottom-right-control', 'settings-group', 'pathway-location', 'beta-popovers'];

        classNames.forEach((className) => {
          const classNameSelector = '.' + className;
          const otherEls = currentFlatmapEl.querySelectorAll(classNameSelector);
          const targetEl = el.closest(classNameSelector);

          otherEls.forEach((otherEl) => {
            if (otherEl) {
              if (otherEl !== targetEl) {
                otherEl.classList.remove('in-help-highlight');
              } else {
                otherEl.classList.add('in-help-highlight');
              }

              // for pathway-location popover
              if (prevEl && prevEl.classList.contains(className)) {
                prevEl.classList.add('in-help-highlight');
              }
            }
          });

          // for teleported popover
          if (targetPin && targetPin.closest(classNameSelector)) {
            targetPin.closest(classNameSelector).classList.add('in-help-highlight');
          }
        });
      },
      getCurrentContainer: function () {
        const multiContainer = this.$parent;
        const multiContainerEl = multiContainer?.$el || null;
        return multiContainerEl;
      },
      getCurrentFlatmapContainer: function () {
        const multiContainer = this.$parent;
        const currentFlatmap = multiContainer?.getCurrentFlatmap() || null;
        const currentFlatmapEl = currentFlatmap?.$el || null;
        return currentFlatmapEl;
      },
      toggleHelpModeHighlight: function (option) {
        const multiContainerEl = this.getCurrentContainer();
        const currentFlatmapEl = this.getCurrentFlatmapContainer();
        const allHighlightedItems = document.querySelectorAll('.in-help-highlight');

        if (multiContainerEl) {
          if (option) {
            multiContainerEl.classList.add('in-help');
          } else {
            multiContainerEl.classList.remove('in-help');
          }
        }

        if (currentFlatmapEl) {
          if (option) {
            currentFlatmapEl.classList.add('in-help');
          } else {
            currentFlatmapEl.classList.remove('in-help');
          }
        }

        if (!option) {
          allHighlightedItems.forEach((el) => {
            el.classList.remove('in-help-highlight');
          });
        }
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
    border-radius: 4px 4px;
    border: 1px solid $app-primary-color;
    box-shadow: 0px 0px 160px 80px rgba(0,0,0,0.5);
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;

    &.finish {
      animation: shake 0.35s;
      animation-delay: 0.7s;
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
      transform: translateX(-50%) rotate(2deg);
    }
    25% {
      transform: translateX(-50%) rotate(-2deg);
    }
    50% {
      transform: translateX(-50%) rotate(2deg);
    }
    75% {
      transform: translateX(-50%) rotate(-2deg);
    }
    100% {
      transform: translateX(-50%) rotate(2deg);
    }
  }

  // Just for App.vue with options popover on top
  .help-mode-dialog {
    .options-popover + .multi-container & {
      margin-top: 40px;
    }
    .options-popover:not([style*="display: none"]) + .multi-container & {
      margin-top: 175px;
    }
  }
</style>

<style lang="scss">
  .multi-container.in-help {
    background: rgba(0,0,0,0.3);
  }

  .flatmap-container.in-help {
    .beta-popovers,
    .bottom-right-control,
    .pathway-location,
    .settings-group,
    .maplibregl-canvas,
    .maplibregl-ctrl-minimap {
      opacity: 0.3;
    }

    .maplibregl-canvas {
      pointer-events: none;
    }
  }

  .in-help .el-popper:not([style*="none"]) {
    opacity: 1 !important;
  }

  .in-help-highlight {
    opacity: 1 !important;
    background: white !important;
    box-shadow: 0px 0px 128px 128px white !important;
    animation: highlight-area 0.1s;
  }
</style>
