/* eslint-disable no-alert, no-console */
const ERROR_TOLERANCE = parseFloat(Cypress.env('ERROR_TOLERANCE')) || 0.1

// Ref: flatmap-viewer/src/layers/styling.ts
const STROKE_INTERPOLATION = [
  'interpolate',
  ['exponential', 2],
  ['zoom'],
   2, ["*", ['var', 'width'], ["^", 2,  0.5]],
   7, ["*", ['var', 'width'], ["^", 2,  1.5]],
   9, ["*", ['var', 'width'], ["^", 2,  2.0]]
]

const modifyRenderedMap = (mapImp) => {
  const map = mapImp.map
  mapImp.setPaint({ coloured: true, outlined: false });
  if (map) {
    const layers = [
      'simple-test_pathways_nerve-centreline-edge',
      'simple-test_pathways_nerve-centreline-track',
    ];

    layers.forEach(layerId => {
      try {
        map.setPaintProperty(layerId, 'line-width', [
          'let',
          'width',
          2,
          STROKE_INTERPOLATION
        ]);

        map.setPaintProperty(layerId, 'line-color', '#ccc');
        map.setPaintProperty(layerId, 'line-opacity', 0.4);
      } catch (error) {
        console.log(`Layer ${layerId} not found or already updated`);
      }
    });
  }
};

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

    // Get the flatmap UUID and API from the loaded component
    cy.window().then((win) => {
      const flatmapVuer = win.Cypress.multiFlatmapVuer.getCurrentFlatmap();
      const mapImp = flatmapVuer.mapImp;
      const flatmapUUID = mapImp.uuid;

      // Wait for the map canvas to appear
      cy.get('.maplibregl-touch-zoom-rotate > .maplibregl-canvas:visible', { timeout: 30000 }).should('exist');

      cy.wait(1000);
      cy.get('.el-loading-mask', { timeout: 30000 }).should('not.exist');    // Hide drawer
      mapImp.enablePath('centreline', true); // Enable centreline
      mapImp.setPaint({ coloured: true, outlined: false }); // outline false
      modifyRenderedMap(mapImp); // modify centreline style
      cy.wait(2000);

      // Take screenshot of viewer canvas
      cy.get('.maplibregl-touch-zoom-rotate > .maplibregl-canvas:visible').as('viewerCanvas');
      // CLI
      cy.get('@viewerCanvas').screenshot('base/cypress/component/VisualTest.cy.js/viewer-canvas')
      // UI
      cy.get('@viewerCanvas').screenshot('VisualTest.cy.js/base/cypress/component/VisualTest.cy.js/viewer-canvas')

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
            // TODO: current result 0.2663686412274386
            expect(comparisonResults.percentage, 'Base map and viewer map should render identically').to.be.lessThan(ERROR_TOLERANCE);
          });
        });
      });
    });
  });

});
