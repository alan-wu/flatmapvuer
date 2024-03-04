# FlatmapVuer Live Demo

## Live Demo

<div class="demo-map-container">
  <div class="demo-map-container-inner">
    <ClientOnly>
      <FlatmapVuer
        entry="NCBITaxon:10114"
        :pathControls="pathControls"
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
      pathControls: true,
    };
  }
}
</script>

## Code Preview

```js-vue
  <div class="your-outer-container">
    <FlatmapVuer
      entry="NCBITaxon:10114"
      :pathControls="pathControls"
    />
  </div>

  <script>
    import { FlatmapVuer } from '@abi-software/flatmapvuer';
    import '@abi-software/flatmapvuer/dist/style.css';

    export default {
      components: { FlatmapVuer },
      data: function () {
        return {
          pathControls: true,
        }
      }
    }
  </script>
```
