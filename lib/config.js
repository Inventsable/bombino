module.exports = {
  VUE: {
    index: "./public/index.html",
    dev: "./public/index-dev.html",
    manifest: `./CSXS/manifest.xml`,
    debug: `./.debug`,
    package: `./package.json`,
    packageLock: `./package-lock.json`,
    host: `./src/host/`
  },
  QUASAR: {
    index: "./src/index.template.html",
    dev: "./src/index-dev.html",
    manifest: `./CSXS/manifest.xml`,
    debug: `./.debug`,
    package: `./package.json`,
    packageLock: `./package-lock.json`,
    host: `./src/host/`
  },
  _MODELS: ["VUE", "QUASAR"],
  _PLACEHOLDERS: {
    name: {
      value: `$BOMBINO_NAME$`,
      templateRX: /\$BOMBINO_NAME\$/gm,
      panelRX: {
        manifest: /\<Extension\sId\=\"([\w|\.|\-]*)\"/gm,
        index: /\<title\>(.*)\<\/title\>/,
        dev: /\<title\>(.*)\<\/title\>/,
        package: /\"name\"\:\s\"(.*)\"/,
        packageLock: /\"name\"\:\s\"(.*)\"/
      },
      targets: ["index", "manifest", "dev", "package", "packageLock"]
    },
    title: {
      value: `$BOMBINO_TITLE$`,
      templateRX: /\$BOMBINO_TITLE\$/gm,
      panelRX: {
        manifest: /\<Menu\>(.*)\<\/Menu\>/
      },
      targets: ["manifest"]
    },
    hostlist: {
      value: `$BOMBINO_HOSTLIST$`,
      templateRX: /\$BOMBINO_HOSTLIST\$/gm,
      panelRX: {
        manifest: /a/
      },
      targets: ["manifest"]
    },
    hostlist_debug: {
      value: `$BOMBINO_DEBUG_HOSTLIST$`
    },
    desc: {
      value: `$BOMBINO_DESC$`
    },
    qWidth: {
      value: `$BOMBINO_QUASAR_WIDTH$`
    }
  },
  generateConfig(config, type, name) {
    return Object.keys(config[type]).map((key, i) => {
      return config[type][key].replace(/^\./, `./${name}`);
    });
  }
};

// let PATHS = {
//   name: DIR_NAME,
//   index: `./${DIR_NAME}/${
//     settings.isVue
//       ? "public/index.html"
//       : settings.isQuasar
//       ? "src/index.template.html"
//       : ""
//   }`,
//   dev: `./${DIR_NAME}/${
//     settings.isVue
//       ? "public/index-dev.html"
//       : settings.isQuasar
//       ? "src/index-dev.html"
//       : ""
//   }`,
//   manifest: `./${DIR_NAME}/CSXS/manifest.xml`,
//   debug: `./${DIR_NAME}/.debug`,
//   package: `./${DIR_NAME}/package.json`,
//   packageLock: `./${DIR_NAME}/package-lock.json`,
//   host: `./${DIR_NAME}/src/host/`
// };

// let PLACEHOLDERS = {
//   name: `$BOMBINO_NAME$`,
//   title: `$BOMBINO_TITLE$`,
//   hostlist: `$BOMBINO_HOSTLIST$`,
//   hostlist_debug: `$BOMBINO_DEBUG_HOSTLIST$`,
//   desc: `$BOMBINO_DESC$`,
//   qWidth: `$BOMBINO_QUASAR_WIDTH$`
// };
