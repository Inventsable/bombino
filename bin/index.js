#!/usr/bin/env node

const bombino = require("../lib/bombino");

async function init() {
  let greeting = await bombino.greet();
  let answers = await bombino.prompt();
  let name = await bombino.write(answers);
  return await bombino.end();
}
init();

// function init() {
//   bombino.greet().then(() => {
//     bombino.prompt().then(answers => {
//       bombino.write(answers).then(name => {
//         bombino.end(name);
//         return null;
//       });
//     });
//   });
// }
