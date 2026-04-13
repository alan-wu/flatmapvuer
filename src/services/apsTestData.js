const resolveURL = (relative, base) => {
  const resolved = new URL(relative, base);
  return resolved.href;
}

const retrieveOmexData = async (url, uuid) => {
  if (url) {
    const response = await fetch(url);
    const data = await response.json();
    const simulation = [];
    for (const entry of data) {
      let found = false;
      if (entry.flatmaps) {
        for (const flatmap of entry.flatmaps) {
          if (flatmap.associated_flatmap?.identifier === uuid) {
            found = true;
          }
        }
      }
      if (found && ('simulation' in entry)) {
        entry.simulation.forEach((item) => {
          if (item.resource?.url) {
            item.resource.url = resolveURL(item.resource.url, url);
          }
          item.datasetId = entry.datasetId;
        });
        simulation.push(...entry.simulation);
      }
    }
    if (simulation.length) {
      return {testData: true, simulation};
    }
  }
  return undefined;
}


export {
  retrieveOmexData,
};
