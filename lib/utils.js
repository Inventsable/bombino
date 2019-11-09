const static = require("./staticValues");
const chalk = require("chalk");
const fs = require("fs");
const fse = require("fs-extra");
const download = require("download-git-repo");
const ora = require("ora");

const _CONFIG = require("./config");

const path = require("path");

module.exports = {
  // MISC
  //
  log(msg) {
    if (arguments.length) console.log(`${msg}`);
    else console.log("");
  },
  getDirName(settings) {
    return settings.extName.split(" ").join("-");
  },
  getID(settings) {
    return settings.extName.split(" ").join("_").toLowerCase;
  },
  reverseID(name) {
    return name.split("_").join(" ");
  },
  reverseDirName(name) {
    return name.split("-").join(" ");
  },
  async readDir(thispath) {
    return new Promise((resolve, reject) => {
      fs.readdir(
        path.resolve(thispath),
        { encoding: "utf-8" },
        (err, files) => {
          if (err) reject(err);
          resolve(files);
        }
      );
    });
  },
  _downloadTemplate(settings) {
    return new Promise((resolve, reject) => {
      download(
        `${settings.templateType}`,
        settings.extName.split(" ").join("-"),
        err => (err ? reject(err) : resolve(settings))
      );
    });
  },
  _downloadGitRepo(settings) {
    return new Promise((resolve, reject) => {
      download(
        `${settings.location}`,
        settings.extName.split(" ").join("-"),
        err => (err ? reject(err) : resolve(settings))
      );
    });
  },

  // CONFIG
  //
  async getConfig() {
    let hasConfig = await this.getLocalConfig();
    return !hasConfig ? this.getDefaultConfig() : hasConfig;
  },
  async getDefaultConfig() {
    return new Promise((resolve, reject) => {
      // let fakeTest = JSON.parse(JSON.stringify(_CONFIG));
      if (_CONFIG) resolve(_CONFIG);
      else reject("No config specified");
    });
  },
  async getLocalConfig() {
    let contents = fs.readdirSync("./");
    return contents.includes(".bombino")
      ? JSON.parse(fs.readFileSync("./.bombino", { encoding: "utf-8" }))
      : false;
  },
  createFakeConfig() {
    return _CONFIG["VUE"];
  },
  async setConfig(data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        "./.bombino",
        JSON.stringify(data, this.stringifyFilter),
        err => {
          if (err) reject(err);
          resolve(true);
        }
      );
    });
  },
  generateFinalizedConfig(config, type, name) {
    Object.keys(config[type].paths).map((key, i) => {
      config[type].paths[key] = config[type].paths[key].replace(
        /^\./,
        `./${name}`
      );
    });
    return config[type].paths;
  },
  generateHostPath(config, type, name) {
    return config[type].host.replace(/^\./, `./${name}`);
  },
  async getLocalTemplates() {
    let contents = fs.readdirSync("./");
    return contents.includes(".bombino")
      ? this.getValidTemplates(
          JSON.parse(fs.readFileSync("./.bombino", { encoding: "utf-8" }))
        )
      : false;
  },
  async setOptions(key, value) {
    let config = await this.getConfig();
    config._OPTIONS[key] = value;
    return this.setConfig(config);
  },
  getValidTemplates(data) {
    // let templates = [];
    // data._MODELS.forEach(tooling => {
    //   templates.push({
    //     name: tooling.name,
    //     label: tooling.label,
    //     placeholders: tooling.placeholders
    //     // content: data[tooling.name]
    //   });
    // });
    return data._TEMPLATES.length ? data._TEMPLATES : false;
  },
  async addLocalTemplate(template) {
    let db = this.getConfig();
    db[template.name] = template.data;
    db._MODELS.push({
      name: template.name,
      label: template.label,
      placeholders: ["name", "title", "hostlist", "hostlist_debug"]
    });
    return await this.setConfig(db);
  },
  //
  async duplicateDir(from, to, settings) {
    await fse.copy(path.resolve(from), path.resolve(to));
    return settings;
  },

  //  CREATE PANEL  //
  //
  // Construct string to inject into ./CSXS/manifest.xml for <HostList> parameter
  _constructManifestText(settings) {
    return new Promise(resolve => {
      let mirror = [];
      settings.hostList.forEach((item, i) => {
        const host = static.CEP_HOSTLIST.find(part => {
          return part.name === item;
        });
        let str = `${i > 0 ? `\r\n      ` : ""}<Host Name="${
          host.name
        }" Version="${host.version}" />`;
        mirror.push(str);
      });
      resolve(mirror.join(""));
    });
  },
  //
  // Construct <Host> tags for any valid template by chosen app and port number
  _constructDebugText(settings) {
    return new Promise(resolve => {
      let mirror = [];
      const hasModal = settings.hasModal;
      settings.hostList.forEach((item, i) => {
        let portNum = hasModal
          ? settings.portNum + i * 2
          : settings.portNum + i;

        const host = static.CEP_HOSTLIST.find(part => {
          return part.name === item;
        });

        let str = `<Extension Id="com.${settings.id}.panel">
        <HostList>
            <Host Name="${host.name}" Port="${portNum}" />
        </HostList>
    </Extension>`;
        str += hasModal
          ? `<Extension Id="com.${settings.id}.modal">
        <HostList>
            <Host Name="${host.name}" Port="${portNum + 1}" />
        </HostList>
    </Extension>`
          : "";
        mirror.push(str);
      });
      resolve(mirror.join(""));
    });
  },
  stringifyFilter(name, val) {
    // convert RegExp to string
    if (val && val.constructor === RegExp) {
      return val.toString();
    } else if (name === "str") {
      //
      return undefined; // remove from result
    } else {
      return val; // return as is
    }
  },
  sanitizeRX(string) {
    let hasFlags = /\/[a-z]{1,}$/.test(string);
    if (hasFlags) {
      let flags = string.match(/[a-z]{1,}$/)[0];
      string = string.replace(/^\//, "");
      string = string.replace(/\/[a-z]{0,}$/, "");
      return new RegExp(string, flags);
    } else {
      string = string.replace(/^\//, "");
      string = string.replace(/\/[a-z]{0,}$/, "");
      return new RegExp(string);
    }
  },
  async _correctPlaceholders(SETTINGS) {
    //
    let config = await this.getConfig();
    SETTINGS["dirName"] = SETTINGS.extName.split(" ").join("-");
    SETTINGS["id"] = SETTINGS.dirName.toLowerCase();

    let spinner = ora({
      text: `Correcting placeholders...`,
      spinner: static.ORA_SPINNER
    }).start();

    // Inject extension name into relative file paths of tooling model
    let PATHS = this.generateFinalizedConfig(
      config,
      SETTINGS.model,
      SETTINGS.dirName
    );

    // Construct more complicated strings needed for hostlists in manifest and debug
    SETTINGS["manifestHostlist"] = await this._constructManifestText(SETTINGS);
    SETTINGS["debugHostlist"] = await this._constructDebugText(SETTINGS);

    Object.keys(PATHS).forEach((key, index) => {
      //
      console.log(key);
      // Grab filedata from desired path
      let FILE_DATA = fs.readFileSync(PATHS[key], "utf8");
      let dirty = false;
      //
      // loop through all placeholder objects and test if it matches
      let placeholders = config._PLACEHOLDERS;
      Object.keys(placeholders).forEach((pKey, p) => {
        let placeholder = placeholders[pKey];
        let settingsKey = placeholder.settingsKey;
        let rx = this.sanitizeRX(placeholder.templateRX);
        let keymatch = SETTINGS[settingsKey] || placeholder.override;

        if (rx.test(FILE_DATA)) {
          dirty = true;
          // If this is a specialized Quasar variable, use the override value
          if (
            /quasar/.test(SETTINGS.model) &&
            /quasar/i.test(placeholder.value)
          ) {
            console.log(placeholder);
            console.log(
              `Replacing ${placeholder.value} == ${placeholder.override}`
            );
            FILE_DATA = FILE_DATA.replace(rx, placeholder.override);
          } else {
            // Otherwise treat it normally and use a SETTINGS key/value pair
            FILE_DATA = FILE_DATA.replace(rx, keymatch);
          }
        }
      });
      // Use a backdoor to replace template name in package-lock.json
      let isPackageLock = false;
      if (/packageLock/.test(key)) {
        console.log("This is the package-lock.json");
        let rx = /\"name\"\:\s\"(.*)\"/;
        let matches = FILE_DATA.match(rx);
        let str = `"name": "${SETTINGS.extName}"`;
        console.log(`replace to ${str}`);
        FILE_DATA = FILE_DATA.replace(rx, str);
      }
      // If placeholder match was found, this file is dirty
      if (dirty || isPackageLock) {
        // So unlink/delete original file
        fs.unlinkSync(PATHS[key]);
        // And rewrite new file contents to target path
        fs.writeFileSync(PATHS[key], FILE_DATA);
      }
    });
    let hostPath = this.generateHostPath(
      config,
      SETTINGS.model,
      SETTINGS.dirName
    );
    if (fs.existsSync(hostPath)) {
      const OMITTED_APPS = static.CEP_HOSTLIST.filter(entry => {
        return !SETTINGS.hostList.some(host => host === entry.name);
      });
      // Still need to omit apps
      if (OMITTED_APPS.length)
        OMITTED_APPS.forEach(hostapp => {
          try {
            fs.unlinkSync(`${hostPath}/${hostapp.name}`);
          } catch (err) {
            return null;
          }
        });
    }

    console.log("");
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(` ✔ CORRECTIONS COMPLETE `)}`
    });

    return SETTINGS;
  },
  //
  // OLD
  // async _correctPlaceholders(settings) {
  //   // settings has .isVue and .isQuasar Booleans. Can easily shim future alternatives here too
  //   const DIR_NAME = settings.extName.split(" ").join("-");
  //   const EXT_ID = DIR_NAME.toLowerCase();
  //   settings["dirName"] = DIR_NAME;
  //   settings["id"] = EXT_ID;

  //   let PATHS = {
  //     name: DIR_NAME,
  //     index: `./${DIR_NAME}/${
  //       settings.isVue
  //         ? "public/index.html"
  //         : settings.isQuasar
  //         ? "src/index.template.html"
  //         : ""
  //     }`,
  //     dev: `./${DIR_NAME}/${
  //       settings.isVue
  //         ? "public/index-dev.html"
  //         : settings.isQuasar
  //         ? "src/index-dev.html"
  //         : ""
  //     }`,
  //     manifest: `./${DIR_NAME}/CSXS/manifest.xml`,
  //     debug: `./${DIR_NAME}/.debug`,
  //     package: `./${DIR_NAME}/package.json`,
  //     packageLock: `./${DIR_NAME}/package-lock.json`,
  //     host: `./${DIR_NAME}/src/host/`
  //   };

  //   let PLACEHOLDERS = {
  //     name: `$BOMBINO_NAME$`,
  //     title: `$BOMBINO_TITLE$`,
  //     hostlist: `$BOMBINO_HOSTLIST$`,
  //     hostlist_debug: `$BOMBINO_DEBUG_HOSTLIST$`,
  //     desc: `$BOMBINO_DESC$`,
  //     qWidth: `$BOMBINO_QUASAR_WIDTH$`
  //   };
  //   // settings has .isVue and .isQuasar Booleans. Can easily shim future alternatives here too
  //   const MANIFEST_TEXT = await this._constructManifestText(settings);
  //   const DEBUG_TEXT = await this._constructDebugText(settings);

  //   return new Promise(resolve => {
  //     let spinner = ora({
  //       text: `Correcting...`,
  //       spinner: static.ORA_SPINNER
  //     }).start();

  //     // Ensure this happens on nextTick thread
  //     setTimeout(() => {
  //       // manifest.xml
  //       let MANIFEST_FILE = fs.readFileSync(PATHS.manifest, "utf8");
  //       MANIFEST_FILE = MANIFEST_FILE.replace(
  //         PLACEHOLDERS.hostlist,
  //         MANIFEST_TEXT
  //       );
  //       MANIFEST_FILE = MANIFEST_FILE.split(PLACEHOLDERS.name).join(
  //         DIR_NAME.toLowerCase().replace(" ", "-")
  //       );
  //       MANIFEST_FILE = MANIFEST_FILE.replace(
  //         PLACEHOLDERS.title,
  //         settings.extName
  //       );
  //       fs.unlinkSync(PATHS.manifest);
  //       fs.writeFileSync(PATHS.manifest, MANIFEST_FILE);

  //       // .debug
  //       let DEBUG_FILE = fs.readFileSync(PATHS.debug, "utf8");
  //       if (DEBUG_FILE) {
  //         DEBUG_FILE = DEBUG_FILE.split(PLACEHOLDERS.name).join(
  //           DIR_NAME.toLowerCase()
  //         );
  //         DEBUG_FILE = DEBUG_FILE.replace(
  //           PLACEHOLDERS.hostlist_debug,
  //           DEBUG_TEXT
  //         );
  //         fs.unlinkSync(PATHS.debug);
  //         fs.writeFileSync(PATHS.debug, DEBUG_FILE);
  //       }

  //       // index-dev.html (for CLI hot reloading via iframe / DEVELOPER)
  //       let INDEX_DEV_FILE = fs.readFileSync(PATHS.dev, "utf8");
  //       INDEX_DEV_FILE = INDEX_DEV_FILE.split(PLACEHOLDERS.name).join(
  //         settings.extName
  //       );
  //       fs.unlinkSync(PATHS.dev);
  //       fs.writeFileSync(PATHS.dev, INDEX_DEV_FILE);

  //       // index.html main entry point of extension (PRODUCTION)
  //       let INDEX_FILE = fs.readFileSync(PATHS.index, "utf8");
  //       if (settings.isQuasar) {
  //         INDEX_FILE = INDEX_FILE.split(PLACEHOLDERS.name).join(
  //           static.QuasarHTMLHeader
  //         );
  //         INDEX_FILE = INDEX_FILE.split(PLACEHOLDERS.desc).join(
  //           static.QuasarHTMLDescription
  //         );
  //         INDEX_FILE = INDEX_FILE.split(PLACEHOLDERS.qWidth).join(
  //           static.QuasarHTMLWidth
  //         );
  //       } else if (settings.isVue) {
  //         INDEX_FILE = INDEX_FILE.split(PLACEHOLDERS.name).join(
  //           settings.extName
  //         );
  //       }
  //       fs.unlinkSync(PATHS.index);
  //       fs.writeFileSync(PATHS.index, INDEX_FILE);

  //       // package.json (prevent name from being the same as the template title)
  //       let PACKAGE_FILE = fs.readFileSync(PATHS.package, "utf8");
  //       // PACKAGE_FILE = PACKAGE_FILE.split(`${settings.templateType.split('/')[1]}`).join(
  //       //   DIR_NAME
  //       // );
  //       PACKAGE_FILE = PACKAGE_FILE.split(PLACEHOLDERS.name).join(DIR_NAME);
  //       if (settings.isQuasar) {
  //         PACKAGE_FILE = PACKAGE_FILE.split(`Quasar App`).join(
  //           DIR_NAME.toLowerCase()
  //         );
  //       }
  //       fs.unlinkSync(PATHS.package);
  //       fs.writeFileSync(PATHS.package, PACKAGE_FILE);

  //       // package.lock (prevent name from being the same as template title)
  //       let PACKAGE_LOCK_FILE = fs.readFileSync(PATHS.packageLock, "utf8");
  //       PACKAGE_LOCK_FILE = PACKAGE_LOCK_FILE.split(/"name":\s"[^"]*"/).join(
  //         `"name": "${DIR_NAME}"`
  //       );
  //       fs.unlinkSync(PATHS.packageLock);
  //       fs.writeFileSync(PATHS.packageLock, PACKAGE_LOCK_FILE);

  //       const OMITTED_APPS = static.CEP_HOSTLIST.filter(entry => {
  //         return !settings.hostList.some(host => host === entry.name);
  //       });

  //       if (!/bare/.test(settings.templateType))
  //         OMITTED_APPS.forEach(hostapp => {
  //           try {
  //             fs.unlinkSync(`${PATHS.host}${hostapp.name}`);
  //           } catch (err) {
  //             return null;
  //           }
  //         });
  //       console.log("");
  //       spinner.stopAndPersist({
  //         symbol: "",
  //         text: `${chalk.black.bgBlue(` ✔ CORRECTIONS COMPLETE `)}`
  //       });
  //       resolve();
  //     }, 1000);
  //   });
  // },

  doneMessage(msg) {
    return this.log(`${chalk.black.bgBlue(`${msg}`)}`);
  }
};
