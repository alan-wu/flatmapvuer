# FlatmapVuer

This project aims to wrap the flatmap viewer project into a vue component.
There are currently two components available. FlatmapVuer and MultiFlatmapVuer. FlatmapVuer is used for displaying a single flatmap whereas MultiFlatmapVuer takes in an array of flatmaps and provide a chooser for selecting the flatmap on display.

## Project setup
```
npm install
```

### Compiles and minifies for production
```
npm run build-bundle
```

## How to use
Install the package "npm i @abi-software/flatmapvuer" to your vue app.
Include the package in your script.
```javascript
import '@abi-software/flatmapvuer';
```

The line above registers both the FlatmapVuer and MultiFlatmapVuer component into the global scope.
You can now use the FlatmapVuer in your vue template as followed:
```html
<FlatmapVuer entry="NCBITaxon:9606"   v-on:resource-selected="FlatmapSelected"  v-on:ready="FlatmapReady"/>
```

**entry** is the variable/string with the NCBI Taxonomy term. There are five available at this moment:
NCBITaxon:9606 (Human), NCBITaxon:9685 (Cat), NCBITaxon:9823 (Pig), NCBITaxon:10090 (Mouse) and NCBITaxon:10114 (Rat)

**ready** is the custom event when the map has been loaded successfully.
**resource-selected** is the custom event triggered when a part of the flatmap is selected, the returned argument **resource** provides information of the selected resource. 

Markers must be added to make a label selectable and it can be done through the **addMarker** method on the mapImp member of the FlatmapVuer component.

Please see the following sample codes for details.

```javascript
  methods: {
    FlatmapSelected: function(resource) {
     console.log(resource);
    },
    FlatmapReady: function(flatmapComponent) {
      labels = flatmapComponent.getLabels(); //return list of labels
      //The following line adds a marker on the map. UBERON:0000948 
      //is the UBERON id representing the heart.
      flatmapComponent.mapImp.addMarker("UBERON:0000948", "simulation");
    }
  }
```

You can also use MultiFlatmapVuer to provide a selection of flatmaps.
```html
<MultiFlatmapVuer :availableSpecies="availableSpecies" 
  @resource-selected="FlatmapSelected"
  @ready="FlatmapReady" :initial="initial"/>
```
**availableSpecies** is the object containing information of available species for the users. See below for an example:
```javascript
  availableSpecies : {
    "Human":{taxo: "NCBITaxon:9606", iconClass:"icon-mapicon_human"},
    "Rat":{taxo: "NCBITaxon:10114", iconClass:"icon-mapicon_rat"},
    "Mouse":{taxo: "NCBITaxon:10090", iconClass:"icon-mapicon_mouse"},
    "Pig":{taxo: "NCBITaxon:9823", iconClass:"icon-mapicon_pig"}, 
    "Cat":{taxo: "NCBITaxon:9685", iconClass:"icon-mapicon_cat"},
  }
```
The keys of the codes above provide the labels on the chooser, **taxo** should be one of the available taxon id from the list and **iconClass** specifies the user provided icons to use.

**initial** specifies the start up species when the component is first mounted, it should be one of the keys on the provided available species.

```
npm run serve
```
