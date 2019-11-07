#!/usr/bin/env node
require("dotenv").config();

const bombino = require("../lib/bombino");

async function init() {
  let action = await bombino.landing();
  let answers = await bombino.prompt(action);
  // Should determine if write new panel or template here
  let result = answers.isTemplate
    ? await bombino.createNewTemplate(answers)
    : (await !answers.isLocal)
    ? bombino.createPanelFromGitTemplate(answers)
    : bombino.createPanelFromLocalTemplate(answers);
  return await bombino.end();
}
init();
