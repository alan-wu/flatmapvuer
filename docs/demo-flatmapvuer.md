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
import './demo-styles.css'

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
