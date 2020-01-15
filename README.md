# flatmapvuer

This project aims to wrap the flatmap viewer project into a vue compoinent.


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

The codes above registers the ScaffoldVuer component into the global scope.
You can now use the ScaffoldVuer in your vue template as followed:
```html
<FlatmapVuer entry="NCBITaxon:9606" v-on:resource-selected="FlatmapSelected"  style="height:100%"/>
```

entry should be the variable/string containing the NCBI Taxonomy term. There are two available at this moment:
NCBITaxon:9606 and NCBITaxon:10114
NCBITaxon:9606 and NCBITaxon:10114 represents human and rat respectively.
resource-selected is the custom event triggered when a part of the flatmap is selected, see below for a
sample callback.

```javascript
  methods: {
    FlatmapSelected: function(resource) {
     console.log(resource);
    }
  }
```
The resource argument contains two component: taxonomy and resource.
taxonomy: The NCBI taxonomy
Resource: An array containing UBERON id describing the selected part(s).

You can also see the FlatmapVuer in action by running
```
npm run serve
```