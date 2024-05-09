<template>
  <div class="tooltip-container" id="tooltip-container">
    <template v-if="tooltipType === 'annotation'">
      <annotation-tool :annotationEntry="annotationEntry" />
    </template>
    <template v-if="tooltipType === 'provenance'">
      <provenance-popup :entry="entry" @view-image="viewImage"/>
    </template>
    <template v-if="tooltipType === 'image-gallery'">
      <image-gallery-popup
        :galleryItems="galleryItems"
        @viewImage="viewImage"
      />
    </template>
  </div>
</template>

<script>
/* eslint-disable no-alert, no-console */
import AnnotationTool from './AnnotationTool.vue'
import ProvenancePopup from './ProvenancePopup.vue'
import ImageGalleryPopup from './ImageGalleryPopup.vue'

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
    tooltipType: {
      type: String,
      default: 'provenance',
    },
    annotationEntry: {
      type: Object,
    },
    galleryItems: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    viewImage: function (url) {
      this.$emit('view-image', url)
    }
  }
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
