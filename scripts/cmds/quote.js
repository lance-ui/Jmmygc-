const axios = require('axios');

module.exports = {
  config: {
    name: 'quote',
    version: '1.0',
    author: 'Subash',
    role: 0,
    countDown: 1,
    shortDescription: 'Quote',
    longDescription: 'Anime Quote',
    category: 'learn',
    guide: {
      en: '{pn}',
    },
    envConfig: {},
  },

  onStart: async function ({ api, event }) {
    try {
      const apiUrl = 'https://sarkardocs.replit.app/quote';
      const response = await axios.get(apiUrl);

      if (response.data && response.data.code === 200) {
        const { author, character, quote, anime } = response.data;
        const message = `"${quote}"\n\n- ${anime}\n- ${character}`;
        api.sendMessage(message, event.threadID, event.messageID);
      } else {
        throw new Error('something went wrong.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      api.sendMessage('error', event.threadID, event.messageID);
    }
  },
};