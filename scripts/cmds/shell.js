const { exec } = require('child_process');

module.exports = {
  config: {
    name: "shell",
    version: "1.0",
    author: "Unknown",
    countDown: 5,
    role: 2,
    longDescription: { en: "Run the shell commands" },
    category: "utility",
    guide: {
      en: "{p}{n} <command>"
    }
  },

  onStart: async function ({ args, message, api, event }) {
   const subash = ['100083670401783'];

    if (!subash.includes(event.senderID)) {
      return api.sendMessage("❌ | You don't have the access!", event.threadID, event.messageID);
    }
    const command = args.join(" ");

    if (!command) {
      return message.reply("Please provide a command to execute.");
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`${error}`);
        return message.reply("An error occured.");
      }

      if (stderr) {
        console.error(`${stderr}`);
        return message.reply(`${stderr}`);
      }

      console.log(`${stdout}`);
      message.reply(`${stdout}`);
    });
  }
};
