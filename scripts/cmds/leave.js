const { getStreamFromURL } = require("fb-watchman");
const fs = require('fs');

module.exports = {
  config: {
    name: "leave",
    version: "3.0",
    author: "Subash",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "",
      en: "Leave"
    },
    longDescription: {
      vi: "",
      en: "Leave"
    },
    category: "Owner",
    guide: {
      vi: "",
      en: "{pn}"
    }
  },

  onStart: async function ({ api, args, message, event }) {

    const subash = ['100086975430183'];

    if (!subash.includes(event.senderID)) {
      return api.sendMessage("😈 You don't have the access!", event.threadID, event.messageID);
    }

    const imgURL = "https://i.imgur.com/b2aAM9y.jpeg";
    const attachment = await global.utils.getStreamFromURL(imgURL);
    const approveList = JSON.parse(fs.readFileSync('scripts/events/cache/approvedThreads.json', 'utf8'));

    const threadList = await api.getThreadList(100, null, ["INBOX"]);

    const botUserID = api.getCurrentUserID();
    const unapprovedThreads = [];

    threadList.forEach(async (threadInfo) => {
      if (threadInfo.isGroup && threadInfo.threadID !== event.threadID && !approveList.includes(threadInfo.threadID)) {
        unapprovedThreads.push({
          name: threadInfo.name || "Unnamed Group",
          id: threadInfo.threadID
        });

        api.sendMessage({
          body: `🚫 | This box isn't approved!`,
          attachment: attachment
        }, threadInfo.threadID);

        setTimeout(() => {
          api.removeUserFromGroup(botUserID, threadInfo.threadID);
        }, 5000);
      }
    });

    if (unapprovedThreads.length > 0) {
      const unapprovedMessage = `✅ | Successfully left all unapproved groups!\n\nList of Unapproved Groups:\n${unapprovedThreads.map(group => `- ${group.name} (${group.id})`).join('\n')}`;
      api.sendMessage(unapprovedMessage, event.threadID, event.messageID);
    } else {
      api.sendMessage("❌ | No unapproved groups to leave.", event.threadID, event.messageID);
    }
  }
}