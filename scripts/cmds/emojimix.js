const axios = require('axios');

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["em"],
    version: "1.1",
    author: "Rishad",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: 'Emoji Mix'
    },
    longDescription: {
      en: "Generate an image using a mix of emojis."
    },
    category: "General",
    guide: {
      en: '{pn} 👽 🐢'
    }
  },

  onStart: async function ({ message, args }) {
    let emojis = args.join('').match(/.{1,2}/g); // Split the input into individual emojis

    if (!emojis || emojis.length !== 2) {
      return message.reply("Please provide two emojis for mixing \n example: /emojimix 👽 🐢");
    }

    message.reply("✅ Mixing your Emojis...").then((info) => { id = info.messageID });

    try {
      const [emoji1, emoji2] = emojis;
      const API = `https://for-devs.onrender.com/api/emojimix?apikey=fuck&emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
      const imageStream = await global.utils.getStreamFromURL(API);

      if (!imageStream) {
        throw new Error("Failed to mix the provided emojis.");
      }

      return message.reply({
        attachment: imageStream
      });
    } catch (error) {
      console.log(error);
      message.reply(`Cannot mix ${emojis[0]} and ${emojis[1]}.`).then(() => {
        message.delete(id);
      });
    }
  }
};