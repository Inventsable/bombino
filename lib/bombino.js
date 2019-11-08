const static = require("./staticValues");
const utils = require("./utils");
const bombLogo = require("./logo");
const chalk = require("chalk");
const inquirer = require("inquirer");
const shell = require("shelljs");
const ora = require("ora");
const boxen = require("boxen");
const path = require("path");
const CONFIG = require("./config");

const leylo = require("../lib/leylo");

const bombino = {
  // Display title
  landing: async function() {
    bombLogo.print();
    console.log("");
    utils.log(`  ${chalk.black.bgBlue(" WELCOME TO BOMBINO ")}`);
    console.log("");
    this.test();
    // return this.greet();
  },

  test: async function() {
    CONFIG.generateConfig();

    this.kill();
  },
  greet: async function() {
    let answers = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
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
          },
          {
            name: "Change bombino settings",
            value: "config"
          }
        ]
      }
    ]);

    return answers.action;
  },
  promptCreateTemplateOrPanel: async function(data) {
    // let templates = data.templates;
    if (data == "panel") {
      return await this.newAdobePanelPrompt();
    } else if (data == "template") {
      return await this.newAdobeTemplatePrompt();
    } else {
      console.log("Unrecognized action");
    }
  },
  constructInquirerPrompt(objs) {
    return objs.map(obj => {
      return {
        name: obj.name,
        value: obj.gitURL || obj.path
      };
    });
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
  //
  // Gather user information then pass result to this.createPanelFromTemplate()
  newAdobePanelPrompt: async function() {
    // Currently assumes a CEP panel, but ideally should include UXP architecture

    let hasLocal = utils.getLocalTemplates();
    let isLocal = false;
    let SETTINGS = {};

    let DEF = await inquirer.prompt({
      type: "input",
      name: "extName",
      message: "Name of panel?",
      default: `Hello World`,
      validate: static.requireValueLength
    });
    SETTINGS["extName"] = DEF.extName;

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

    let quasarChoices, quasarTemplates, vueChoices, vueTemplates, count;
    quasarTemplates = templates.filter(template => {
      return template.isQuasar;
    });
    vueTemplates = templates.filter(template => {
      return template.isVue;
    });
    if (quasarTemplates.length) {
      quasarChoices =
        quasarTemplates.length > 1
          ? this.constructInquirerPrompt(quasarTemplates).sort((a, b) => {
              return a.index - b.index;
            })
          : this.constructInquirerPrompt(quasarTemplates);
    }
    if (vueTemplates.length) {
      vueChoices =
        vueTemplates.length > 1
          ? this.constructInquirerPrompt(vueTemplates).sort((a, b) => {
              return a.index - b.index;
            })
          : this.constructInquirerPrompt(vueTemplates);
    }

    let shouldPromptBuild =
      isLocal && vueTemplates.length > 0 && quasarTemplates.length > 0;

    // count = SETTINGS.isVue ? vueTemplates.length : quasarTemplates.length;
    count = templates.length;
    spinner.stopAndPersist({
      symbol: "",
      text: `${chalk.black.bgBlue(
        ` ✔ ${count} TEMPLATE${count > 1 ? "S" : ""} AVAILABLE `
      )}`
    });

    let prompts = [];
    let TEMPLATE_SYSTEM;

    if (!isLocal || shouldPromptBuild) {
      TEMPLATE_SYSTEM = await inquirer.prompt([
        {
          type: "list",
          name: "system",
          message: "Which build system should be used?",
          choices: [
            {
              name: "Vue-CLI",
              value: "vue"
            },
            {
              name: "Quasar-CLI",
              value: "quasar"
            }
          ]
        }
      ]);
      SETTINGS["system"] = TEMPLATE_SYSTEM.system;
      SETTINGS["isVue"] = /vue/.test(SETTINGS.system);
      SETTINGS["isQuasar"] = /quasar/.test(SETTINGS.system);
    } else {
      SETTINGS["isVue"] = vueTemplates.length;
      SETTINGS["isQuasar"] = quasarTemplates.length;
    }

    if (SETTINGS.isVue) {
      if (vueChoices.length) {
        prompts.push({
          type: "list",
          name: "templateType",
          message: "Which Vue-CLI template should be used?",
          choices: vueChoices,
          validate: static.requireOneValue
        });
      } else {
        console.log(`Sorry! No templates found. Please restart bombino.`);
        process.exit(22);
        return false;
      }
    } else if (SETTINGS.isQuasar) {
      if (quasarChoices.length) {
        prompts.push({
          type: "list",
          name: "templateType",
          message: "Which Quasar-CLI template should be used?",
          choices: quasarChoices,
          validate: static.requireOneValue
        });
      } else {
        console.log(`Sorry! No templates found. Please restart bombino.`);
        process.exit(22);
        return false;
      }
    }

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
      default: true
    });

    let answers = await inquirer.prompt(prompts);

    answers["hasModal"] = /plus|vuetify/.test(SETTINGS.templateType);
    answers["isTemplate"] = false;
    answers["isLocal"] = isLocal;
    // answers["path"] = SETTINGS.templateType;
    SETTINGS["isTemplate"] = false;
    return Object.assign(answers, SETTINGS);
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
