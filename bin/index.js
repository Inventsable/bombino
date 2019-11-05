#!/usr/bin/env node

const bombino = require("../lib/bombino");
const inquirer = require("inquirer");

function init() {
  bombino.greet().then(() => {
    bombino.prompt().then(answers => {
      bombino.write(answers).then(name => {
        bombino.end(name);
        return null;
      });
    });
  });
}

init();
