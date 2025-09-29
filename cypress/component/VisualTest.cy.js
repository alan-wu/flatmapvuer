/* eslint-disable no-alert, no-console */
const ERROR_TOLERANCE = parseFloat(Cypress.env('ERROR_TOLERANCE')) || 0.1

describe('MultiFlatmapVuer Screenshot Comparison', () => {

  beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.fixture('MultiFlatmapPropsDevel.json').then((props) => {
      const modifiedProps = {
        ...props,
        displayMinimap: false,
        disableUI: true,
      };
      cy.wrap(modifiedProps).as('develProps');
    });
  });

  it('should render the same content as base map', () => {
    cy.loadMultiFlatmap('@develProps', 'Test');

    // Wait for MultiFlatmap to be ready
    cy.get('@readySpy').should('have.been.called');

    // Wait for the map canvas to appear
    cy.get('.maplibregl-touch-zoom-rotate > .maplibregl-canvas:visible', { timeout: 30000 }).should('exist');

    cy.wait(1000);
    cy.get('.el-loading-mask', { timeout: 30000 }).should('not.exist');    // Hide drawer
    cy.wait(2000);

    // Take screenshot of viewer canvas
    cy.get('.maplibregl-touch-zoom-rotate > .maplibregl-canvas:visible').as('viewerCanvas');
    cy.get('@viewerCanvas').screenshot('viewer-canvas');

    // Get the flatmap UUID and API from the loaded component
    cy.window().then((win) => {
      const flatmapVuer = win.Cypress.multiFlatmapVuer.getCurrentFlatmap();
      const flatmapUUID = flatmapVuer.mapImp.uuid;

      cy.get('@develProps').then((props) => {
        const flatmapAPI = props.flatmapAPI;
        const baseMapUrl = `${flatmapAPI}flatmap/${flatmapUUID}`;

        // Create iframe in the same document to load base map
        cy.document().then((doc) => {
          // Clear the body and add iframe
          doc.body.innerHTML = '';
          const iframe = doc.createElement('iframe');
          iframe.src = baseMapUrl;
          iframe.style.width = '100%';
          iframe.style.height = '100vh';
          iframe.style.border = 'none';
          iframe.id = 'base-map-iframe';
          doc.body.appendChild(iframe);

          // Wait for iframe to load and render
          cy.get('#base-map-iframe', { timeout: 30000 }).should('exist');
          cy.wait(8000);

          // Take screenshot of iframe
          cy.get('#base-map-iframe').as('baseMapIframe');
          cy.get('@baseMapIframe').screenshot('base-canvas');

          // Compare screenshots
          cy.get('@baseMapIframe').compareSnapshot('viewer-canvas').then(comparisonResults => {
            expect(comparisonResults.percentage, 'Base map and viewer map should render identically').to.be.lessThan(ERROR_TOLERANCE);
          });
        });
      });
    });
  });

});
