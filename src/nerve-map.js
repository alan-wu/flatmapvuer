// nerve-map.js

// A temporary hard-coded mapping file used for demonstrating the types of info 
// neural paths will show on click

export default {
  'UBERON:0011390': {
    title: 'Pudendal nerve', components: 'sensory (afferent) neuron', start: 'First sacral spinal cord segment, Sixth lumbar spinal cord segment', distribution: 'External urethral sphincter', actions: [{
      title: "View Source",
      resource: "https://www.ncbi.nlm.nih.gov/books/NBK554736/",
      type: "URL"
    }],
  },
  'UBERON:0003715': {
    title: 'Splanchnic nerve', components: undefined, start: undefined, distribution: undefined, actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }],
  },
  'UBERON:0001884': {
    title: 'Phrenic nerve', components: undefined, start: undefined, distribution: undefined, actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }],
  },
  'ILX:0738374': {
    title: 'External laryngeal nerve', components: 'visceral efferent', start: undefined, distribution: 'cricothyroid', actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }],
  },
  'ILX:0738309': {
    title: 'Internal laryngeal nerve', components: 'general afferent, general visceral affarent, visceral parasympathetic', start: undefined, distribution: undefined, actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }],
  },
  'UBERON:0018675': {
    title: 'Lumbar splanchnic nerve', components: undefined, start: undefined, distribution: undefined, actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }],
  },
  'UBERON:0001650': {
    title: 'Hypoglossal nerve', components: undefined, start: undefined, distribution: undefined, actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }],
  },
  'UBERON:0001759': {
    title: 'Vagus nerve', components: undefined, start: undefined, distribution: undefined, actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }, {
      title: "Explore data",
      label: "Stimulation",
      resource: "https://sparc.science/data?type=dataset&q=stimulation",
      type: "Search",
      nervePath: true,
      filter: {
        facet: 'Vagus Nerve',
        term: 'genotype'
      },
    },
    ],
  },
  'http://uri.interlex.org/base/ilx_0738443': {
    title: 'Fascicle of Vagus Nerve', components: undefined, start: undefined, distribution: undefined, actions: [{
      title: "View Source",
      resource: "https://doi.org/10.1002/ca.23296",
      type: "URL"
    }, {
      title: "View Dataset",
      label: "Stimulation",
      resource: "https://sparc.science/datasets/64?type=dataset",
      type: "URL",
      nervePath: false,
    },
    ],
  }
  
}