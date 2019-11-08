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

  _MODELS: [
    {
      name: "VUE",
      label: "Vue-CLI",
      placeholders: ["name", "title", "hostlist", "hostlist_debug"]
    },
    {
      name: "QUASAR",
      label: "Quasar-CLI",
      placeholders: [
        "name",
        "title",
        "hostlist",
        "hostlist_debug",
        "qDesc",
        "qWidth",
        "qHeader"
      ]
    }
  ],
  _TEMPLATES: [
    {
      index: 0,
      name: "bombino-vue-test",
      label: "Test (sample Vue)",
      path:
        "C:\\Users\\TRSch\\AppData\\Roaming\\Adobe\\CEP\\extensions\\bombino-vue-test",
      model: "VUE",
      gitURL: null
    },
    {
      index: 0,
      name: "bombino-quasar-test",
      label: "Test (sample Quasar)",
      path:
        "C:\\Users\\TRSch\\AppData\\Roaming\\Adobe\\CEP\\extensions\\bombino-quasar-test",
      model: "QUASAR",
      gitURL: null
    }
  ],
  _OPTIONS: {
    dirty: false
  },
  _PLACEHOLDERS: {
    // targets parameter is redudant given keys of panelRX
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
      targets: ["manifest", "dev", "package", "packageLock"]
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
        // Requires injecting <HostList> wrapping tag
        manifest: /\<HostList\>([\w|\W]*)\<\/HostList\>/
      },
      targets: ["manifest"]
    },
    hostlist_debug: {
      value: `$BOMBINO_DEBUG_HOSTLIST$`,
      templateRX: /\$BOMBINO_DEBUG_HOSTLIST\$/,
      panelRX: {
        debug: /(\<Extension\s.*\>[\w|\W]*\<\/Extension\>)/
      },
      targets: ["debug"]
    },
    // desc: {
    //   value: `$BOMBINO_DESC$`,
    //   templateRX: /\$BOMBINO_DESC\$/,
    //   panelRX: {
    //     debug: /a/
    //   },
    //   targets: ["package"]
    // },
    qDesc: {
      value: `$BOMBINO_QUASAR_DESC$`,
      templateRX: /\$BOMBINO_QUASAR_DESC\$/,
      panelRX: {
        index: /\<meta[^.]*content\=\"(.*)\"/
      },
      targets: ["index"],
      override: `<%= htmlWebpackPlugin.options.productDescription %>`
    },
    qWidth: {
      value: `$BOMBINO_QUASAR_WIDTH$`,
      templateRX: /\$BOMBINO_QUASAR_WIDTH\$/,
      panelRX: {
        index: /width\=device-width(.*)\"/
      },
      targets: ["index"],
      override: `<% if (htmlWebpackPlugin.options.ctx.mode.cordova || htmlWebpackPlugin.options.ctx.mode.capacitor) { %>, viewport-fit=cover<% } %>`
    },
    qHeader: {
      value: `$BOMBINO_QUASAR_HEADER$`,
      templateRX: /\$BOMBINO_QUASAR_HEADER\$/,
      panelRX: {
        index: /\<meta[^.]*content\=\"(.*)\"/
      },
      targets: ["index"],
      override: `<%= htmlWebpackPlugin.options.productName %>`
    }
  }
};
