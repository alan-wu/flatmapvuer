# Live demo

## Live Demo

<div style="width: 100%; padding-bottom: 75%; position: relative; border: 1px solid var(--vp-c-divider)">
  <div style="width: 100%; height: 100%; position: absolute">
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
