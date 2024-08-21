const getFilesInfo = async (sparcApi, key, idsList, types) => {
  let params = new URLSearchParams();
  types.forEach((type) => {
    params.append("filetypes", type);
  });
  let response = await fetch(`${sparcApi}/get-organ-curies/?${params}`);
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
  response = await fetch(`${sparcApi}/get-files-info-for-curies`, {
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

const getBiolucidaThumbnailURL = (sparcApi, biolucidaId) => {
  return `${sparcApi}/thumbnail/${biolucidaId}`;
};
const getBiolucidaThumbnails = async (sparcApi, key, idsList) => {
  try {
    const data = await getFilesInfo(sparcApi, key, idsList, [
      "biolucida-2d",
      "biolucida-3d",
    ]);
    if (data["files_info"]) {
      const images = {};
      for (const [key, value] of Object.entries(data["files_info"])) {
        if (value.length > 0) {
          const list = [];
          value.forEach((entry) => {
            const thumbnailURL = getBiolucidaThumbnailURL(
              sparcApi,
              entry.biolucida_id
            );
            if (entry.biolucida_id) {
              let image = {
                thumbnail: thumbnailURL,
                resource: entry.file_path,
                id: entry.id,
                title: getFileName(entry.file_path),
                type: "Image",
                link: thumbnailURL,
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
};

const getSegmentationThumbnailURL = (
  sparcApi,
  datasetId,
  datasetVersion,
  filePath
) => {
  return `${sparcApi}/thumbnail/neurolucida?datasetId=${datasetId}&version=${datasetVersion}&path=files/${filePath}`;
};
const getSegmentationThumbnails = async (sparcApi, key, idsList) => {
  try {
    const data = await getFilesInfo(sparcApi, key, idsList, [
      "mbf-segmentation",
    ]);
    if (data["files_info"]) {
      const images = {};
      for (const [key, value] of Object.entries(data["files_info"])) {
        if (value.length > 0) {
          const list = [];
          value.forEach((entry) => {
            const thumbnailURL = getSegmentationThumbnailURL(
              sparcApi,
              entry.id,
              entry.version,
              entry.file_path
            );
            let image = {
              thumbnail: thumbnailURL,
              resource: entry.file_path,
              id: entry.id,
              title: getFileName(entry.file_path),
              type: "Segmentation",
              link: thumbnailURL,
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
};

const findEntryWithPathInArray = (entry, list, type) => {
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
};
const getScaffoldThumbnailURL = (sparcApi, entry, list) => {
  const viewEntry = findEntryWithPathInArray(
    entry,
    list,
    "abi-scaffold-view-file"
  );
  const thumbnailEntry = findEntryWithPathInArray(
    viewEntry,
    list,
    "abi-thumbnail"
  );
  if (thumbnailEntry) {
    return `${sparcApi}/s3-resource/${thumbnailEntry.id}/files/${thumbnailEntry.file_path}`;
  }
  return undefined;
};
const getScaffoldThumbnails = async (sparcApi, key, idsList) => {
  try {
    const data = await getFilesInfo(sparcApi, key, idsList, [
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
              const thumbnailURL = getScaffoldThumbnailURL(
                sparcApi,
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
};

const getPlotThumbnailURL = (sparcApi, entry) => {
  //None of the thumbnail for plot is properly annotated.
  //We will use the first in is source of for testing.
  if (entry.isSourceOf.length > 0) {
    return `${sparcApi}/s3-resource/${entry.id}/files/${entry.isSourceOf[0]}`;
  }
  return undefined;
};
const getPlotThumbnails = async (sparcApi, key, idsList) => {
  try {
    const data = await getFilesInfo(sparcApi, key, idsList, [
      "abi-plot",
      "abi-thumbnail",
    ]);
    if (data["files_info"]) {
      const images = {};
      for (const [key, value] of Object.entries(data["files_info"])) {
        if (value.length > 0) {
          const list = [];
          value.forEach((entry) => {
            if (entry.type === "abi-plot") {
              const thumbnailURL = getPlotThumbnailURL(sparcApi, entry);
              if (thumbnailURL) {
                let image = {
                  thumbnail: thumbnailURL,
                  resource: entry.file_path,
                  datasetId: entry.id,
                  title: getFileName(entry.file_path),
                  type: "Plot",
                  link: thumbnailURL,
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
};

export {
  getBiolucidaThumbnails,
  getSegmentationThumbnails,
  getScaffoldThumbnails,
  getPlotThumbnails,
};
