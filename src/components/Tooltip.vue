<template>
  <div class="tooltip-container">
    <template v-if="annotationDisplay">
      <annotation-tool :annotationEntry="annotationEntry" />
    </template>
    <template v-else>
      <provenance-popup :entry="entry" />
    </template>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import AnnotationTool from './AnnotationTool.vue'
import ProvenancePopup from './ProvenancePopup.vue'

export default {
  name: 'Tooltip',
  components: {
    AnnotationTool,
    ProvenancePopup,
  },
  props: {
    entry: {
      type: Object,
    },
    annotationDisplay: {
      type: Boolean,
      default: false,
    },
    annotationEntry: {
      type: Object,
    },
    provSpeciesDescription: function(){
      let text = "Observed in"
      this.entry.provenanceTaxonomyLabel.forEach(label => {
        text += ` ${label},`
      });
      text = text.slice(0,-1) // remove last comma
      text += " species"
      console.log('tooltipentry',this.entry)
      return text
    }
  },
}
</script>

<style lang="scss" scoped>
.tooltip-container {
  text-align: justify;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  background: #fff;
  border: 1px solid $app-primary-color;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
