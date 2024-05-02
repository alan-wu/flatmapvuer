
/* eslint-disable no-alert, no-console */
const imageQuery = '"*jp2* OR *vnd.ome.xml* OR *jpx*"';

const generateShareLink = (datasetId, datasetVersion, filePath) => {
  const prefix = 'https://sparc.biolucida.net';
  return `${prefix}/dataviewer?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
}

export default {
    // Note that the setting store is included in MapContent.vue
    methods: {
      getSegmentationThumbnailURL: function(datasetId, datasetVersion, filePath, s3uri) {
       // console.log('thumbnail url', `${this.sparcApi}/get_thumbnail/?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}&s3uri=${s3uri}`)
        return `${this.sparcApi}/thumbnail/neurolucida?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}&s3uri=${s3uri}`;
      }, 
      getImagesFromScicrunch: async function () {
        // get the context file from scicrunch
        console.log('calling: ', `${this.sparcApi}/multiple_dataset_info/using_multiple_mimetype/?${new URLSearchParams({q: imageQuery})}`)
        let results = await fetch(`${this.sparcApi}/multiple_dataset_info/using_multiple_mimetype/?${new URLSearchParams({q: imageQuery})}`)
          .then(response => response.json())
          .then(data => {
            console.log('number of hits:', data.numberOfHits)
            if (data.numberOfHits >= 1) { // check if there is only one hit (We don't want to use the data if there are multiple hits)
              
              let images = this.processResults(data.results)
              return {success: true, images: images};
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

        console.log('results:', results)
        results.forEach(result => {
          datasetId = result.dataset_identifier;
          datasetVersion = result.dataset_version;
          s3uri = result.s3uri;
          console.log('datasetId:', datasetId, result['mbf-segmentation'], result.organs)
          result['mbf-segmentation']?.forEach(segmentation => {
            images.push({
              label: segmentation.name,
              path: segmentation.dataset.path,
              resource: {
                share_link: generateShareLink(datasetId, datasetVersion, segmentation.dataset.path),
              },
              anatomy: result.organs,
              datasetId: datasetId,
              datasetVersion: datasetVersion,
              s3uri: s3uri,
              type: dataType,
              thumbnail: this.getSegmentationThumbnailURL(datasetId, datasetVersion, segmentation.dataset.path, s3uri), 
            });
          });
        });

        results.forEach(result => {
          datasetId = result.dataset_identifier;
          datasetVersion = result.dataset_version;
          s3uri = result.s3uri;
          result['biolucida-2d']?.forEach(segmentation => {
            images.push({
              label: segmentation.name,
              path: segmentation.dataset.path,
              resource: {
                share_link: generateShareLink(datasetId, datasetVersion, segmentation.dataset.path),
              },
              anatomy: result.organs,
              datasetId: datasetId,
              datasetVersion: datasetVersion,
              s3uri: s3uri,
              type: dataType,
              thumbnail: this.getSegmentationThumbnailURL(datasetId, datasetVersion, segmentation.dataset.path, s3uri), 
            });
          });
        });

        results.forEach(result => {
          datasetId = result.dataset_identifier;
          datasetVersion = result.dataset_version;
          s3uri = result.s3uri;
          result['biolucida-3d']?.forEach(segmentation => {
            images.push({
              label: segmentation.name,
              path: segmentation.dataset.path,
              resource: {
                share_link: generateShareLink(datasetId, datasetVersion, segmentation.dataset.path),
              },
              anatomy: result.organs,
              datasetId: datasetId,
              datasetVersion: datasetVersion,
              s3uri: s3uri,
              type: dataType,
              thumbnail: this.getSegmentationThumbnailURL(datasetId, datasetVersion, segmentation.dataset.path, s3uri), 
            });
          });
        });
        
        console.log('finished processing')
        return images
    }
  }
}
  