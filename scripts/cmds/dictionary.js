const axios = require("axios");

module.exports = {
  config: {
    name: "dictionary",
    aliases: ["dic"],
    version: "1.0",
    author: "Jun",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Lookup word definitions from the dictionary.",
    },
    longDescription: {
      en: "Lookup word definitions from the dictionary.",
    },
    category: "learn",
    guide: {
      en: "{pn} <word> (Lookup word definitions)",
    },
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args[0]) {
      axios
        .get(
          encodeURI(`https://api.dictionaryapi.dev/api/v2/entries/en/${args.join(" ").trim().toLowerCase()}`)
        )
        .then((res) => {
          let data = res.data[0];
          let phonetics = data.phonetics;
          let meanings = data.meanings;
          let msg_meanings = "";
          meanings.forEach((items) => {
            let example = items.definitions[0].example
              ? `\n*example:\n \"${items.definitions[0].example[0].toUpperCase() + items.definitions[0].example.slice(1)}\"`
              : '';
            msg_meanings += `\n• ${items.partOfSpeech}\n ${items.definitions[0].definition[0].toUpperCase() + items.definitions[0].definition.slice(1) + example}`;
          });
          let msg_phonetics = '';
          phonetics.forEach((items) => {
            let text = items.text ? `\n    /${items.text}/` : '';
            msg_phonetics += text;
          });
          var msg = `❰ ❝ ${data.word} ❞ ❱` + msg_phonetics + msg_meanings;
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          return api.sendMessage(msg, threadID, messageID);
        })
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            return api.sendMessage('No Definitions Found', threadID, messageID);
          } else {
            console.error("[ERROR]", err);
            return api.sendMessage('An error occurred while fetching the dictionary data.', threadID, messageID);
          }
        });
    } else {
      api.sendMessage('Missing input!', threadID, messageID);
    }
  },
};