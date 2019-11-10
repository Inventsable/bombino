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
  async readDirForDirs(thispath) {
    let parent = await this.readDir(thispath);
    return parent.filter(child => {
      return fs
        .lstatSync(`${thispath.replace(/\/&/, "")}/${child}`)
        .isDirectory();
    });
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
      download(`${settings.location}`, this.getDirName(settings), err =>
        err ? reject(err) : resolve(settings)
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
  sanitizeFinalizedConfig(config, type, name) {
    Object.keys(config[type].paths).map((key, i) => {
      config[type].paths[key] = config[type].paths[key].replace(
        new RegExp(`\.\/${name}`),
        `./`
      );
    });
    return config;
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
    return data._TEMPLATES.length ? data._TEMPLATES : false;
  },
  async addLocalTemplate(template) {
    let db = await this.getConfig();
    let currentModel = template.model;
    if (db._TEMPLATES.length) {
      let siblings = db._TEMPLATES.filter(t => {
        return t.model == currentModel;
      });
      template["index"] == siblings.length;
    } else {
      template["index"] = 0;
    }
    // @@ Why isn't index being assigned? Logging it to console show's it working.
    db._TEMPLATES.push(template);
    return await this.setConfig(db);
  },
  async addLocalModel(model) {
    let db = this.getConfig();
    db[model.name] = model.data;
    db._MODELS.push({
      name: model.name,
      label: model.label,
      placeholders: ["name", "title", "hostlist", "hostlist_debug"]
    });
    return await this.setConfig(db);
  },
  //
  async duplicateDir(from, to, settings) {
    const filterer = (src, dest) => {
      const ignoreRX = /node_modules|\.git/;
      return !ignoreRX.test(src);
    };
    await fse.copy(path.resolve(from), path.resolve(to), {
      filter: filterer
    });
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
    string = String(string);
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
  async _injectPlaceholders(SETTINGS) {
    let config = await this.getConfig();
    SETTINGS["dirName"] = this.getDirName(SETTINGS);
    SETTINGS["id"] = SETTINGS.dirName.toLowerCase();

    let PATHS = this.generateFinalizedConfig(
      config,
      SETTINGS.model,
      SETTINGS.dirName
    );

    // Loop through placeholder count rather than files this time
    let placeholders = config._PLACEHOLDERS;
    Object.keys(placeholders).forEach((pKey, p) => {
      let placeholder = placeholders[pKey];

      // For each specified panel RegExp within a given Placeholder
      Object.keys(placeholder.panelRX).forEach(key => {
        // Grab filedata from desired path
        let FILE_DATA = fs.readFileSync(PATHS[key], "utf8");
        let dirty = false;
        //
        // loop through all placeholder objects and test if it matches
        let rx = this.sanitizeRX(placeholder.panelRX[key]);
        if (rx.test(FILE_DATA)) {
          dirty = true;
          if (key == "manifest" && /name/i.test(placeholder.value)) {
            // If manifest, take care to inject $BOMBINO_NAME$ dynamically according to BundleName
            let bundleRX = /ExtensionBundleName\=\"([^\"]*)\"/;
            let matches = FILE_DATA.match(bundleRX);
            let targs = matches[1];
            let rx = new RegExp(targs, "gm");
            let targmatches = FILE_DATA.match(rx);
            FILE_DATA = FILE_DATA.replace(rx, placeholder.value);
          } else {
            let matches = FILE_DATA.match(rx);
            if (matches.length > 1) {
              let newval = matches[0].replace(matches[1], placeholder.value);
              FILE_DATA = FILE_DATA.replace(rx, newval);
            } else {
              console.log(`Something went wrong with ${pKey}`);
              console.log(` ======> ${matches}`);
            }
          }
        }
        if (dirty) {
          // So unlink/delete original file
          fs.unlinkSync(PATHS[key]);
          // And rewrite new file contents to target path
          fs.writeFileSync(PATHS[key], FILE_DATA);
        }
      });
    });

    return SETTINGS;
  },
  async setConfigDirty(SETTINGS) {
    let config = await this.getConfig();
    config = this.sanitizeFinalizedConfig(
      config,
      SETTINGS.model,
      SETTINGS.extName
        .split(" ")
        .join("-")
        .toLowerCase()
    );
    config._OPTIONS.dirty = true;
    config._OPTIONS.lastTemplate = SETTINGS.templateType;
    return await this.setConfig(config);
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
            FILE_DATA = FILE_DATA.replace(rx, placeholder.override);
          } else {
            // Otherwise treat it normally and use a SETTINGS key/value pair
            if (/name/i.test(pKey))
              // But don't alter/split placeholder injection values unless it's a name/id
              FILE_DATA = FILE_DATA.replace(
                rx,
                /package|manifest/.test(key)
                  ? keymatch
                      .split(" ")
                      .join("-")
                      .toLowerCase()
                  : keymatch
              );
            else FILE_DATA = FILE_DATA.replace(rx, keymatch);
          }
        }
      });
      // Use a backdoor to replace template name in package-lock.json
      if (/package/.test(key)) {
        dirty = true;
        // console.log("This is the package-lock.json");
        let rx = /\"name\"\:\s\"(.*)\"/;
        let matches = FILE_DATA.match(rx);
        let str = `"name": "${SETTINGS.extName
          .split(" ")
          .join("-")
          .toLowerCase()}"`;
        FILE_DATA = FILE_DATA.replace(rx, str);
      }
      // If placeholder match was found, this file is dirty
      if (dirty) {
        // So unlink/delete original file
        fs.unlinkSync(PATHS[key]);
        // And rewrite new file contents to target path
        fs.writeFileSync(PATHS[key], FILE_DATA);
      }
    });
    // Still need to omit any unnecessary apps
    // This could be used to inject correct paths in App.vue
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

  doneMessage(msg) {
    return this.log(`${chalk.black.bgBlue(`${msg}`)}`);
  }
};
