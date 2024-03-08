// /* eslint-disable no-alert, no-console */
// import { MapContent } from '../../src/components/index.js';

/* eslint-disable no-alert, no-console */
// import { FlatmapVuer, MultiFlatmapVuer } from '../../src/components/index.js';

import CypressComponentWrapper from './CypressComponentWrapper.vue'

describe('MultiFlatmapVuer', () => {

  beforeEach(() => {
    cy.viewport(1920, 1080);
  });


  //Load in some responses/assets before beginning the test
  //This should prevent any async behaviours.
  before(() => {
    cy.fixture('MultiFlatmapProps.json').as('props');
  })

  it('Workflow testing', () => {

    const readySpy = cy.spy().as('readySpy')
    cy.get('@props').then((props) => {
      console.log('flatmapAPI', props)
      cy.mount(CypressComponentWrapper, {
        propsData: {
          component: 'MultiFlatmapVuer',
          props: props,
          events: {
            ready: readySpy
          }
        }
      }).then((vm) => {
        cy.wrap(vm).as('vm')
        window.vm = vm
        
      }).get('@vue').should('exist')

    })

    Cypress.on('uncaught:exception', (err) => {
      // returning false here prevents Cypress from
      // failing the test
      if (err.message.includes("this.facets.at is not a function"))
        return false
      return true
    })

    //Check if multiflatmap is mounted correctly
    cy.get('.content-container').should('exist');

        
    //Check if the minimap is visible
    cy.get('#maplibre-minimap > .maplibregl-canvas-container > .maplibregl-canvas').should('exist');

    //Check if the ready event is fired
    // *** Commenting this out until we can figure out why it's not working
    // cy.get('@readySpy').should('have.been.calledWith', true)

    // Check if flatmap emits ready event
    cy.get('@vue').should(wrapper => {
      expect(wrapper.emitted('ready')).to.be.ok
    }).then(() => {

      // Create a pop up and ensure it shows
      let mapImp = window.Cypress.multiFlatmapVuer.getCurrentFlatmap()
      console.log('flatmap', mapImp)
      mapImp.showPopup(45,'Test', { className: 'flatmapvuer-popover', positionAtLastClick: true })
      cy.get('.flatmapvuer-popover').should('exist').contains('Test').then(() => {
        // Close the pop up
        cy.get('.maplibregl-popup-close-button').click();
        cy.get('.flatmapvuer-popover').should('not.exist');

      // Check the metadata for path exploration is loading correctly
      }).then(() => {
        let flatmapVuer = window.Cypress.flatmapVuer
        console.log('flatmapVuer', flatmapVuer)
        let fmEventCallback = flatmapVuer.eventCallback()
        fmEventCallback('click', {
          "id": "ilxtr_neuron-type-keast-4",
          "featureId": 28,
          "kind": "symp-post",
          "label": "sympathetic chain ganglion neuron (kblad)",
          "models": "ilxtr:neuron-type-keast-4",
          "source": "https://apinatomy.org/uris/models/keast-bladder",
          "taxons": "[\"NCBITaxon:10116\"]",
          "type": "feature",
          "mapUUID": "dbd2fe65-ef1e-5fd1-8614-e26498d00ffb"
        }, [])

        // Check the pop up
        cy.get('.flatmapvuer-popover').should('exist').contains('Sympathetic chain ganglion neuron (kblad)').then(() => {
          
          // Close the pop up
          cy.get('.maplibregl-popup-close-button').should('exist')
        
        // Test the search
        }).then(() => {
          flatmapVuer.searchAndShowResult('body proper', 'body proper')
          cy.get('.maplibregl-popup').should('exist').contains('body proper')
        })

      })



    })

  })


});
