const axios = require('axios');

module.exports = {
  config: {
    name: "fact",
    version: "1.5",
    author: "Subash",
    countDown: 1,
    role: 0,
    shortDescription: "Get interesting facts",
    longDescription: "Get interesting facts from the API",
    category: "learn",
    guide: { en: "{pn} <limit>" }
  },

  onStart: async function ({ api, event, args }) {
    const apiKey = 'Sqhf/Iy0PmjmklQNnCjFyg==QUfLuwFxhSh3aJSm';
    const limit = args[0] || 3;

    try {
      const response = await axios.get(`https://api.api-ninjas.com/v1/facts?limit=${limit}`, {
        headers: { 'X-Api-Key': apiKey },
      });

      const facts = response.data;

      if (!facts || facts.length === 0) {
        return api.sendMessage("No facts found.", event.threadID, event.messageID);
      }

      const formattedFacts = facts.map((fact, index) => `${index + 1}. ${fact.fact}`).join('\n');
      const message = `Here are ${limit} interesting facts:\n\n${formattedFacts}`;

      api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error fetching facts:", error);
      api.sendMessage("An error occurred while fetching facts.", event.threadID, event.messageID);
    }
  }
};