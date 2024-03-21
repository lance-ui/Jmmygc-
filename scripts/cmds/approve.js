const fs = require("fs");
const path = require('path');

module.exports = {
  config: {
    name: "approve",
    aliases: ["app"],
    version: "1.2.3",
    author: "Subash",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Approve"
    },
    longDescription: {
      en: "Approve"
    },
    category: "Owner",
    guide: {
      vi: "",
      en: "{pn}  -l | list\n{pn} -d | delete <tid>\n{pn} -a | approve <tid>"
    }
  },

  onLoad: async function () {
    const dataPath = path.join(__dirname, "..", "events", "cache", "approvedThreads.json");
    const pendingPath = path.join(__dirname, "..", "events", "cache", "pendingThreads.json");
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([]));
    }
    if (!fs.existsSync(pendingPath)) {
      fs.writeFileSync(pendingPath, JSON.stringify([]));
    }
  },

  onStart: async function ({ api, args, message, event }) {

  const subash = ['100083670401783'];

    if (!subash.includes(event.senderID)) {
      return api.sendMessage("❌️ | You don't have the access!", event.threadID, event.messageID);
    }
    const { threadID, messageID } = event;
    const type = args[0] || threadID;
    const dataPath = path.join(__dirname, "..", "events", "cache", "approvedThreads.json");
    const pendingPath = path.join(__dirname, "..", "events", "cache", "pendingThreads.json");
    let data = JSON.parse(fs.readFileSync(dataPath));
    let pending = JSON.parse(fs.readFileSync(pendingPath));

    const getThreadName = async (threadId) => {
      try {
        const threadInfo = await api.getThreadInfo(threadId);
        return threadInfo.name || "Unknown";
      } catch (error) {
        console.error("Error fetching thread info:", error);
        return "Unknown";
      }
    };
    switch (type) {
      case "list":
      case "-l": {
        if (data.length === 0) {
          api.sendMessage('❌ | No approved groups.', threadID, messageID);
          return;
        }
        let msg = "‎";
        for (const e of data) {
          const threadName = await getThreadName(e);
          msg += `╭Name: ${threadName}\n╰ID: ${e}\n`;
        }
        api.sendMessage(msg, threadID, messageID);
        break;
      }
      case "approve":
      case "-a": {
        if (!args[1]) {
          api.sendMessage(`⚠ Please provide the threadID`, event.threadID,  messageID);
          return;
        }
        if (/^[a-zA-Z]+$/.test(args[1])) {
          api.sendMessage("⚠ The threadID you provided must be a number.", event.threadID, messageID);
          return;
        }
        if ((args[1].length !== 16) && (args[1].length !== 17)) {
          api.sendMessage("⚠ ThreadID must be exactly 16 or 17 digit numbers.", event.threadID, messageID);
          return;
        }
        if (data.includes(args[1])) {
          api.sendMessage(`✅ | Box already approved!\n\n╭Name: ${await getThreadName(args[1])}\n╰ID: ${args[1]}`, threadID, messageID);
          return;
        } else {
          data.push(args[1]);
          pending.splice(pending.indexOf(args[1]), 1);
          fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
          fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
          api.sendMessage(`✅ | Box approval successful!\n\n╭Name: ${await getThreadName(args[1])}\n╰ID: ${args[1]}`, threadID, messageID);
        }
        break;
      }
      case "delete":
      case "-d": {
        if (!args[1]) {
          api.sendMessage(`⚠ Please provide the threadID`, event.threadID, messageID);
          return;
        }
        if (/^[a-zA-Z]+$/.test(args[1])) {
          api.sendMessage("⚠ The threadID you provided must be a number.", event.threadID, messageID);
          return;
        }
        if ((args[1].length !== 16) && (args[1].length !== 17)) {
          api.sendMessage("⚠ Thread ID must be exactly 16 or 17 digit numbers.", event.threadID, messageID);
          return;
        }
        idBox = args[1];
        if (!data.includes(idBox)) {
          api.sendMessage("⚠ This box was not approved before! ", threadID, messageID);
          return;
        }
        api.sendMessage(`✅ | Box removed successfully!\n\n╭Name: ${await getThreadName(idBox)}\n╰ID: ${idBox}`, threadID, () => {
          if (!pending.includes(idBox)) {
            pending.push(idBox);
          }
          data.splice(data.indexOf(idBox), 1);
          fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
          fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
        }, messageID);
        return;
        break;
      }
      default:
        return message.SyntaxError();
    }
  }
};
