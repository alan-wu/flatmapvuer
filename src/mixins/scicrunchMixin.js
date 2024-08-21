const getFilesInfo = async (api, key, idsList, types) => {
  let params = new URLSearchParams();
  types.forEach((type) => {
    params.append("filetypes", type);
  });
  let response = await fetch(`${api}/get-organ-curies/?${params}`);
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
  response = await fetch(`${api}/get-files-info-for-curies`, {
    method: "POST",
    body: JSON.stringify({
      filetypes: types,
      curies: keys,
      species: ["Rat"],
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  data = await response.json();
  return data;
};

const getFileName = (filePath) => {
  return filePath.substring(filePath.lastIndexOf("/") + 1);
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
                    title: getFileName(entry.file_path),
                    type: "Image",
                    link: this.getBiolucidaThumbnailLink(entry.biolucida_id),
                    mimetype: entry.mimetype,
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
      return `${this.sparcAPI}/thumbnail/${biolucidaId}`;
    },
    getBiolucidaThumbnailLink: function (biolucidaId) {
      return `${this.sparcAPI}/thumbnail/${biolucidaId}`;
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
                  title: getFileName(entry.file_path),
                  type: "Segmentation",
                  link: this.getSegmentationThumbnailLink(
                    entry.id,
                    entry.version,
                    entry.file_path
                  ),
                  mimetype: entry.mimetype,
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
    getSegmentationThumbnailLink: function (
      datasetId,
      datasetVersion,
      filePath
    ) {
      return `https://sparc.biolucida.net:8081/thumbnail?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
    },
    getScaffoldThumbnails: async function (key, idsList) {
      try {
        const data = await getFilesInfo(this.sparcAPI, key, idsList, [
          "abi-thumbnail",
          "abi-scaffold-metadata-file",
          "abi-scaffold-view-file",
        ]);
        if (data["files_info"]) {
          const images = {};
          for (const [key, value] of Object.entries(data["files_info"])) {
            if (value.length > 0) {
              const list = [];
              value.forEach((entry) => {
                if (entry.type === "abi-scaffold-metadata-file") {
                  const thumbnailURL = this.getScaffoldThumbnailURL(
                    entry,
                    value
                  );
                  if (thumbnailURL) {
                    let image = {
                      thumbnail: thumbnailURL,
                      resource: entry.file_path,
                      id: entry.id,
                      title: getFileName(entry.file_path),
                      type: "Scaffold",
                      link: thumbnailURL,
                      mimetype: entry.mimetype,
                    };
                    list.push(image);
                  }
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
    getScaffoldThumbnailURL: function (entry, list) {
      const viewEntry = this.findEntryWithPathInArray(
        entry,
        list,
        "abi-scaffold-view-file"
      );
      const thumbnailEntry = this.findEntryWithPathInArray(
        viewEntry,
        list,
        "abi-thumbnail"
      );
      if (thumbnailEntry) {
        return `${this.sparcAPI}/s3-resource/${thumbnailEntry.id}/files/${
          thumbnailEntry.file_path
        }?${new URLSearchParams({ encodeBase64: true })}`;
      }
      return undefined;
    },
    findEntryWithPathInArray(entry, list, type) {
      if (entry && list) {
        for (let i = 0; i < entry.isSourceOf.length; i++) {
          for (let l = 0; l < list.length; l++) {
            const item = list[l];
            if (
              entry.id === item.id &&
              (!type || item.type === type) &&
              entry.isSourceOf[i] === item.file_path
            ) {
              return item;
            }
          }
        }
      }
      return undefined;
    },
  },
};
