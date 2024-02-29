# MultiFlatmapVuer Live Demo

## Live Demo

<div style="width: 100%; padding-bottom: 75%; position: relative; border: 1px solid var(--vp-c-divider)">
  <div style="width: 100%; height: 100%; position: absolute">
    <ClientOnly>
      <MultiFlatmapVuer
        ref="multi"
        :availableSpecies="availableSpecies"
        @ready="FlatmapReady"
        :featureInfo="featureInfo"
        :searchable="searchable"
        :layerControl="layerControl"
        :initial="initial"
        :pathControls="pathControls"
        :helpMode="helpMode"
        :displayMinimap="true"
        :enableOpenMapUI="true"
        :flatmapAPI="flatmapAPI"
        :disableUI="disableUI"
      />
    </ClientOnly>
  </div>
</div>

<script setup>
import { defineClientComponent } from 'vitepress'

const MultiFlatmapVuer = defineClientComponent(() => {
  return import('../src/components/MultiFlatmapVuer.vue')
})
</script>

<script>
export default {
  data: function() {
    return {
      availableSpecies: {
        'Human Female': {
          taxo: 'NCBITaxon:9606',
          biologicalSex: 'PATO:0000383',
          iconClass: 'mapicon-icon_human',
          displayWarning: true,
        },
        'Human Male': {
          taxo: 'NCBITaxon:9606',
          biologicalSex: 'PATO:0000384',
          iconClass: 'mapicon-icon_human',
          displayWarning: true,
        },
        'Rat (NPO)': {
          taxo: 'NCBITaxon:10116',
          iconClass: 'mapicon-icon_rat',
          displayWarning: true,
          displayLatestChanges: true,
        },
        Mouse: {
          taxo: 'NCBITaxon:10090',
          iconClass: 'mapicon-icon_mouse',
          displayWarning: true,
        },
        Sample: { taxo: 'NCBITaxon:1', displayWarning: true },
        'Functional Connectivity': {
          taxo: 'FunctionalConnectivity',
          displayWarning: true,
        },
      },
      featureInfo: true,
      searchable: true,
      pathControls: true,
      layerControl: true,
      initial: 'Rat (NPO)',
      helpMode: false,
      flatmapAPI: 'https://mapcore-demo.org/devel/flatmap/v4/',
      disableUI: false,
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
    <MultiFlatmapVuer
      ref="multi"
      :availableSpecies="availableSpecies"
      @ready="FlatmapReady"
      :featureInfo="featureInfo"
      :searchable="searchable"
      :layerControl="layerControl"
      :initial="initial"
      :pathControls="pathControls"
      :helpMode="helpMode"
      :displayMinimap="true"
      :enableOpenMapUI="true"
      :flatmapAPI="flatmapAPI"
      :disableUI="disableUI"
    />
  </div>

  <script>
    import { MultiFlatmapVuer } from '@abi-software/flatmapvuer';
    import '@abi-software/flatmapvuer/dist/style.css';

    export default {
      components: { MultiFlatmapVuer },
      data: function () {
        return {
          availableSpecies: {
            'Human Female': {
              taxo: 'NCBITaxon:9606',
              biologicalSex: 'PATO:0000383',
              iconClass: 'mapicon-icon_human',
              displayWarning: true,
            },
            'Human Male': {
              taxo: 'NCBITaxon:9606',
              biologicalSex: 'PATO:0000384',
              iconClass: 'mapicon-icon_human',
              displayWarning: true,
            },
            'Rat (NPO)': {
              taxo: 'NCBITaxon:10116',
              iconClass: 'mapicon-icon_rat',
              displayWarning: true,
              displayLatestChanges: true,
            },
            Mouse: {
              taxo: 'NCBITaxon:10090',
              iconClass: 'mapicon-icon_mouse',
              displayWarning: true,
            },
            Sample: { taxo: 'NCBITaxon:1', displayWarning: true },
            'Functional Connectivity': {
              taxo: 'FunctionalConnectivity',
              displayWarning: true,
            },
          },
          featureInfo: true,
          searchable: true,
          pathControls: true,
          layerControl: true,
          initial: 'Rat (NPO)',
          helpMode: false,
          flatmapAPI: 'https://mapcore-demo.org/devel/flatmap/v4/',
          disableUI: false,
        };
      }
    }
  </script>
```
