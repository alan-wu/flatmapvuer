
/* eslint-disable no-alert, no-console */
const imageQuery = "*jp2* OR *vnd.ome.xml* OR *jpx*"

const generateShareLink = (datasetId, datasetVersion, filePath) => {
  const prefix = 'https://sparc.biolucida.net';
  return `${prefix}/dataviewer?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
}

export default {
    // Note that the setting store is included in MapContent.vue
    methods: {
      
      getImagesFromScicrunch: async function () {
        // get the context file from scicrunch
        let results = await fetch(`${this.settingsStore.sparcApi}/multiple_dataset_info/using_multiple_mimetype/?q=${imageQuery}`)
          .then(response => response.json())
          .then(data => {

            if (data.numberOfHits >= 1) { // check if there is only one hit (We don't want to use the data if there are multiple hits)
              processResults(data.results)
            }
            return {success: false};
          }).catch(error => {
            console.error('Error:', error);
            return {success: false};
          });
        return results;
      },
      processResults: function (results) {
        let images = [];
        let datasetId = undefined;
        let s3uri = undefined;
        let datasetVersion = undefined;
        const dataType = 'segmentation'

        results.forEach(result => {
          datasetId = result.dataset_identifier;
          datasetVersion = result.dataset_version;
          s3uri = result.s3uri;
          result.mbfSegmentation.forEach(segmentation => {
            images.push({
              label: segmentation.name,
              path: segmentation.dataset.path,
              resource: {
                share_link: generateShareLink(datasetId, datasetVersion, segmentation.dataset.path),
              },
              datasetId: datasetId,
              datasetVersion: datasetVersion,
              s3uri: s3uri,
              type: dataType
            });
          });
        });
    }
  }
  