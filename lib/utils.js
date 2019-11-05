const static = require("./staticValues");
const chalk = require("chalk");
const fs = require("fs");
const download = require("download-git-repo");
const ora = require("ora");

module.exports = {
  log: function(msg) {
    if (arguments.length) console.log(`${msg}`);
    else console.log("");
  },
  _downloadTemplate: function(settings) {
    return new Promise((resolve, reject) => {
      download(
        `Inventsable/${settings.templateType}`,
        settings.extName.split(" ").join("-"),
        err => (err ? reject(err) : resolve(settings))
      );
    });
  },

  _constructDebugText(settings) {
    // THIS SHOULD ACCOUNT FOR PLUS' MULTIPLE EXTENSIONS.
    // Needs to construct entire <Host> param in doing so, reconfigure all template debug files or add backdoor
    return new Promise(resolve => {
      let mirror = [];
      settings.hostList.forEach((item, i) => {
        const host = static.CEP_HOSTLIST.find(part => {
          return part.name === item;
        });
        let str = `\r\n            <Host Name="${
          host.name
        }" Port="${settings.portNum + i}" />`;
        mirror.push(str);
      });
      resolve(mirror.join(""));
    });
  },

  // This is fine because templates already have PLACEHOLDER text accounting for multiple extensions
  _constructManifestText: function(settings) {
    return new Promise(resolve => {
      let mirror = [];
      settings.hostList.forEach(item => {
        const host = static.CEP_HOSTLIST.find(part => {
          return part.name === item;
        });
        let str = `\r\n      <Host Name="${host.name}" Version="${host.version}" />`;
        mirror.push(str);
      });
      resolve(mirror.join(""));
    });
  },

  // This is fine to do but needs manual pathfinding depending on build system. Notable differences:

  // index.html
  // // VUE: in ./public/
  // // QUASAR: exists as 'index.template.html' in ./src/, with shell variables

  // index-dev.html
  // // VUE: in ./public/
  // // QUASAR: in ./src/

  // package.json
  // // QUASAR: has key/value pairs to determine <body> title, like ProductName

  _correctPlaceholders: async function(settings) {
    // settings has .isVue and .isQuasar Booleans. Can easily shim future alternatives here too

    const DIR_NAME = settings.extName.split(" ").join("-");
    const MANIFEST_TEXT = await this._constructManifestText(settings);
    const DEBUG_TEXT = await this._constructDebugText(settings);
    return new Promise(resolve => {
      let spinner = ora({
        text: `Correcting...`,
        spinner: static.ORA_SPINNER
      }).start();

      setTimeout(() => {
        let MANIFEST_FILE = fs.readFileSync(
          `./${DIR_NAME}/CSXS/manifest.xml`,
          "utf8"
        );
        MANIFEST_FILE = MANIFEST_FILE.replace("hostlisthere", MANIFEST_TEXT);
        MANIFEST_FILE = MANIFEST_FILE.split("namehere").join(
          DIR_NAME.toLowerCase()
        );
        MANIFEST_FILE = MANIFEST_FILE.replace("titlehere", settings.extName);
        fs.unlinkSync(`./${DIR_NAME}/CSXS/manifest.xml`);
        fs.writeFileSync(`./${DIR_NAME}/CSXS/manifest.xml`, MANIFEST_FILE);

        let DEBUG_FILE = fs.readFileSync(`./${DIR_NAME}/.debug`, "utf8");
        DEBUG_FILE = DEBUG_FILE.split("namehere").join(DIR_NAME.toLowerCase());
        DEBUG_FILE = DEBUG_FILE.replace("porthere", DEBUG_TEXT);
        fs.unlinkSync(`./${DIR_NAME}/.debug`);
        fs.writeFileSync(`./${DIR_NAME}/.debug`, DEBUG_FILE);

        let INDEX_DEV_PATH;
        if (settings.isVue) INDEX_DEV_PATH = "public";
        else if (settings.isQuasar) INDEX_DEV_PATH = "src";
        let INDEX_DEV_FILE = fs.readFileSync(
          `./${DIR_NAME}/${INDEX_DEV_PATH}/index-dev.html`,
          "utf8"
        );
        INDEX_DEV_FILE = INDEX_DEV_FILE.split("namehere").join(
          settings.extName
        );
        fs.unlinkSync(`./${DIR_NAME}/${INDEX_DEV_PATH}/index-dev.html`);
        fs.writeFileSync(
          `./${DIR_NAME}/${INDEX_DEV_PATH}/index-dev.html`,
          INDEX_DEV_FILE
        );

        let INDEX_PATH;
        if (settings.isVue) INDEX_PATH = "public";
        else if (settings.isQuasar) INDEX_PATH = "src";
        let INDEX_FILE;
        if (settings.isQuasar) {
          INDEX_FILE = fs.readFileSync(
            `./${DIR_NAME}/${INDEX_PATH}/index.template.html`,
            "utf8"
          );
          INDEX_FILE = INDEX_FILE.split("titlehere").join(
            static.QuasarHTMLHeader
          );
          INDEX_FILE = INDEX_FILE.split("deschere").join(
            static.QuasarHTMLDescription
          );
          INDEX_FILE = INDEX_FILE.split("quasarwidthhere").join(
            static.QuasarHTMLWidth
          );
          fs.unlinkSync(`./${DIR_NAME}/src/index.template.html`);
          fs.writeFileSync(`./${DIR_NAME}/src/index.template.html`, INDEX_FILE);
        } else if (settings.isVue) {
          INDEX_FILE = fs.readFileSync(
            `./${DIR_NAME}/${INDEX_PATH}/index.html`,
            "utf8"
          );
          INDEX_FILE = INDEX_FILE.split("namehere").join(settings.extName);
          fs.unlinkSync(`./${DIR_NAME}/public/index.html`);
          fs.writeFileSync(`./${DIR_NAME}/public/index.html`, INDEX_FILE);
        }

        let PACKAGE_FILE = fs.readFileSync(
          `./${DIR_NAME}/package.json`,
          "utf8"
        );
        PACKAGE_FILE = PACKAGE_FILE.split(`${settings.templateType}`).join(
          DIR_NAME
        );
        if (settings.isQuasar) {
          PACKAGE_FILE = PACKAGE_FILE.split(`Quasar App`).join(
            DIR_NAME.toLowerCase()
          );
        }

        fs.unlinkSync(`./${DIR_NAME}/package.json`);
        fs.writeFileSync(`./${DIR_NAME}/package.json`, PACKAGE_FILE);

        let PACKAGE_LOCK_FILE = fs.readFileSync(
          `./${DIR_NAME}/package-lock.json`,
          "utf8"
        );
        PACKAGE_LOCK_FILE = PACKAGE_LOCK_FILE.split(/"name":\s"[^"]*"/).join(
          `"name": "${DIR_NAME}"`
        );
        fs.unlinkSync(`./${DIR_NAME}/package-lock.json`);
        fs.writeFileSync(`./${DIR_NAME}/package-lock.json`, PACKAGE_LOCK_FILE);

        const OMITTED_APPS = static.CEP_HOSTLIST.filter(entry => {
          return !settings.hostList.some(host => host === entry.name);
        });

        if (!/bare/.test(settings.templateType))
          OMITTED_APPS.forEach(hostapp => {
            try {
              fs.unlinkSync(`./${DIR_NAME}/src/host/${hostapp.name}`);
            } catch (err) {
              return null;
            }
          });
        console.log("");
        spinner.stopAndPersist({
          symbol: "",
          text: `${chalk.black.bgBlue(` ✔ CORRECTIONS COMPLETE `)}`
        });
        console.log("");
        resolve();
      }, 1000);
    });
  },
  doneMessage(msg) {
    return this.log(`${chalk.black.bgBlue(`${msg}`)}`);
  }
};
