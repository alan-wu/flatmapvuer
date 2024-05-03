/* eslint-disable no-alert, no-console */
const imageQuery = '"*jp2* OR *vnd.ome.xml* OR *jpx*"';

const generateShareLink = (datasetId, datasetVersion, filePath) => {
  const prefix = 'https://sparc.biolucida.net';
  return `${prefix}/dataviewer?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
}

const getBiolucidaInfo = async function (sparcApi, datasetId) {
  return new Promise((resolve, reject) => {
    const endpoint = `${sparcApi}/image_search/${datasetId}`
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        if (data.status == 'success') resolve(data);
      })
  })
}

export default {
  // Note that the setting store is included in MapContent.vue
  methods: {
    getThumbnailURL: function(thumbnailId) {
      console.log('thumbnail url', `${this.sparcApi}/thumbnail/${thumbnailId}`)
      return `${this.sparcApi}/thumbnail/${thumbnailId}`
    },

    getSegmentationThumbnailURL: function(datasetId, datasetVersion, filePath, s3uri) {
      console.log('thumbnail url', `${this.sparcApi}/thumbnail/neurolucida?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}&s3uri=${s3uri}`)
      return `${this.sparcApi}/thumbnail/neurolucida?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}&s3uri=${s3uri}`;
    }, 
    getImagesFromScicrunch: async function () {
      try {
        const response = await fetch(`${this.sparcApi}/multiple_dataset_info/using_multiple_mimetype/?${new URLSearchParams({q: imageQuery})}`);
        const data = await response.json();
        console.log('number of hits:', data.numberOfHits);
        if (data.numberOfHits >= 1) {
          let images = await this.processResults(data.results);
          return {success: true, images: images};
        }
        return {success: false};
      } catch (error) {
        console.error('Error:', error);
        return {success: false};
      }
    },
    
    processResults: async function (results) {
      try {
        let images = [];
        const dataType = 'segmentation';
        console.log('starting promise list')
        let promiseList = results.map(async (result, i) => {
          if (i !== 8){
          const datasetId = result.dataset_identifier;
          const datasetVersion = result.dataset_version;
          const s3uri = result.s3uri;
          const biolucidaInfo = await getBiolucidaInfo(this.sparcApi, datasetId);
          return biolucidaInfo.dataset_images.map(bioImage => {
            return {
              resource: {
                share_link: bioImage.share_link,
              },
              anatomy: result.organs,
              datasetId: datasetId,
              datasetVersion: datasetVersion,
              s3uri: s3uri,
              type: dataType,
              thumbnail: bioImage.thumbnail_url,
            };
          });}
        });
        console.log('promiseList:', promiseList);
        let biolucidaInfos = await Promise.allSettled(promiseList);
        images = biolucidaInfos.flat();
        console.log('biolucidaInfos:', biolucidaInfos);
        console.log('finished!')
        return images;
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    } 
  }
}
  