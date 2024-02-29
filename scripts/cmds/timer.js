const timersQueue = [];

module.exports = {
  config: {
    name: "timer",
    version: "1.17",
    author: "Sarkar",
    countDown: 1,
    role: 0,
    shortDescription: {
      vi: "Đặt hẹn giờ đếm ngược",
      en: "Set a countdown timer"
    },
    longDescription: {
      vi: "Cho phép bạn đặt một hẹn giờ đếm ngược và được thông báo khi hết giờ.",
      en: "Allows you to set a countdown timer and receive a notification when it's done."
    },
    category: "utility",
    guide: {
      vi: "",
      en: "{pn} <custom message> | <duration>\n{pn} list"
    }
  },

  onStart: async function ({ api, args, message, event, usersData }) {
    if (args[0] === "list") {
      if (timersQueue.length === 0) {
        api.sendMessage("🚫 There are no timers in the queue!", event.threadID, event.messageID);
      } else {
        const queueList = timersQueue.map(timer => {
          return `${timer.name} || Timer set for ${timer.duration} ${timer.timeUnit} - "${timer.message}"`;
        });
        api.sendMessage(`🚀 Timers in queue:\n\n• ${queueList.join("\n• ")}`, event.threadID, event.messageID);
      }
    } else if (args.length < 1) {
      api.sendMessage("ℹ Usage guide:\n\n/timer <custom message> | <duration (e.g. 1s | 1m | 1h)>\n/timer list (To see the timer queue list)\n\nExample: /timer Hi | 5s", event.threadID, event.messageID);
    } else {
      const input = args.join(" ");
      const [messageToSet, durationInput] = input.split("|").map(part => part.trim());

      if (!messageToSet || !durationInput) {
        api.sendMessage("Usage: /timer <message> | <duration (1s | 1m | 1h)>", event.threadID, event.messageID);
        return;
      }

      const durationMatch = durationInput.match(/^\s*(\d+(\.\d+)?)\s*([smh])\s*$/);
      if (!durationMatch) {
        api.sendMessage("Invalid duration format. Please use a valid format like 5s, 5m, or 5h.", event.threadID, event.messageID);
        return;
      }

      const duration = parseFloat(durationMatch[1]);
      const timeUnit = durationMatch[3];

      if (isNaN(duration) || duration <= 0) {
        api.sendMessage("Invalid duration. Please use a positive number for the duration.", event.threadID, event.messageID);
        return;
      }

      const seconds = duration * (timeUnit === "s" ? 1 : timeUnit === "m" ? 60 : 3600);
      const id = event.senderID;
      const userData = await usersData.get(id);
      const name = userData.name;

      const timerInfo = {
        name: name,
        duration: duration,
        timeUnit: timeUnit === "s" ? "second(s)" : timeUnit === "m" ? "minute(s)" : "hour(s)",
        message: messageToSet
      };

      timersQueue.push(timerInfo);

      const timerMessage = `✅ Timer set for ${duration} ${timerInfo.timeUnit}`;
      const timerReply = await api.sendMessage({
        body: timerMessage,
        mentions: [{ id: id, tag: name }],
      }, event.threadID);

      setTimeout(() => {
        api.unsendMessage(timerReply.messageID);

        api.sendMessage({
          body: `${name}, ${messageToSet}`,
          mentions: [{ id: id, tag: name }],
        }, event.threadID);

        const index = timersQueue.indexOf(timerInfo);
        if (index > -1) {
          timersQueue.splice(index, 1);
        }
      }, seconds * 1000);
    }
  },
};