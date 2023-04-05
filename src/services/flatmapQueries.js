/* eslint-disable no-alert, no-console */
// remove duplicates by stringifying the objects
const removeDuplicates = function(arrayOfAnything){
  return [...new Set(arrayOfAnything.map(e => JSON.stringify(e)))].map(e => JSON.parse(e)) 
}

const inArray = function(ar1, ar2){
  let as1 = JSON.stringify(ar1)
  let as2 = JSON.stringify(ar2)
  return as1.indexOf(as2) !== -1
}

export class FlatmapQueries {
  constructor(sparcApi, flatmapApi) {
    this.sparcApi = sparcApi
    this.flatmapApi = flatmapApi
    this.destinations = []
    this.origins = []
    this.components = []
    this.uberons = []
    this.controller = undefined
    this.getOrganCuries().then(uberons=>{
      this.uberons = uberons
      this.createLabelLookup(uberons).then(lookUp=>{
        this.lookUp = lookUp
      })
    })
  }

  createTooltipData = function (eventData) {
    let tooltipData = {
      destinations: this.destinations, 
      origins: this.origins,
      components: this.components,
      destinationsWithDatasets: this.destinationsWithDatasets,
      originsWithDatasets: this.originsWithDatasets,
      componentsWithDatasets: this.componentsWithDatasets,
      title: eventData.label,
      featureId: eventData.resource,
      hyperlinks: eventData.feature.hyperlinks
    }
    console.log('tooltipData', tooltipData)
    return tooltipData
  }

  createUnfilledTooltipData = function (){
    let tooltipData = {
      destinations: [],
      origins: [],
      components: [],
      destinationsWithDatasets: [],
      originsWithDatasets: [],
      componentsWithDatasets: [],
      resource: undefined
    }
    return tooltipData
  }

  getOrganCuries = function(){
    return new Promise(resolve=> {
    fetch(`${this.sparcAPI}get-organ-curies/`)
      .then(response=>response.json())
      .then(data=>{
        resolve(data.uberon.array)
      })
    })
  }

  createComponentsLabelList = function(components, lookUp){
    let labelList = []
    components.forEach(n=>{
      labelList.push(this.createLabelFromNeuralNode(n[0]), lookUp)
      if (n.length === 2){
        labelList.push(this.createLabelFromNeuralNode(n[1]), lookUp)
      }
    })
    return labelList
  }

