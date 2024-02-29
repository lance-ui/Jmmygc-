const fast = require('fast-speedtest-api');
const NepaliDate = require('nepali-date');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "info",
    aliases: ["❓"],
    version: "5.0",
    author: "Subash",
    role: 2,
    countDown: 5,
    shortDescription: {
      en: "Uptime"
    },
    longDescription: {
      en: "Stats"
    },
    category: "Media",
    guide: {
      en: "{pn} | {n}"
    }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    const timeStart = Date.now();

    const speedTest = new fast({
      token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
      verbose: false,
      timeout: 10000,
      https: true,
      urlCount: 5,
      bufferSize: 8,
      unit: fast.UNITS.Mbps
    });

    const speedResult = await speedTest.getSpeed();
    const ping = Date.now() - timeStart;
    let pingStatus = "";

    if (ping <= 400) {
      pingStatus = "Smooth like a Ferrari!";
    } else {
      pingStatus = "Not smooth, throw your router buddy!";
    }

    const uptime = process.uptime();
    const days = Math.floor(uptime / (60 * 60 * 24));
    const hours = Math.floor((uptime / 3600) % 24);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;

    const nepalTime = moment.tz("Asia/Kathmandu").format("YYYY/MM/DD || hh:mm:ss A");
    const nepaliDate = new NepaliDate(new Date());
    const bsDateStr = nepaliDate.format("dddd DD, MMMM YYYY");
    const adDateStr = moment.tz("Asia/Kathmandu").format("dddd DD, MMMM YYYY");
    const neTime = moment.tz("Asia/Kathmandu").format("hh:mm:ss A");

    const allUsers = await usersData.getAll();
    const allThreads = await threadsData.getAll();

    const ownerUid = 100086975430183;
    const ownerData = await usersData.get(ownerUid);
    const ownerName = ownerData.name;

    const link = "https://i.ibb.co/q9ZrZPW/image.jpg";

    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const processMemory = prettyBytes(process.memoryUsage().rss);

    const diskUsage = await getDiskUsage();
    const prefix = global.GoatBot.config.prefix;

    const combinedMessage =
      `Owner: ${ownerName}\n\n` +
      `Bot is up for:\n${uptimeString}\n\n` +
      `As of ${nepalTime},\n` +
      `- Total Users: ${allUsers.length}\n` +
      `- Total Threads: ${allThreads.length}\n\n` +
      `📶 Speed: ${speedResult} MBPS\n` +
      `🛜 Ping: ${ping} MS\n` +
      `ℹ Status: ${pingStatus}\n\n` +
      `⏰ Time: ${neTime}\n` +
      `📆 Date (BS): ${bsDateStr}\n` +
      `📅 Date (AD): ${adDateStr}\n‎\n` +
      `🌐 Prefix: [ ${prefix} ]\n\n` +
      `📀 | Disk Information:\n        ${generateProgressBar((diskUsage.used / diskUsage.total) * 100)}\n        Usage: ${prettyBytes(diskUsage.used)}\n        Total: ${prettyBytes(diskUsage.total)}\n\n` +
      `💾 | Memory Information:\n        ${generateProgressBar((process.memoryUsage().rss / totalMemory) * 100)}\n        Usage: ${processMemory}\n        Total: ${prettyBytes(totalMemory)}\n\n` +
      `💻 | Ram Information:\n        ${generateProgressBar(((totalMemory - freeMemory) / totalMemory) * 100)}\n        Usage: ${prettyBytes(totalMemory - freeMemory)}\n        Total: ${prettyBytes(totalMemory)}`;

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    api.sendMessage(
      {
        body: combinedMessage,
        mentions: [{ id: ownerUid, tag: ownerName }],
        attachment: await global.utils.getStreamFromURL(link)
      },
      event.threadID,
      event.messageID
    );
  },

  onChat: async function ({ api, event, usersData, threadsData }) {
    if (event.body && event.body.toLowerCase() === "info") {
      this.onStart({ api, event, usersData, threadsData });
    }
  }
};

async function getDiskUsage() {
  const { stdout } = await require('util').promisify(require('child_process').exec)('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

function generateProgressBar(percentage) {
  const totalSections = 10;
  const filledSections = Math.ceil((percentage / 100) * totalSections);

  const progressBar = `[${'█'.repeat(filledSections)}${'▒'.repeat(totalSections - filledSections)}]`;

  return progressBar;
}