#!/usr/bin/env node

const bombino = require("../lib/bombino");

async function init() {
  let action = await bombino.greet();
  let answers = await bombino.prompt(action);
  // Should determine if write new panel or template here
  let result = answers.isTemplate
    ? await bombino.createNewTemplate(answers)
    : await bombino.createPanelFromTemplate(answers);
  return await bombino.end();
}
init();
