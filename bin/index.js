#!/usr/bin/env node
require("dotenv").config();

const bombino = require("../lib/bombino");

// REFACTOR THIS TO A BETTER USERFLOW
// This should branch more organically and intuitively
async function init() {
  let action = await bombino.landing();

  if (/panel|template/.test(action)) {
    let answers = await bombino.promptCreateTemplateOrPanel(action);
    // console.log("!!! Fired");
    let result;

    if (answers.isTemplate) {
      result = await bombino.createNewTemplate(answers);
    } else {
      result = (await !answers.isLocal)
        ? bombino.createPanelFromGitTemplate(answers)
        : (await !answers.isStatic)
        ? bombino.createPanelFromGitTemplate(answers)
        : bombino.createPanelFromLocalTemplate(answers);
    }
  } else if (/utils/.test(action)) {
    console.log("Open utils");
  } else if (/config/.test(action)) {
    let result = await bombino.changeConfig();
    // console.log("Open config editor");
  }

  // return await bombino.end();
}
init();
