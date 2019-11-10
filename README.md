# bombino

### Rebuild of generators [cep-vue-cli](https://github.com/Inventsable/generator-cep-vue-cli) and [cep-quasar-cli](https://github.com/Inventsable/generator-cep-quasar-cli)

[![NPM](https://nodei.co/npm/bombino.png)](https://nodei.co/npm/bombino/)

Supercharged Adobe CEP panel generator for nodeJS + Vue projects with dynamic template support for Vue-CLI and Quasar-CLI, or configurable custom tooling presets

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

## Create a new Panel

Generate a new panel from local or cloud-based templates in just a few seconds:

![](https://thumbs.gfycat.com/BestConfusedCow-size_restricted.gif)

Settings are very similar to [generator-cep-vue-cli](https://github.com/Inventsable/generator-cep-vue-cli), but are far more versatile and dynamic in how they're applied, now supporting any Github link (queried on launch, not hardcoded) or any private folder on your own machine.

> Note that multiple Inquirer.js instantiations in a Promise chain are [known to cause graphical errors](https://github.com/SBoudrias/Inquirer.js/issues/811) -- if you select Bombino default templates and reach the "Want to use the \_\_\_\_ template" or "Select a template" screen, you may need to press Enter before Inquirer receives input. Trying to fix this

## Create a new Template

Take any valid panel and turn it into a usable template, prompting to save to the Create a new Template list in command:

![](https://thumbs.gfycat.com/PointedAgileBarb-size_restricted.gif)

This data is saved locally within a `.bombino` json config file, supporting the ability to customize relative path location to files alongside placeholder value and RegExp detection depending on your specific needs or tooling preset.

## Customize config

Coming soon

---

## Cloud Templates

See more information about usage:

### Vue-CLI

- [Bare](https://github.com/Inventsable/bombino-vue-bare) (No extras)
- [Basic](https://github.com/Inventsable/bombino-vue-basic) (Barebones with utility components)
- [Router](https://github.com/Inventsable/bombino-vue-router) (Basic + Vue Router)
- [Vuetify](https://github.com/Inventsable/bombino-vue-plus) (Vuetify, Router, Lottie, Modal Dialogs)
- ~~[Quasar]() (Quasar, Router, Modal Dialogs)~~
- ~~[Buefy]() (Bulma, Router, Modal Dialogs)~~
- ~~[Bootstrap]() (Bootstrap, Router, Modal Dialogs)~~

### Quasar-CLI

- [Plus](https://github.com/Inventsable/bombino-quasar-plus) (Vuex, Router, Lottie, Modal Dialogs)
- ~~[Bare](https://github.com/Inventsable/bombino-quasar-bare) (No extras)~~
- ~~[Basic](https://github.com/Inventsable/bombino-quasar-basic) (Barebones with utility components)~~

## Commands

Each template comes with 5 commands baked in ([see details here](https://github.com/Inventsable/CEP-Self-Signing-Panel#what-do-they-do)):

- `npm run help` - A full list of the commands available and descriptions.
- `npm run switch` - Reports whether in developer or production context and can switch automatically.
- `npm run update` - Reports current version of panel in manifest and prompts to update Major, Minor, or Micro.
- `npm run register` - Reports the current user data (if any) and prompts to save new info to be used in certificates.
- `npm run sign` - Automatically stages and signs the extension, placing it in a `./archive` directory within the current panel.

## Extras and Add-ons

- [starlette](https://github.com/Inventsable/starlette) _(Shipped in all templates)_ - Color and theming engine that handles all host app colors and exposes them as reactive CSS variables to save you the need to do any theme or color logic yourself.
- [leylo](https://github.com/Inventsable/leylo) - Library to integrate a Firebase backend into any panel with a single command and line of code, providing over 40 CRUD actions for Firestore database.

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
