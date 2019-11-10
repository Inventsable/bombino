const static = require("./staticValues");
const utils = require("./utils");
const bombLogo = require("./logo");
const chalk = require("chalk");
const inquirer = require("inquirer");
const shell = require("shelljs");
const ora = require("ora");
const boxen = require("boxen");
const path = require("path");
const _CONFIG = require("./config");
const fs = require("fs");
const fse = require("fs-extra");

const Rx = require("rxjs");

const leylo = require("../lib/leylo");

const bombino = {
  // Display title
  boxLog(str) {
    console.log("");
    console.log(`  ${chalk.black.bgBlue(` ${str.toUpperCase()} `)}`);
    console.log("");
  },
  landing: async function() {
    bombLogo.print();
    this.boxLog("Welcome to bombino");
    // await this.test();
    return this.greet();
  },
  async resetConfig() {
    let config = await utils.getDefaultConfig();
    return await utils.setConfig(config);
  },
  test: async function() {
    // let res = ;
    let res = await utils.rewriteConfig();
    this.kill();
  },
  greet: async function() {
    let localconfig = await utils.getConfig();
    let hasConfig = localconfig._OPTIONS.dirty;
    let actions = [
      {
        name: "Create a new Adobe panel",
        value: "panel"
      },
      {
        name: "Create a new panel template",
        value: "template"
      }
      // {
      //   name: "Inject CEP utils into this directory",
      //   value: "utils"
      // }
    ];
    if (hasConfig)
      actions.push({
        name: "Change bombino settings",
        value: "config"
      });
    let answers = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: actions
      }
    ]);

    return answers.action;
  },

  async changeConfig() {
    let ACTION = await inquirer.prompt({
      type: "list",
      name: "select",
      message: "Select an action:",
      choices: [
        {
          name: "Reset config file",
          value: "reset"
        },
        {
          name: "Add new tooling module",
          value: "tooling"
        }
      ]
    });
    if (ACTION.select == "reset") {
      let result = await this.resetConfig();
      this.boxLog("config reset");
      this.kill();
    } else {
      console.log("Not yet supported");
      this.kill();
    }
  },
  promptCreateTemplateOrPanel: async function(data) {
    // let templates = data.templates;
    if (data == "panel") {
      return await this.newAdobePanelPrompt();
      // return await this.newDynamicAdobePanelPrompt();
    } else if (data == "template") {
      return await this.newAdobeTemplatePrompt();
    } else {
      console.log("Unrecognized action");
    }
  },
  constructModelPromptChoices(models, config) {
    return models.map(model => {
      return {
        name: config._MODELS.find(item => {
          return item.name == model;
        }).label,
        value: model
      };
    });
  },
  constructTemplatePromptChoices(objs) {
    return objs.map(obj => {
      return {
        name: obj.name,
        value: obj.gitURL || obj.path
      };
    });
  },

  async newAdobePromptStart() {
    let config = await utils.getConfig();
    let hasLocal = await utils.getLocalTemplates();
    let isLocal = false;
    let SETTINGS = {};
    let startPrompts = [
      {
        type: "input",
        name: "extName",
        message: "Name of panel?",
        default: `Hello World`,
        validate: static.requireValueLength
      }
    ];
  },

  async getTemplatesForPrompt(isLocal = true) {
    let config = await utils.getConfig();

    let templates = !isLocal
      ? await leylo.getCollection("templates")
      : await utils.getLocalTemplates();

    return templates.length
      ? templates
      : await leylo.getCollection("templates");
  },
  async getModelChoicesForPrompt(templates) {
    let localconfig = await utils.getConfig();
    let totalModels = templates.map(template => {
      return template.model;
    });
    let uniqueModels = [...new Set(totalModels)];
    let modelChoices = [];
    uniqueModels.forEach(model => {
      let group = templates.filter(template => {
        return template.model == model;
      });
      if (group.length) {
        modelChoices.push(model);
      }
    });
    return this.constructModelPromptChoices(modelChoices, localconfig);
  },

  async getCurrentTemplatesPromptForModel(templates, model) {
    let localconfig = await utils.getConfig();
    let currentModels = templates.filter(template => {
      return template.model == model;
    });

    let currentTemplateChoices =
      currentModels.length > 1
        ? this.constructTemplatePromptChoices(currentModels).sort((a, b) => {
            return a.index - b.index;
          })
        : this.constructTemplatePromptChoices(currentModels);

    let currentModelLabel = localconfig._MODELS.find(m => {
      return m.name == model;
    }).label;

    return {
      type: "list",
      name: "templateType",
      message: `Which ${currentModelLabel} template should be used?`,
      choices: currentTemplateChoices
    };
  },

  // Gather user information then pass result to this.createPanelFromTemplate()
  newAdobePanelPrompt: async function() {
    // Currently assumes a CEP panel via config, should include UXP architecture
    let config = await utils.getConfig();
    let hasLocal = await utils.getLocalTemplates();
    let isLocal = false;
    let SETTINGS = {};
    let lastTemplate = config._OPTIONS.lastTemplate;

    let startPrompts = [
      {
        type: "input",
        name: "extName",
        message: "Name of panel?",
        default: `Hello World`,
        validate: static.requireValueLength
      }
    ];
    // if (lastTemplate) {
    //   let targetTemplate = config._TEMPLATES.find(template => {
    //     return template.name == lastTemplate;
    //   });
    //   currentModels = [config[targetTemplate.model]];
    //   startPrompts.push();
    // }

    let DEF = await inquirer.prompt(startPrompts);
    SETTINGS["extName"] = DEF.extName;
    let useLast = lastTemplate ? DEF.useLast : false;

    // if (useLast) {
    // } else {
    let SOURCEFROM = hasLocal
      ? await inquirer.prompt({
          type: "list",
          name: "type",
          message: "Use your custom templates or bombino defaults?",
          choices: [
            {
              name: "Local",
              value: true
            },
            {
              name: "Bombino",
              value: false
            }
          ],
          validate: static.requireOneValue
        })
      : { type: false };
    isLocal = SOURCEFROM.type;

    // Retrieve template list dynamically from Firestore
    console.log("");
    let spinner = ora({
      text: `Loading templates...`,
      spinner: static.ORA_SPINNER
    }).start();

    let templates = await this.getTemplatesForPrompt(isLocal);
    let modelChoices = await this.getModelChoicesForPrompt(templates);

    let count;
    count = templates.length;
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(
        ` ✔ ${count} TEMPLATE${count > 1 ? "S" : ""} AVAILABLE `
      )}`
    });
    console.log("");

    let prompts = [];
    let TEMPLATE_SYSTEM;
    TEMPLATE_SYSTEM = await inquirer.prompt([
      {
        type: "list",
        name: "model",
        message: "What tooling preset should be used?",
        choices: modelChoices
      }
    ]);

    let currentModels = templates.filter(template => {
      return template.model == TEMPLATE_SYSTEM.model;
    });

    let thisModel = config._MODELS.find(m => {
      return m.name == TEMPLATE_SYSTEM.model;
    });

    SETTINGS["isCustom"] = thisModel.isCustom;

    // ERROR: This reliably freezes. User must hit enter to activate it, no idea why
    let templateTypeOverride = false;
    if (currentModels.length > 1) {
      let templatePrompt = await this.getCurrentTemplatesPromptForModel(
        templates,
        TEMPLATE_SYSTEM.model
      );
      // NEED TO BACKDOOR AN ENTER PRESS HERE
      prompts.push(templatePrompt);
    } else {
      let msg = `Want to use the ${currentModels[0].label} template?`;
      let confirmation = await inquirer.prompt({
        type: "confirm",
        name: "confirmation",
        message: msg,
        default: true
        // validate: static.requireOneValue
      });
      if (!confirmation.confirmation) {
        console.log("");
        console.log(`Sorry! No other templates found. Please restart bombino.`);
        process.exit(22);
        return false;
      }
      templateTypeOverride = true;
    }
    // }

    prompts.push({
      type: "checkbox",
      name: "hostList",
      message: "Host apps to include:",
      choices: [
        {
          name: "Illustrator",
          value: "ILST"
        },
        {
          name: "After Effects",
          value: "AEFT"
        },
        {
          name: "Photoshop",
          value: "PHXS"
        },
        {
          name: "Premiere Pro",
          value: "PPRO"
        },
        {
          name: "InDesign",
          value: "IDSN"
        },
        {
          name: "Audition",
          value: "AUDT"
        }
      ],
      validate: static.requireOneValue
    });
    prompts.push({
      type: "number",
      name: "portNum",
      message: "Base CEF Port (between 1024 and 65534)",
      default: 8888,
      validate: static.requireValidPort
    });
    prompts.push({
      type: "confirm",
      name: "install",
      message: "Run npm install for you?",
      default: false
    });

    let answers = await inquirer.prompt(prompts);
    await utils.setOptions("lastTemplate", answers.templateType);
    answers["hasModal"] = /plus|vuetify/.test(SETTINGS.templateType);
    answers["isTemplate"] = false;
    answers["isLocal"] = isLocal;
    answers["model"] = TEMPLATE_SYSTEM.model;
    answers["templateType"] = templateTypeOverride
      ? currentModels[0].gitURL || currentModels[0].path
      : answers.templateType ||
        currentModels[0].gitURL ||
        currentModels[0].path;
    // answers["path"] = SETTINGS.templateType;
    SETTINGS["isTemplate"] = false;

    // console.log(answers);
    return Object.assign(answers, SETTINGS);
  },

  newAdobeTemplatePrompt: async function() {
    let SETTINGS = {};

    let ROOT = await inquirer.prompt([
      {
        type: "list",
        name: "source",
        message: "Select the source of your new template:",
        choices: [
          {
            name: "A local directory",
            value: "local"
          },
          {
            name: "Github",
            value: "git"
          }
        ]
      }
    ]);
    SETTINGS["isLocal"] = ROOT.source == "local";
    let prompts = [];
    prompts.push({
      type: "input",
      name: "templateType",
      message: "Name of new template?",
      default: `my-custom-template`,
      validate: static.requireValueLength
    });
    // prompts.push({
    //   type: "input",
    //   name: "label",
    //   message: "Add a brief description to display ",
    //   default: `My New Panel`,
    //   validate: static.requireValueLength
    // });

    if (ROOT.source == "git") {
      prompts.push({
        type: "input",
        name: "location",
        message: "Enter URL or USER/REPO path",
        default: `Inventsable/bombino-new-panel`,
        validate: static.requireValueLength
      });
    } else if (ROOT.source == "local") {
      let contents = await utils.readDirForDirs("./");
      let choices;
      if (contents.length) {
        choices = contents.map(file => {
          return {
            name: file,
            path: `./${file}`
          };
        });
      }
      prompts.push({
        type: "list",
        name: "location",
        message:
          "Select the directory (should be root) of the panel to convert:",
        choices: choices
      });
    }

    let TEMPLATE_DATA = await inquirer.prompt(prompts);
    SETTINGS["extName"] = TEMPLATE_DATA.templateType;
    if (ROOT.source == "git") {
      TEMPLATE_DATA.location = TEMPLATE_DATA.location.replace(
        /(https:\/\/)?(www\.)?github\.com\//,
        ""
      );
      SETTINGS["isLocal"] = false;
    } else {
      SETTINGS["isLocal"] = true;
    }
    SETTINGS["isTemplate"] = true;
    SETTINGS["templateType"] = TEMPLATE_DATA.templateType;
    SETTINGS["location"] = TEMPLATE_DATA.location;
    // Check the specified directory here
    let model;
    let modelPrompt = null;
    if (SETTINGS.isLocal) {
      model = await this.scanDirForModel(SETTINGS);
      let msg = `This looks like a ${model.label} template. Is that correct?`;
      let reconfirm = await inquirer.prompt({
        type: "confirm",
        name: "model",
        message: msg,
        default: true
      });
      if (reconfirm.model) {
        SETTINGS["model"] = model.name;
      } else {
        // THIS IS WRONG
        // Doesn't account for user-generated templates, fix later

        modelPrompt = await inquirer.prompt({
          type: "list",
          name: "model",
          message: `Which tooling should be used?`,
          choices: [
            {
              name: "Vue-CLI",
              value: "VUE"
            },
            {
              name: "Quasar-CLI",
              value: "QUASAR"
            }
          ]
        });
        SETTINGS["model"] = modelPrompt.model;
      }
    } else {
      // THIS IS WRONG
      // Doesn't account for user-generated templates, fix later

      modelPrompt = await inquirer.prompt({
        type: "list",
        name: "model",
        message: `Which tooling should be used?`,
        choices: [
          {
            name: "Vue-CLI",
            value: "VUE"
          },
          {
            name: "Quasar-CLI",
            value: "QUASAR"
          }
        ]
      });
      SETTINGS["model"] = modelPrompt.model;
    }

    return Object.assign(TEMPLATE_DATA, SETTINGS);
  },
  async scanDirForModel(SETTINGS) {
    let config = await utils.getConfig();
    // let contents = fs.readdirSync(`./${SETTINGS.location}`);
    let targ;
    // return contents.includes(".bombino")
    config._MODELS.forEach(model => {
      let targetFile = model.exclusive.replace(
        /^\.\//,
        `./${SETTINGS.location}/`
      );
      // console.log(targetFile);
      if (fs.existsSync(targetFile)) targ = model;
    });
    return targ ? targ : null;
  },
  createNewTemplate: async function(SETTINGS) {
    console.log("");
    let spinner = ora({
      text: `Duplicating template from ${SETTINGS.location}...`,
      spinner: static.ORA_SPINNER
    }).start();
    if (SETTINGS.isLocal) {
      NEW_TEMPLATE = await this.cloneLocalRepo(SETTINGS, spinner);
    } else {
      NEW_TEMPLATE = await this.cloneGitRepo(SETTINGS, spinner);
    }
    return await this.createPlaceholdersForTemplate(SETTINGS);
  },

  cloneLocalRepo: async function(SETTINGS, spinner) {
    // console.log(SETTINGS);
    utils
      .duplicateDir(
        `./${SETTINGS.location}`,
        utils.getDirName(SETTINGS),
        SETTINGS
      )
      .then(SETTINGS => {
        this.finalizeTemplatePlaceholderInjection(SETTINGS, spinner);
      });

    //
  },
  cloneGitRepo: async function(SETTINGS, spinner) {
    utils._downloadGitRepo(SETTINGS).then(SETTINGS => {
      this.finalizeTemplatePlaceholderInjection(SETTINGS, spinner);
    });
  },
  finalizeTemplatePlaceholderInjection(SETTINGS, spinner) {
    SETTINGS["root"] = `./${utils.getDirName(SETTINGS)}`;
    console.log("");
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(` ✔ DUPLICATION COMPLETE `)}`
    });

    console.log("");
    spinner = ora({
      text: `Injecting placeholders...`,
      spinner: static.ORA_SPINNER
    }).start();
    console.log("");
    utils._injectPlaceholders(SETTINGS).then(() => {
      this.endCreateTemplate(SETTINGS, spinner);
    });
  },
  createPlaceholdersForTemplate(SETTINGS) {
    // Don't use this, instead use finalizeTemplatePlaceholderInjection()
    // Should determine if .vue or .quasar
    // console.log("");
    // console.log("CORRECT HERE");
    // console.log(SETTINGS);
  },
  createPanelFromLocalTemplate: async function(SETTINGS) {
    const DIR_NAME = SETTINGS.extName.split(" ").join("-");
    const LOCATION = SETTINGS.templateType;
    let spinner = ora({
      text: `Duplicating template from ${LOCATION}...`,
      spinner: static.ORA_SPINNER
    }).start();

    utils
      .duplicateDir(LOCATION, `./${DIR_NAME}`, SETTINGS)
      .then(SETTINGS => {
        this.finalizeTemplateWrite(SETTINGS, spinner);
      })
      .catch(err => console.error(err));
  },
  //
  // Download correct template from Github, then crawl through and correct any placeholder text
  createPanelFromGitTemplate: async function(SETTINGS) {
    const DIR_NAME = SETTINGS.extName.split(" ").join("-");
    const GITHUB_LINK = `${SETTINGS.templateType}`;
    let spinner = ora({
      text: `Downloading template from ${GITHUB_LINK}...`,
      spinner: static.ORA_SPINNER
    }).start();

    utils
      ._downloadTemplate(SETTINGS)
      .then(SETTINGS => {
        this.finalizeTemplateWrite(SETTINGS, spinner);
      })
      .catch(err => console.error(err));
  },
  finalizeTemplateWrite(SETTINGS, spinner) {
    const DIR_NAME = SETTINGS.extName.split(" ").join("-");

    console.log("");
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(
        ` ✔ ${SETTINGS.isLocal ? "DUPLICATION" : "DOWNLOAD"} COMPLETE `
      )}`
    });
    console.log("");

    utils._correctPlaceholders(SETTINGS).then(() => {
      if (SETTINGS.install) {
        spinner = ora({
          text: `Running ${chalk.yellow("npm install")} for you...`,
          spinner: static.ORA_SPINNER
        }).start();
        shell.cd(DIR_NAME);
        shell.exec("npm install", () => {
          this.endCreatePanel(SETTINGS, spinner);
          return DIR_NAME;
        });
      } else {
        this.endCreatePanel(SETTINGS, null);
      }
    });
  },
  async endCreateTemplate(SETTINGS, spinner) {
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(` ✔ INJECTION COMPLETE `)}`
    });
    console.log("");
    let optionalAdd = await inquirer.prompt({
      type: "confirm",
      name: "save",
      message: `Add ${SETTINGS.extName} to local config as a template?`,
      default: true
    });

    if (optionalAdd.save) {
      // let desc = await inquirer.prompt({
      //   type: "input",
      //   name: "label",
      //   message: `Add a brief description (optional, displays in brackets)`,
      //   default: "My new template"
      // });
      let shortname = SETTINGS.templateType
        .split(" ")
        .join("-")
        .toLowerCase();
      let rewrite = await utils.addLocalTemplate({
        name: shortname,
        label: "",
        path: SETTINGS.isLocal ? path.resolve(`./${shortname}`) : "",
        model: SETTINGS.model,
        gitURL: SETTINGS.isLocal ? "" : SETTINGS.location
      });
    }

    this.readyMessage(SETTINGS);
    let result = await utils.setConfigDirty(SETTINGS);
    // Ensure the terminal isn't still running and won't prompt to Terminate Batch via process.exit()
    process.exit(22);
    this.kill();
  },
  async endCreatePanel(SETTINGS, spinner) {
    const DIR_NAME = SETTINGS.extName.split(" ").join("-");
    if (SETTINGS.install) {
      console.log("");
      if (spinner) {
        spinner.stopAndPersist({
          symbol: "",
          text: `${chalk.black.bgBlue(` ✔ INSTALL COMPLETE `)}`
        });
      }
    }
    this.readyMessage(SETTINGS);
    // utils.log();
    utils.log(`Ready to get started? Run the following commands:`);
    utils.log();
    utils.log(`   ${chalk.yellow(`cd ${DIR_NAME}`)}`);
    if (!SETTINGS.install) utils.log(`   ${chalk.yellow(`npm install`)}`);
    utils.log(`   ${chalk.yellow("npm run serve")}`);
    utils.log();
    utils.log(
      `Then launch your desired host app and find in Window > Extensions`
    );
    utils.log();
    if (!SETTINGS.isCustom)
      utils.log(
        `You can use ${chalk.yellow(
          "npm run help"
        )} at any time inside the panel to see a full list of commands.`
      );
    utils.log();

    let result = await utils.setConfigDirty(SETTINGS);
    // Ensure the terminal isn't still running and won't prompt to Terminate Batch via process.exit()
    process.exit(22);
    this.kill();
    return true;
  },
  readyMessage(SETTINGS) {
    const info = `${chalk.blue(
      `${SETTINGS.extName
        .split(" ")
        .join("-")
        .toUpperCase()}`
    )} is ready!`;
    console.log(
      boxen(
        `${chalk.blue(
          SETTINGS.extName
            .split(" ")
            .join("-")
            .toUpperCase()
        )} ${chalk.blue("IS READY")}`,
        {
          ...static.BOXEN_OPTS
        }
      )
    );
  },
  kill() {
    process.exit(22);
  }
};

module.exports = bombino;
