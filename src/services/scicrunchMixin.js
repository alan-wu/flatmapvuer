/* eslint-disable no-alert, no-console */
const imageQuery = '"*jp2* OR *vnd.ome.xml* OR *jpx*"';

const generateShareLink = (datasetId, datasetVersion, filePath) => {
  const prefix = "https://sparc.biolucida.net";
  return `${prefix}/dataviewer?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
};

const getView2DImageLink = (rootURL, datasetId, datasetVersion, filePath) => {
  return `${rootURL}datasets/file/${datasetId}/${datasetVersion}?path=files/${filePath}`;
};

const getView3DImageLink = (
  rootURL,
  datasetId,
  datasetVersion,
  dataset_image
) => {
  const viewEncoding = dataset_image.share_link.replace(
    "https://sparc.biolucida.net/image?c=",
    ""
  );
  return (
    rootURL +
    "datasets/biolucidaviewer/" +
    dataset_image.image_id +
    "?view=" +
    viewEncoding +
    "&dataset_version=" +
    datasetVersion +
    "&dataset_id=" +
    datasetId +
    "&item_id=" +
    dataset_image.sourcepkg_id
  );
};

const getBiolucidaInfo = async function (sparcAPI, datasetId) {
  return new Promise((resolve, reject) => {
    const endpoint = `${sparcAPI}image_search/${datasetId}`;
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        if (data.status == "success") {
          let imageObjects = {};
          data.dataset_images.forEach((image) => {
            if (!(image.image_id in imageObjects)) {
              imageObjects[image.image_id] = image;
            }
          });
          resolve(imageObjects);
        } else {
          reject(data.reason);
        }
      });
  });
};

const getAnnotatedBiolucida = function (data) {
  let annBiolucida = [];
  let ann2DBiolucida = [];
  if ("biolucida-2d" in data) {
    annBiolucida = [...annBiolucida, ...data["biolucida-2d"]];
    ann2DBiolucida = [...annBiolucida, ...data["biolucida-2d"]];
  }
  if ("biolucida-3d" in data) {
    annBiolucida = [...annBiolucida, ...data["biolucida-3d"]];
  }
  annBiolucida = annBiolucida.filter((biolucida) => biolucida.biolucida);
  ann2DBiolucida = ann2DBiolucida.filter((biolucida) => biolucida.biolucida);
  ann2DBiolucida.map((biolucida) => {
    biolucida.biolucida.identifier;
  });
  return { annBiolucida, ann2DBiolucida };
};

export default {
  // Note that the setting store is included in MapContent.vue
  methods: {
    getThumbnailURL: function (thumbnailId) {
      return `${this.sparcAPI}thumbnail/${thumbnailId}`;
    },

    getSegmentationThumbnailURL: function (
      datasetId,
      datasetVersion,
      filePath,
      s3uri
    ) {
      return `${this.sparcAPI}thumbnail/neurolucida?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}&s3uri=${s3uri}`;
    },

    getImagesFromScicrunch: async function () {
      try {
        const response = await fetch(
          `${
            this.sparcAPI
          }multiple_dataset_info/using_multiple_mimetype/?${new URLSearchParams(
            { q: imageQuery }
          )}`
        );
        const data = await response.json();
        console.log("number of hits:", data.numberOfHits);
        if (data.numberOfHits >= 1) {
          let images = await this.processResults(data.results);
          return { success: true, images: images };
        }
        return { success: false };
      } catch (error) {
        console.error("Error:", error);
        return { success: false };
      }
    },

    processResults: async function (results) {
      try {
        let images = [];
        const dataType = "Image";
        console.log("starting promise list");
        let promiseList = results.map(async (result, i) => {
          const datasetId = result.dataset_identifier;
          const datasetVersion = result.dataset_version;
          const biolucidaInfo = await getBiolucidaInfo(
            this.sparcAPI,
            datasetId
          );
          const imageIds = Object.values(biolucidaInfo).map(
            (image) => image.image_id
          );
          const { annBiolucida, ann2DBiolucida } =
            getAnnotatedBiolucida(result);
          return annBiolucida
            .filter((bioImage) =>
              imageIds.includes(bioImage.biolucida.identifier)
            )
            .map((bioImage) => {
              const datasetImage = biolucidaInfo[bioImage.biolucida.identifier];
              const link = ann2DBiolucida.includes(
                bioImage.biolucida.identifier
              )
                ? getView2DImageLink(
                    this.rootURL,
                    datasetId,
                    datasetVersion,
                    bioImage.dataset.path
                  )
                : getView3DImageLink(
                    this.rootURL,
                    datasetId,
                    datasetVersion,
                    datasetImage
                  );
              return {
                resource: {
                  share_link: datasetImage.share_link,
                },
                title: bioImage.name,
                anatomy: result.organs,
                species: result.organisms,
                datasetId: datasetId,
                datasetVersion: datasetVersion,
                link: link,
                s3uri: result.s3uri,
                type: dataType,
                thumbnail: datasetImage.thumbnail_url,
              };
            });
        });
        console.log("promiseList:", promiseList);
        let biolucidaInfos = await Promise.allSettled(promiseList);
        images = biolucidaInfos.flat();
        console.log("biolucidaInfos:", biolucidaInfos);
        console.log("finished!");
        return images;
      } catch (error) {
        console.error("Error:", error);
        return [];
      }
    },
  },
};
