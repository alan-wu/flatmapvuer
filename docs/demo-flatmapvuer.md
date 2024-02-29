# FlatmapVuer Live Demo

## Live Demo

<div class="demo-map-container">
  <div class="demo-map-container-inner">
    <ClientOnly>
      <FlatmapVuer
        entry="NCBITaxon:9606"
        v-on:resource-selected="FlatmapSelected"
        v-on:ready="FlatmapReady"
        pathControls="true"
      />
    </ClientOnly>
  </div>
</div>

<script setup>
import { defineClientComponent } from 'vitepress'

const FlatmapVuer = defineClientComponent(() => {
  return import('../src/components/FlatmapVuer.vue')
})
</script>

<script>
export default {
  data: function() {
    return {
      entry: ''
    };
  }
}
</script>

<style>
  .demo-map-container {
    width: 100%;
    height: 0;
    padding-bottom: 75%;
    border: 1px solid var(--vp-c-divider);
    position: relative;
    z-index: 1; /* just for demo, to prevent tooltips go out of container */
  }

  .demo-map-container-inner {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  .flatmap-container {
    overflow: hidden;
  }

  .bottom-right-control {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  .zoomOut,
  .fitWindow {
    padding-left: 0px !important;
  }
</style>

## Code Preview

```js-vue
  <div class="your-outer-container">
    <FlatmapVuer
      entry="NCBITaxon:9606"
      v-on:resource-selected="FlatmapSelected"
      v-on:ready="FlatmapReady"
      pathControls="true"
    />
  </div>

  <script>
    import { FlatmapVuer } from '@abi-software/flatmapvuer';
    import '@abi-software/flatmapvuer/dist/style.css';

    export default {
      components: { FlatmapVuer },
      data: function () {
        return {
          entry: '',
        }
      }
    }
  </script>
```
