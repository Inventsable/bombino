module.exports = {
  requireValidPort: value => {
    return /\d{4,5}/.test(value) && value > 1023 && value < 65535
      ? true
      : "Must be a valid Port between 1024 and 65534";
  },
  requireOneValue: value => {
    return value.length >= 1 ? true : `Must select at least one host App!`;
  },

  ORA_SPINNER: {
    interval: 80,
    frames: [
      "   ⠋",
      "   ⠙",
      "   ⠚",
      "   ⠞",
      "   ⠖",
      "   ⠦",
      "   ⠴",
      "   ⠲",
      "   ⠳",
      "   ⠓"
    ]
  },
  CEP_HOSTLIST: [
    {
      name: "ILST",
      version: "[23,99.9]"
    },
    {
      name: "AEFT",
      version: "[16,99.9]"
    },
    {
      name: "PHXS",
      version: "[20,99.9]"
    },
    {
      name: "IDSN",
      version: "[14,99.9]"
    },
    {
      name: "PPRO",
      version: "[13,99.9]"
    },
    {
      name: "AUDT",
      version: "[12,99.9]"
    }
  ],

  BOXEN_OPTS: {
    padding: 2,
    margin: 1,
    align: "center",
    borderColor: "blue",
    borderStyle: "round"
  },

  QuasarHTMLHeader: `<%= htmlWebpackPlugin.options.productName %>`,
  QuasarHTMLDescription: `<%= htmlWebpackPlugin.options.productDescription %>`,
  QuasarHTMLWidth: `<% if (htmlWebpackPlugin.options.ctx.mode.cordova || htmlWebpackPlugin.options.ctx.mode.capacitor) { %>, viewport-fit=cover<% } %>`
};
