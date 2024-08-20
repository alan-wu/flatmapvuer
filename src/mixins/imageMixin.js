const getFilesInfo = async (api, key, idsList, types) => {
  let params = new URLSearchParams();
  types.forEach((type) => {
    params.append("arrayparams", type);
    params.append("arrayparams", type);
  });
  let response = await fetch(`${api}get-organ-curies/?${params}`);
  let data = await response.json();
  const identifiers = [];
  data.uberon.array.forEach((pair) => {
    const identifier = {
      id: pair.id.toUpperCase(),
      name: pair.name,
    };
    if (idsList.includes(identifier[key])) {
      identifiers.push(identifier);
    }
  });
  const keys = identifiers.map((item) => item[key]);
  response = await fetch(`${api}get-files-info-for-curies`, {
    method: "POST",
    body: JSON.stringify({
      filetypes: types,
      curies: keys,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  data = await response.json();
  return data;
};

export default {
  methods: {
    getBiolucidaThumbnails: async function (key, idsList) {
      try {
        const data = await getFilesInfo(this.sparcAPI, key, idsList, [
          "biolucida-2d",
          "biolucida-3d",
        ]);
        if (data["files_info"]) {
          const images = {};
          for (const [key, value] of Object.entries(data["files_info"])) {
            if (value.length > 0) {
              const list = [];
              value.forEach((entry) => {
                if (entry.biolucida_id) {
                  let image = {
                    thumbnail: this.getBiolucidaThumbnailURL(
                      entry.biolucida_id
                    ),
                    id: entry.id,
                    title: entry.file_path.substring(
                      entry.file_path.lastIndexOf("/") + 1
                    ),
                    type: "Image",
                    link: `https://sparc.biolucida.net/api/v1/thumbnail/${entry.biolucida_id}`,
                    mimetype: 'image/png'
                  };
                  list.push(image);
                }
              });
              images[key] = list;
            }
          }
          return images;
        }
      } catch (error) {
        console.error("Error:", error);
      }
      return {};
    },
    getBiolucidaThumbnailURL: function (biolucidaId) {
      return `${this.sparcAPI}thumbnail/${biolucidaId}`;
    },
    getSegmentationThumbnails: async function (key, idsList) {
      try {
        const data = await getFilesInfo(this.sparcAPI, key, idsList, [
          "mbf-segmentation",
        ]);
        if (data["files_info"]) {
          const images = {};
          for (const [key, value] of Object.entries(data["files_info"])) {
            if (value.length > 0) {
              const list = [];
              value.forEach((entry) => {
                let image = {
                  thumbnail: this.getSegmentationThumbnailURL(
                    entry.id,
                    entry.version,
                    entry.file_path
                  ),
                  id: entry.id,
                  title: entry.file_path.substring(
                    entry.file_path.lastIndexOf("/") + 1
                  ),
                  type: "Segmentation",
                  link: this.getBiolucidaThumbnailURL(entry.biolucida_id),
                };
                list.push(image);
              });
              images[key] = list;
            }
          }
          return images;
        }
      } catch (error) {
        console.error("Error:", error);
      }
      return {};
    },
    getSegmentationThumbnailURL: function (
      datasetId,
      datasetVersion,
      filePath
    ) {
      return `${this.sparcAPI}/thumbnail/neurolucida?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
    },
    populateMapWithImages: function (mapImp, images, type) {
      for (const [key, list] of Object.entries(images)) {
        this.downloadAndCreateImageThumbnailMarkerUrl(mapImp, key, list, type);
      }
    },
    downloadAndCreateImageThumbnailMarkerUrl: function (
      mapImp,
      key,
      list,
      type
    ) {
      const count = list.length;
      if (count > 0) {
        //Pick a random image
        const index = Math.floor(Math.random() * count);
        const thumbnail = list[index].thumbnail;
        this.getThumbnail(thumbnail, type)
          .then((wrappedElement) => {
            this.createImageThumbnailMarkerUrl(mapImp, key, wrappedElement);
          })
          .catch(() => {
            //Failed to download, pick another one
            list.splice(index);
            this.downloadAndCreateImageThumbnailMarkerUrl(
              mapImp,
              key,
              list,
              type
            );
          });
      }
    },
    getThumbnail: async function (url, type) {
      return new Promise((resolve, reject) => {
        if (type === "Segmentation" || type === "Image") {
          this.getBinaryThumbnail(url)
            .then((response) => resolve(response))
            .catch((response) => reject(response));
        } else {
          this.getGenericThumbnail(url)
            .then((response) => resolve(response))
            .catch((response) => reject(response));
        }
      });
    },
    getBinaryThumbnail: async function (url) {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then((response) => {
            if (response.status >= 200 && response.status < 300) {
              return response.text();
            } else {
              reject();
            }
          })
          .then((data) => {
            if (data) {
              let img = new Image();
              let wrapperElement = document.createElement("div");
              img.style = "height: auto;width: 50px;margin-right: 80px;";
              img.onload = function () {
                wrapperElement.appendChild(img);
                resolve(wrapperElement);
              };
              img.onerror = function () {
                reject(new Error("Failed to load image at " + url));
              };
              img.src = `data:'image/png';base64,${data}`;
            } else {
              reject(new Error("Failed to load image at " + url));
            }
          });
      });
    },
    getGenericThumbnail: async function (url) {
      return new Promise((resolve, reject) => {
        let img = new Image();
        let wrapperElement = document.createElement("div");
        img.style = "height: auto;width: 50px;margin-right: 80px;";
        img.onload = function () {
          wrapperElement.appendChild(img);
          resolve(wrapperElement);
        };
        img.onerror = function () {
          reject(new Error("Failed to load image at " + url));
        };
        img.src = url;
      });
    },
    createImageThumbnailMarkerUrl: function (mapImp, id, wrapperElement) {
      // add it to the flatmap
      const markerIdentifier = mapImp.addMarker(id, {
        element: wrapperElement,
        className: "highlight-marker",
        cluster: false,
        type: "image",
      });

      const marker = mapImp.addMarker(id);
      return marker;
    },
  },
};
