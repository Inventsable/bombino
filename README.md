# bombino

### Rebuild of generators [cep-vue-cli](https://github.com/Inventsable/generator-cep-vue-cli) and [cep-quasar-cli](https://github.com/Inventsable/generator-cep-quasar-cli)

[![NPM](https://nodei.co/npm/bombino.png)](https://nodei.co/npm/bombino/)

Supercharged Adobe CEP panel generator for Vue with dynamic template support for Vue-CLI and Quasar-CLI.

![](https://thumbs.gfycat.com/PiercingDizzyImperialeagle-size_restricted.gif)

## Installation

```bash
npm install -g bombino
```

Then generate your new project:

```bash
# Recommended inside ../AppData/Roaming/CEP/extensions
bombino

# Prompt for action (create panel or create template)
# Prompt for build system (Vue-CLI / Quasar-CLI)
# Prompt for name
# Prompt for template
# Prompt for Adobe apps to be included in manifest and typescript
# Prompt for localhost port
```

---

## Templates

See more information about usage:

### Vue-CLI

- [Bare](https://github.com/Inventsable/cep-vue-cli-bare3x) (No extras)
- [Basic](https://github.com/Inventsable/cep-vue-cli-basic3x) (Barebones with utility components)
- [Router](https://github.com/Inventsable/cep-vue-cli-router3x) (Basic + Vue Router)
- [Vuetify](https://github.com/Inventsable/cep-vue-cli-plus3x) (Vuetify, Router, Lottie, Modal Dialogs)
- ~~[Quasar]() (Quasar, Router, Modal Dialogs)~~
- ~~[Buefy]() (Bulma, Router, Modal Dialogs)~~
- ~~[Bootstrap]() (Bootstrap, Router, Modal Dialogs)~~

### Quasar-CLI

- [Plus](https://github.com/Inventsable/cep-quasar-cli-plus) (Vuex, Router, Lottie, Modal Dialogs)
- ~~[Bare](https://github.com/Inventsable/cep-quasar-cli-bare) (No extras)~~
- ~~[Basic](https://github.com/Inventsable/cep-quasar-cli-basic) (Barebones with utility components)~~

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
