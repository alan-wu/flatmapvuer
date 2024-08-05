const imageQuery = '"*jp2* OR *vnd.ome.xml* OR *jpx*"';

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
  let bioList = [];
  let bio2DIds = [];
  if ("biolucida-2d" in data) {
    const bio2DLength = data["biolucida-2d"].length;
    for (let i = 0; i < bio2DLength; i++) {
      const biolucida = data["biolucida-2d"][i];
      if (biolucida.biolucida) {
        bioList.push(biolucida);
        bio2DIds.push(biolucida.biolucida.identifier);
      }
    }
  }
  if ("biolucida-3d" in data) {
    const bio3DLength = data["biolucida-3d"].length;
    for (let i = 0; i < bio3DLength; i++) {
      const biolucida = data["biolucida-3d"][i];
      if (biolucida.biolucida) {
        bioList.push(biolucida);
      }
    }
  }
  return { bioList, bio2DIds };
};

export default {
  // Note that the setting store is included in MapContent.vue
  methods: {
    createThumbnailMarkers: function (mapImp, id, image) {
      return new Promise((resolve, reject) => {
        let wrapperElement = document.createElement("div");
        let img = new Image();
        img.src = image;
        img.style = "height: auto;width: 50px;margin-right: 80px;";
        img.onload = function () {
          wrapperElement.appendChild(img);
          const markerIdentifier = mapImp.addMarker(id, {
            element: wrapperElement,
            className: "highlight-marker",
            cluster: false,
            type: "image",
          });
          resolve(markerIdentifier);
        };
        img.onerror = function () {
          reject(new Error("Failed to load image at " + image));
        };
      });
    },

    populateViewerWithImages: function (datasets, mapImp = undefined) {
      let anatomyImageObjects = {};
      const datasetsLength = datasets.length;
      for (let i = 0; i < datasetsLength; i++) {
        const dataset = datasets[i];
        if (dataset.value && dataset.value.length) {
          const imagesLength = dataset.value.length;
          for (let j = 0; j < imagesLength; j++) {
            const image = dataset.value[j];
            if (image.anatomy && image.anatomy.length) {
              const anatomyLength = image.anatomy.length;
              for (let k = 0; k < anatomyLength; k++) {
                const anatomy = image.anatomy[k];
                const locationIdentifier = mapImp
                  ? anatomy.curie
                  : anatomy.name;
                if (!(locationIdentifier in anatomyImageObjects)) {
                  anatomyImageObjects[locationIdentifier] = [];
                  if (mapImp) {
                    this.createThumbnailMarkers(
                      mapImp,
                      locationIdentifier,
                      image.thumbnail
                    );
                  }
                }
                anatomyImageObjects[locationIdentifier].push(image);
              }
            }
          }
        }
      }
      return anatomyImageObjects;
    },

    processResults: async function (results) {
      try {
        let datasets = [];
        const dataType = "Image";
        console.log("starting promise list");
        let promiseList = results.map(async (result) => {
          const datasetId = result.dataset_identifier;
          const datasetVersion = result.dataset_version;
          const biolucidaInfo = await getBiolucidaInfo(
            this.sparcAPI,
            datasetId
          );
          const imageIds = Object.values(biolucidaInfo).map(
            (image) => image.image_id
          );
          const { bioList, bio2DIds } = getAnnotatedBiolucida(result);
          return bioList
            .filter((bioImage) =>
              imageIds.includes(bioImage.biolucida.identifier)
            )
            .map((bioImage) => {
              const datasetImage = biolucidaInfo[bioImage.biolucida.identifier];
              const link = bio2DIds.includes(bioImage.biolucida.identifier)
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
                title: bioImage.name,
                anatomy: result.organs,
                species: result.organisms,
                datasetId: datasetId,
                datasetVersion: datasetVersion,
                link: link,
                type: dataType,
                thumbnail: datasetImage.thumbnail_url,
              };
            });
        });
        console.log("promiseList:", promiseList);
        let promiseResult = await Promise.allSettled(promiseList);
        datasets = promiseResult.flat();
        console.log("promiseResult:", promiseResult);
        return datasets;
      } catch (error) {
        console.error("Error:", error);
        return [];
      }
    },

    getImageDatasetFromScicrunch: async function () {
      const endpoint =
        `${this.sparcAPI}multiple_dataset_info/using_multiple_mimetype/?` +
        `${new URLSearchParams({ q: imageQuery })}`;
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        if (data.numberOfHits >= 1) {
          let datasets = await this.processResults(data.results);
          return { success: true, datasets: datasets };
        }
        return { success: false, error: "No datasets found" };
      } catch (error) {
        return { success: false, error: error };
      }
    },
  },
};
