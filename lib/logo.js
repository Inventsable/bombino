const chalk = require("chalk");

const logos = [
  `
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@     @@@@     @@@   @@@   @@@     @@@  @@%   @@  @@@     .@@@@@@@@@
@@@@@@@@  @  @@@  @@@  @@    @@   @@@  @  @@@  @@% &  @  @@  #@@   @@@@@@@@
@@@@@@@@  @  .@@  @@@  @@  @ .    @@@  @   @@  @@% @@    @@  @@@   @@@@@@@@
@@@@@@@@     @@@.     @@@  @.  @  @@@     @@@  @@% @@@   @@@      @@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`,
  `
###########################################################################
########     ####     ###   ###   ###     ###  ##%   ##  ###     .#########
########  #  ###  ###  ##    ##   ###  #  ###  ##% &  #  ##  ###   ########
########  #  .##  ###  ##  # .    ###  #   ##  ##% ##    ##  ###   ########
########     ###.     ###  #.  #  ###     ###  ##% ###   ###      #########
###########################################################################`,
  `
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
$$$$$$$$     $$$$     $$$   $$$   $$$     $$$  $$%   $$  $$$     .$$$$$$$$$
$$$$$$$$  $  $$$  $$$  $$    $$   $$$  $  $$$  $$% &  $  $$  $$$   $$$$$$$$
$$$$$$$$  $  .$$  $$$  $$  $ .    $$$  $   $$  $$% $$    $$  $$$   $$$$$$$$
$$$$$$$$     $$$.     $$$  $.  $  $$$     $$$  $$% $$$   $$$      $$$$$$$$$
$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$`,
  `
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%     %%%%     %%%   %%%   %%%     %%%  %%%   %%  %%%     .%%%%%%%%%
%%%%%%%%  %  %%%  %%%  %%    %%   %%%  %  %%%  %%% &  %  %%  %%%   %%%%%%%%
%%%%%%%%  %  .%%  %%%  %%  % .    %%%  %   %%  %%% %%    %%  %%%   %%%%%%%%
%%%%%%%%     %%%.     %%%  %.  %  %%%     %%%  %%% %%%   %%%      %%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%`,
  `
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&     &&&&     &&&   &&&   &&&     &&&  &&&   &&  &&&     .&&&&&&&&&
&&&&&&&&  &  &&&  &&&  &&    &&   &&&  &  &&&  &&& &  &  &&  &&&   &&&&&&&&
&&&&&&&&  &  .&&  &&&  &&  & .    &&&  &   &&  &&& &&    &&  &&&   &&&&&&&&
&&&&&&&&     &&&.     &&&  &.  &  &&&     &&&  &&& &&&   &&&      &&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&`
];

module.exports = {
  print: function() {
    console.log(chalk.blue(logos[this.roll(0, logos.length - 1)]));
  },
  roll: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};