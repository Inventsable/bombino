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

const Rx = require("rxjs");

const leylo = require("../lib/leylo");

const bombino = {
  // Display title
  landing: async function() {
    bombLogo.print();
    console.log("");
    utils.log(`  ${chalk.black.bgBlue(" WELCOME TO BOMBINO ")}`);
    console.log("");
    // await this.test();
    return this.greet();
  },
  async rewriteConfig() {
    let config = await utils.getDefaultConfig();
    return await utils.setConfig(config);
  },
  test: async function() {
    // let res = ;
    let res = await this.rewriteConfig();
    console.log(res);
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
      },
      {
        name: "Inject CEP utils into this directory",
        value: "utils"
      }
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

  // newDynamicAdobePanelPrompt: async function() {
  //   // INQUIRER KEEPS HANGING ON TEMPLATE SELECTION
  //   // No idea why, may be related to multiple instantiation Issue #888.
  //   // Suggest solution is below but this is non-blocking and non-async. Can't get it to work,
  //   // it won't wait for the prompt solutions before returning a value back to index.js
  //   //

  //   let masterPrompts = new Rx.Subject();
  //   masterPrompts.subscribe({
  //     next: (v, i) => {
  //       console.log(`${i}:`, v);
  //       // Promise.resolve(v)
  //     }
  //   });
  //   inquirer.prompt(masterPrompts);
  //   masterPrompts.next({
  //     type: "input",
  //     name: "extName",
  //     message: "Name of panel?",
  //     default: `Hello World`,
  //     validate: static.requireValueLength
  //   });
  //   masterPrompts.next({
  //     type: "list",
  //     name: "type",
  //     message: "Use your custom templates or bombino defaults?",
  //     choices: [
  //       {
  //         name: "Local",
  //         value: true
  //       },
  //       {
  //         name: "Bombino",
  //         value: false
  //       }
  //     ],
  //     validate: static.requireOneValue
  //   });
  //   console.log("This should not be fired before questions");
  //   // console.log(newData);
  //   console.log(masterPrompts);
  //   let DEF = { extName: "test" };
  // },
  //

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
    let currentModels;
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

    let templates = !isLocal
      ? await leylo.getCollection("templates")
      : await utils.getLocalTemplates();

    templates = templates.length
      ? templates
      : await leylo.getCollection("templates");
    // console.log(templates);

    // Need to determine tooling preset for local and draw templates from there.
    let totalModels = templates.map(template => {
      return template.model;
    });
    let uniqueModels = [...new Set(totalModels)];
    let localconfig = await utils.getConfig();
    let modelChoices = [];

    // THIS SHOULD BE DONE IN LANDING.
    // It may not hang if all this calculation is done before reaching this section?
    uniqueModels.forEach(model => {
      let group = templates.filter(template => {
        return template.model == model;
      });
      if (group.length) {
        modelChoices.push(model);
      }
    });
    modelChoices = this.constructModelPromptChoices(modelChoices, localconfig);

    let count;
    count = templates.length;
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(
        ` ✔ ${count} TEMPLATE${count > 1 ? "S" : ""} AVAILABLE `
      )}`
    });

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

    currentModels = templates.filter(template => {
      return template.model == TEMPLATE_SYSTEM.model;
    });

    let currentTemplateChoices =
      currentModels.length > 1
        ? this.constructTemplatePromptChoices(currentModels).sort((a, b) => {
            return a.index - b.index;
          })
        : this.constructTemplatePromptChoices(currentModels);

    let currentModelLabel = localconfig._MODELS.find(model => {
      return model.name == TEMPLATE_SYSTEM.model;
    }).label;

    // templateType prop is name of github repo / template
    //
    // ERROR: This reliably freezes. User must hit enter to activate it, no idea why
    let templateTypeOverride = false;
    if (currentModels.length > 1) {
      let msg = `Which ${currentModelLabel} template should be used?`;
      // ERROR: input hangs in air for some reason.
      prompts.push({
        type: "list",
        name: "templateType",
        message: "Which template should be used?",
        choices: currentTemplateChoices
      });
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
    let prompts = [];
    prompts.push({
      type: "input",
      name: "extName",
      message: "Name of new template?",
      default: `My New Panel`,
      validate: static.requireValueLength
    });

    if (ROOT.source == "git") {
      prompts.push({
        type: "input",
        name: "location",
        message: "Enter URL or USER/REPO path",
        default: `Inventsable/bombino-new-panel`,
        validate: static.requireValueLength
      });
    } else if (ROOT.source == "local") {
      let contents = await utils.readDir("./");
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
        name: "path",
        message:
          "Select the directory (should be root) of the panel to convert:",
        choices: choices
      });
    }

    let TEMPLATE_DATA = await inquirer.prompt(prompts);
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
    return Object.assign(TEMPLATE_DATA, SETTINGS);
  },

  createNewTemplate: async function(SETTINGS) {
    let NEW_TEMPLATE;
    if (SETTINGS.isLocal) {
      NEW_TEMPLATE = await this.cloneCurrentRepo(SETTINGS);
    } else {
      NEW_TEMPLATE = await this.cloneGitRepo(SETTINGS);
    }
    return await this.createPlaceholdersForTemplate(SETTINGS);
  },

  cloneCurrentRepo: async function(SETTINGS) {
    //
  },
  cloneGitRepo: async function(SETTINGS) {
    let REPO = await utils._downloadGitRepo(SETTINGS);
    return SETTINGS;
  },
  createPlaceholdersForTemplate(SETTINGS) {
    // Should determine if .vue or .quasar
    console.log("CORRECT HERE");
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

        // @@@!!! OVERWRITING NPM INSTALL
        //
        shell.exec("npm install", () => {
          this.end(SETTINGS, spinner);
          return DIR_NAME;
        });
      } else {
        this.end(SETTINGS, null);
      }
    });
  },
  end: async function(SETTINGS, spinner) {
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
    utils.log(
      `You can use ${chalk.yellow(
        "npm run help"
      )} at any time inside the panel to see a full list of commands.`
    );
    utils.log();

    // Ensure the terminal isn't still running and won't prompt to Terminate Batch via process.exit()
    process.exit(22);
    this.kill();
    return true;
  },
  kill() {
    process.exit(22);
  }
};

module.exports = bombino;
