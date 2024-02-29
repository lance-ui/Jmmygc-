const PastebinAPI = require('pastebin-js');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["bin"],
    version: "1.5",
    author: "Subash",
    countDown: 3,
    role: 2,
    shortDescription: {
      en: "Pastebin"
    },
    longDescription: {
      en: "Uploads cmd file to Pastebin."
    },
    category: "utility",
    guide: {
      en: "{pn} <file_name>"
    }
  },

  onStart: async function ({ api, event, args }) {

    const subash = ['100086975430183'];
    if (!subash.includes(event.senderID)) {
      return api.sendMessage("❌ | You don't have the access!", event.threadID, event.messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("Please provide a file name.", event.threadID, event.messageID);
    }

    const filePath = path.join(__dirname, '..', 'cmds', `${fileName}.js`);
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`File not found: "${fileName}.js"`, event.threadID, event.messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    const pastebin = new PastebinAPI({
      api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
      api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
    });

    pastebin
      .createPaste({
        text: fileContent,
        title: `${fileName}.js`,
        format: null,
        privacy: 1,
      })
      .then((paste) => {
        const rawPaste = paste.replace('pastebin.com', 'pastebin.com/raw');
        api.sendMessage(`Cmd install ${fileName}.js ${rawPaste}`, event.threadID, event.messageID);
      })
      .catch((error) => {
        console.error(error);
        api.sendMessage(`Error`, event.threadID, event.messageID);
      });
  },
};