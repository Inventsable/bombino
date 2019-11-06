const static = require("./staticValues");
const utils = require("./utils");
const bombLogo = require("./logo");
const chalk = require("chalk");
const inquirer = require("inquirer");
const shell = require("shelljs");
const ora = require("ora");
const boxen = require("boxen");

const bombino = {
  // Display title
  greet: async function() {
    bombLogo.print();
    console.log("");
    utils.log(`${chalk.black.bgBlue(" WELCOME TO BOMBINO ")}`);
    console.log("");
    return await inquirer.prompt([
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
          }
        ]
      }
    ]);
  },
  prompt: async function(data) {
    if (data.action == "panel") {
      return await this.newPanelPrompt();
    } else if (data.action == "template") {
      return await this.newTemplatePrompt();
    } else {
      console.log("Unrecognized action");
    }
  },
  newTemplatePrompt: async function() {
    let SETTINGS = {};
    let ROOT = await inquirer.prompt([
      {
        type: "list",
        name: "source",
        message: "Select the source of your new template:",
        choices: [
          {
            name: "Current local directory",
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
  newPanelPrompt: async function() {
    let SETTINGS = {};

    let TEMPLATE_SYSTEM = await inquirer.prompt([
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
    let prompts = [];
    prompts.push({
      type: "input",
      name: "extName",
      message: "Name of panel?",
      default: `My ${SETTINGS.system.charAt(0).toUpperCase() +
        SETTINGS.system.substring(1)}-CLI Panel`
    });

    // THIS LIST SHOULD COME FROM FIRESTORE AND USER STORAGE
    SETTINGS.isVue
      ? prompts.push({
          type: "list",
          name: "templateType",
          message: "Which template should be used?",
          choices: [
            {
              name: "Bare (Absolute minimum)",
              value: "Inventsable/cep-vue-cli-bare"
            },
            {
              name: "Basic (Include utility components)",
              value: "Inventsable/cep-vue-cli-basic3x"
            },
            {
              name: "Router (Basic and Vue Router)",
              value: "Inventsable/cep-vue-cli-router3x"
            },
            {
              name: "Plus (Vuetify, Router, Lottie, ModalDialog)",
              value: "Inventsable/cep-vue-cli-plus"
            }
          ],
          validate: static.requireOneValue
        })
      : prompts.push({
          type: "list",
          name: "templateType",
          message: "Which template should be used?",
          choices: [
            {
              name: "Plus (Quasar, Vuex, Modal, Lottie)",
              value: "Inventsable/cep-quasar-cli-plus"
            }
          ],
          validate: static.requireOneValue
        });
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

    let answers = await inquirer.prompt(prompts);
    answers["isTemplate"] = false;
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
    let REPO = utils._downloadGitRepo(SETTINGS);
    return SETTINGS;
  },
  createPlaceholdersForTemplate(SETTINGS) {
    // Should determine if .vue or .quasar
    console.log("CORRECT HERE");
  },
  // Download correct template from Github, then crawl through and correct any placeholder text
  createPanelFromTemplate: async function(SETTINGS) {
    const DIR_NAME = SETTINGS.extName.split(" ").join("-");
    const GITHUB_LINK = `${SETTINGS.templateType}`;
    let spinner = ora({
      text: `Downloading template from ${GITHUB_LINK}...`,
      spinner: static.ORA_SPINNER
    }).start();

    utils
      ._downloadTemplate(SETTINGS)
      .then(SETTINGS => {
        console.log("");
        spinner.stopAndPersist({
          symbol: "",
          text: `${chalk.black.bgBlue(` ✔ DOWNLOAD COMPLETE `)}`
        });
        console.log("");

        utils._correctPlaceholders(SETTINGS).then(() => {
          spinner = ora({
            text: `Running ${chalk.yellow("npm install")} for you...`,
            spinner: static.ORA_SPINNER
          }).start();
          shell.cd(DIR_NAME);
          shell.exec("npm install", () => {
            console.log("");
            spinner.stopAndPersist({
              symbol: "",
              text: `${chalk.black.bgBlue(` ✔ INSTALL COMPLETE `)}`
            });
            console.log("");
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
            utils.log();
            utils.log(`Ready to get started? Run the following commands:`);
            utils.log();
            utils.log(`   ${chalk.yellow(`cd ${DIR_NAME}`)}`);
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
            return DIR_NAME;
          });
        });
      })
      .catch(err => console.error(err));
  },
  end: async function(DIR_NAME) {}
};

module.exports = bombino;