  createLabelLookup = function(uberons) {
    return new Promise(resolve=> {
      let uberonMap = {}
      const data = { sql: this.buildLabelSqlStatement(uberons)}
      fetch(`${this.flatmapApi}knowledge/query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(payload => {
          const entity = payload.keys.indexOf("entity");
          const label = payload.keys.indexOf("label");
          if (entity > -1 && label > -1) {
            payload.values.forEach(pair => {
              uberonMap[pair[entity]] = pair[label];
            });
          }
        resolve(uberonMap)
        })
    })
  }

  buildConnectivitySqlStatement = function (keastIds) {
    let sql = 'select knowledge from knowledge where entity in ('
    if (keastIds.length === 1) {
      sql += `'${keastIds[0]}')`
    } else if (keastIds.length > 1) {
      for (let i in keastIds) {
        sql += `'${keastIds[i]}'${i >= keastIds.length - 1 ? ')' : ','} `
      }
    }
    return sql
  }
  buildLabelSqlStatement = function (uberons) {
    let sql = 'select entity, label from labels where entity in ('
    if (uberons.length === 1) {
      sql += `'${uberons[0]}')`
    } else if (uberons.length > 1) {
      for (let i in uberons) {
        sql += `'${uberons[i]}'${i >= uberons.length - 1 ? ')' : ','} `
      }
    }
    return sql
  }

  findAllIdsFromConnectivity = function (connectivity) {
    let dnodes = connectivity.connectivity.flat() // get nodes from edgelist
    let nodes = [...new Set(dnodes)] // remove duplicates
    let found = []
    nodes.forEach(n => {
      if (Array.isArray(n)) {
        found.push(n.flat())
      } else {
        found.push(n)
      }
    })
    return [... new Set(found.flat())]
  }

  flattenConntectivity = function (connectivity) {
    let dnodes = connectivity.flat() // get nodes from edgelist
    let nodes = [...new Set(dnodes)] // remove duplicates
    let found = []
    nodes.forEach(n => {
      if (Array.isArray(n)) {
        found.push(n.flat())
      } else {
        found.push(n)
      }
    })
    return found.flat()
  }

  findComponents = function (connectivity) {
    let dnodes = connectivity.connectivity.flat() // get nodes from edgelist
    let nodes = removeDuplicates(dnodes)

    let found = []
    let terminal = false
    nodes.forEach(node => {
      terminal = false
      // Check if the node is an destination or origin (note that they are labelled dendrite and axon as opposed to origin and destination)
      if (inArray(connectivity.axons, node)) {
        terminal = true
      }
      if (inArray(connectivity.dendrites, node)) {
        terminal = true
      }
      if (!terminal) {
        found.push(node)
      }
    })

    return found
  }

  pathwayQuery = function(keastIds){
    return new Promise(resolve=>{
      // check if there is an existing query
      if (this.controller) this.controller.abort();

      // set up the abort controller
      this.controller = new AbortController();
      const signal = this.controller.signal;

      console.log('Querying for pathways')
      this.destinations = []
      this.origins = []
      this.components = []
      this.loading = true
      if (!keastIds || keastIds.length == 0) return
      const data = { sql: this.buildConnectivitySqlStatement(keastIds)};
      fetch(`${this.flatmapApi}knowledge/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: signal
      })
      .then(response => response.json())
      .then(data => {
        if(this.connectivityExists(data)){
          console.log('Connectivity data found')
          let connectivity = JSON.parse(data.values[0][0])
          this.processConnectivity(connectivity).then(()=>{
            resolve(true)
          })
        } else {
          console.log('No connectivity data found')
          resolve(false)
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      })
    })
  }

  connectivityExists = function(data){
    if (data.values && data.values.length > 0 && JSON.parse(data.values[0][0]).connectivity && JSON.parse(data.values[0][0]).connectivity.length > 0) {
      return true
    } else {
      return false
    }
  }

  createLabelFromNeuralNode = function(node, lookUp){
    let label = lookUp[node[0]]
    if (node.length === 2 && node[1].length > 0){
      node[1].forEach(n=>{
        if (lookUp[n] == undefined){
          label += `, ${n}` 
        } else {
          label += `, ${lookUp[n]}`
        }
      })
    }
    return label
  }

  flattenAndFindDatasets(components, axons, dendrites){
      
    // process the nodes for finding datasets (Note this is not critical to the tooltip, only for the 'search on components' button)
    let componentsFlat = this.flattenConntectivity(components)
    let axonsFlat = this.flattenConntectivity(axons)
    let dendritesFlat = this.flattenConntectivity(dendrites)

    // Filter for the anatomy which is annotated on datasets
    this.destinationsWithDatasets = this.uberons.filter(ub => axonsFlat.indexOf(ub.id) !== -1)
    this.originsWithDatasets = this.uberons.filter(ub => dendritesFlat.indexOf(ub.id) !== -1)
    this.componentsWithDatasets = this.uberons.filter(ub => componentsFlat.indexOf(ub.id) !== -1)
    console.log('components', this.components)
  }

  processConnectivity(connectivity){
    return new Promise (resolve=>{
      console.log('connectivity', connectivity)

      // Filter the origin and destinations from components
      let components = this.findComponents(connectivity)

      // Remove duplicates
      let axons = removeDuplicates(connectivity.axons)
      let dendrites = removeDuplicates(connectivity.dendrites)

      // Create list of ids to get labels for
      let conIds = this.findAllIdsFromConnectivity(connectivity)  

      // Create readable labels from the nodes. Setting this to 'this.origins' updates the display
      this.createLabelLookup(conIds).then(lookUp=>{
        this.destinations = axons.map(a=>this.createLabelFromNeuralNode(a,lookUp))
        this.origins = dendrites.map(d=>this.createLabelFromNeuralNode(d,lookUp))
        this.components = components.map(c=>this.createLabelFromNeuralNode(c, lookUp))
        this.flattenAndFindDatasets(components, axons, dendrites)
        resolve(true)
      })
    })
  }

  flattenConntectivity(connectivity){
    let dnodes = connectivity.flat() // get nodes from edgelist
    let nodes = [...new Set(dnodes)] // remove duplicates
    let found = []
    nodes.forEach(n=>{
      if (Array.isArray(n)){
        found.push(n.flat())
      } else {
        found.push(n)
      }
    })
    return found.flat()
  }

  findComponents = function(connectivity){
    let dnodes = connectivity.connectivity.flat() // get nodes from edgelist
    let nodes = removeDuplicates(dnodes)

    let found = []
    let terminal = false
    nodes.forEach(node=>{
      terminal = false
      // Check if the node is an destination or origin (note that they are labelled dendrite and axon as opposed to origin and destination)
      if(inArray(connectivity.axons,node)){
        terminal = true
      }
      if(inArray(connectivity.dendrites, node)){
        terminal = true
      }
      if (!terminal){
        found.push(node)
      }
    })

    return found
  }

  findAllIdsFromConnectivity(connectivity){
    let dnodes = connectivity.connectivity.flat() // get nodes from edgelist
    let nodes = [...new Set(dnodes)] // remove duplicates
    let found = []
    nodes.forEach(n=>{
      if (Array.isArray(n)){
        found.push(n.flat())
      } else {
        found.push(n)
      }
    })
    return [... new Set(found.flat())]
  }
}





export default FlatmapQueries