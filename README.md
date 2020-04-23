# bombino

[![NPM](https://nodei.co/npm/bombino.png)](https://nodei.co/npm/bombino/)

| [Installation](#installation) | [Create Panel](#create-panel) | [Create Template](#create-template) | [Templates](#templates) | [Commands](#commands) | [Config](#config) |
| ----------------------------- | :---------------------------: | :---------------------------------: | :---------------------: | :-------------------: | :---------------: |


Supercharged rebuild of generators [cep-vue-cli](https://github.com/Inventsable/generator-cep-vue-cli) and [cep-quasar-cli](https://github.com/Inventsable/generator-cep-quasar-cli) for creating Adobe CEP panel with nodeJS + Vue, includes dynamic template support for Vue-CLI and Quasar-CLI, cloud or private local repositories, and configurable custom tooling presets (user-defined path locations).

## Installation

```bash
npm install -g bombino
```

Then generate your new project:

```bash
# Recommended inside ../AppData/Roaming/CEP/extensions
bombino

# > Prompt to create a new panel from template
# > Prompt to create a new template from panel
```

---

## Create Panel

Generate a new panel from local or cloud-based templates in just a few seconds:

![](https://thumbs.gfycat.com/BestConfusedCow-size_restricted.gif)

If no local templates are found in config, cloud templates are automatically selected. Settings are very similar to [generator-cep-vue-cli](https://github.com/Inventsable/generator-cep-vue-cli), but are far more versatile and dynamic in how they're applied, now supporting any Github link (queried on launch, not hardcoded) or any private folder on your own machine.

> Note that multiple Inquirer.js instantiations in a Promise chain are [known to cause graphical errors](https://github.com/SBoudrias/Inquirer.js/issues/811) -- if you select Bombino default templates and reach the "Want to use the \_\_\_\_ template" or "Select a template" screen, you may need to press Enter before Inquirer receives input. Trying to fix this

## Create Template

Take any valid panel and turn it into a usable template, prompting to save to the Create a new Template list in command. This should be used on the parent folder of the template, and will prompt to create a template of any child:

![](https://thumbs.gfycat.com/PointedAgileBarb-size_restricted.gif)

This data is saved locally within a `.bombino` json config file, supporting the ability to customize relative path location to files alongside placeholder value and RegExp detection depending on your specific needs or tooling preset.

---

## Templates

See more information about usage:

### Vue-CLI

- [Bare](https://github.com/Inventsable/bombino-vue-bare) (No extras)
- [Basic](https://github.com/Inventsable/bombino-vue-basic) (Barebones with utility components)
- [Router](https://github.com/Inventsable/bombino-vue-router) (Basic + Vue Router)
- [Vuetify](https://github.com/Inventsable/bombino-vue-vuetify) (Vuetify, Router, Lottie, Modal Dialogs)
- [Brutalism Basic](https://github.com/Inventsable/bombino-brutalism-basic) (Brutalism + Utilities)
- [Brutalism Router](https://github.com/Inventsable/bombino-brutalism-router) (Brutalism, Router + Utilities)

### Quasar-CLI

- [Plus](https://github.com/Inventsable/bombino-quasar-plus) (Vuex, Router, Lottie, Modal Dialogs)
- ~~[Bare](https://github.com/Inventsable/bombino-quasar-bare) (No extras)~~
- ~~[Basic](https://github.com/Inventsable/bombino-quasar-basic) (Barebones with utility components)~~

## Commands

Each template comes with 5 commands baked in ([see details here](https://github.com/Inventsable/bombino-commands#commands-will-update-for-bombino-soon)):

- `npm run help` - A full list of the commands available and descriptions.
- `npm run switch` - Reports whether in developer or production context and can switch automatically.
- `npm run update` - Reports current version of panel in manifest and prompts to update Major, Minor, or Micro.
- `npm run register` - Reports the current user data (if any) and prompts to save new info to be used in certificates.
- `npm run sign` - Automatically stages and signs the extension, placing it in a `./archive` directory within the current panel.

## Extras

- [starlette](https://github.com/Inventsable/starlette) _(Shipped in all templates)_ - Color and theming engine that handles all host app colors and exposes them as reactive CSS variables to save you the need to do any theme or color logic yourself.
- [cep-spy](https://github.com/Inventsable/CEP-Spy) _(Shipped in all templates)_ - Lightweight, no dependency utility for revealing all information about the current host app, current panel, environment and even sibling CEP extensions.
- [cluecumber](https://github.com/Inventsable/cluecumber) _(Shipped in all templates)_ - Browser-friendly utilities for using CSInterface, opening links, async evalScript, and more.
- [brutalism](https://github.com/Inventsable/brutalism) - Battleaxe's component library for Adobe CEP panels.
- [panelify](https://github.com/Inventsable/panelify) - Vue component to create a browser wrapper of any style Adobe host for your extension
- [scriptopia](https://github.com/Inventsable/scriptopia) _(Already taken care of in bombino templates)_ - Generate Typescript support for any compatible Adobe app
- [leylo](https://github.com/Inventsable/leylo) - Library to integrate a Firebase backend into any panel with a single command and line of code, providing over 40 CRUD actions for Firestore database.

---

## Config

Upon creating a new panel or template, a localized `.bombino` (JSON) file is created to store your settings. This controls all the logic used to find, modify, replace and update your data. The structure is:

```js
{
  // Custom or default tooling, only used to define where the target files are relative to your project.
  // [model-name]: {
  "VUE": {
    "paths": {
      // These are the locations of files which should be targeted for PLACEHOLDER injection
      // [key]: [relative-path],
      "index": "./public/index.html",
      "manifest": "./CSXS/manifest.xml"
      // etc. Note that "relative" is to the template, not the parent folder launching bombino
    }
  },
  // Models are an array of tooling systems (default Vue-CLI and Quasar-CLI). New toolings with specific needs/file-paths can be added here
  "_MODELS": [
    {
      // name: string associated with above [model-name] (must be exact)
      "name": "VUE",
      // label: description to show on prompts of which tooling to use
      "label": "Vue-CLI",
      // placeholders: currently unused, strict cap on which placeholders
      "placeholders": ["name", "title", "hostlist", "hostlist_debug"],
      // exclusive: if this file exists in a repo, know it must be this tooling.
      // This is used to auto-suggest tooling rather than prompt every time.
      "exclusive": "./vue.config.js",
      // isCustom: boolean for whether or not this was a user-generated template
      "isCustom": false
    }
  ],
  // Any user-generated templates to prompt as LOCAL
  "_TEMPLATES": [
    {
      // index: used for sorting to display in list (lower numbers at top)
      "index": 0,
      // name: unique string associated with this template folder
      "name": "bombino-vue-test",
      // label: Description to show in brackets after name within prompts
      "label": "sample Vue",
      // path: if from a private directory, provide the absolute path for download
      "path": "C:\\Users\\TRSch\\AppData\\Roaming\\Adobe\\CEP\\extensions\\bombino-vue-test",
      // model: exact key to match above tooling schema
      "model": "VUE",
      // gitURL: if from a GitHub repo, provide [user]/[repo] for download
      "gitURL": null
    }
  ],
  //
  "_OPTIONS": {
    // dirty: Boolean, if false then this config is the default and hasn't been changed by user.
    "dirty": true,
    // Add a quick prompt for using the last template again (skipping multiple prompts)
    "lastTemplate": "my-custom-template"
    // more to come
  },
  //
  "_PLACEHOLDERS": {
    "name": {
      // value: what to search for or inject. If creating a panel, search for this value.
      // If creating a template, inject this value
      "value": "$BOMBINO_NAME$",
      // templateRX: RegExp to use for combing template if creating a panel
      "templateRX": "/\\$BOMBINO_NAME\\$/gm",
      // settingsKey: exact match of key-value pair within prompt answers, giving value to replace PLACEHOLDER
      "settingsKey": "extName",
      // panelRX: file-specific RegExp to find user-content and replace it with a PLACEHOLDER.
      "panelRX": {
        // Note that keys match the root-level [model-name].paths tooling object
        "manifest": "/\\<Extension\\sId\\=\\\"([\\w|\\.|\\-]*)\\\"/gm",
        // RegExp must be contained in string (as they have no JSON support)
        "index": "/\\<title\\>(.*)\\<\\/title\\>/",
        // The content to replace must be in the First Capture Group (within round brackets)
        "dev": "/\\<title\\>(.*)\\<\\/title\\>/"
      },
      // If this is a static value, you can add optional parameter here to control the injected value (replacing $BOMBINO_NAME$):
      "override": "<%= htmlWebpackPlugin.options.productName %>"
    }
  }
}
```

---

## Contributors

Special thanks to Adam and Eric for their invaluable help

| <a href="https://github.com/Inventsable"><img src="https://avatars2.githubusercontent.com/u/37279677?s=460&v=4" alt="tom" width="100"/></a> | <a href="https://github.com/adamplouff"><img src="https://avatars1.githubusercontent.com/u/8580225?s=460&v=4" alt="adam" width="100"/></a> | <a href="https://github.com/ericdrobinson"><img src="https://avatars0.githubusercontent.com/u/9142587?s=460&v=4" alt="eric" width="100"/></a> |
| :-----------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------: |
|                                              [Tom Scharstein](https://github.com/Inventsable)                                               |                                                [Adam Plouff](https://github.com/adamplouff)                                                |                                               [Eric Robinson](https://github.com/ericdrobinson)                                               |
|                                                                   Creator                                                                   |                                                              General Wizardry                                                              |                                                               Inspector General                                                               |

---

## License

MIT © [Tom Scharstein](www.inventsable.cc)
