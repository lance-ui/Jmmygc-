const axios = require('axios');

module.exports = {
  config: {
    name: 'news',
    version: '1.0',
    author: 'Subash',
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: 'Lấy tin tức mới nhất',
      en: 'Get the latest news',
    },
    longDescription: {
      vi: 'Lấy tin tức mới nhất từ các nguồn tin đáng tin cậy.',
      en: 'Get the latest news from reliable sources.',
    },
    category: 'media',
    guide: {
      vi: '{pn}".',
      en: '{pn}',
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const apiKey = '7604d5d5d7a9411d8b6dd6f1e9c777ca';

      const response = await axios.get(`https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&country=us&pageSize=10`);

     api.setMessageReaction("✅", event.messageID, () => { }, true);

      const articles = response.data.articles;

      if (articles.length > 0) {
        let messageToSend = '📰 Latest News Headlines:\n\n\n';

        articles.forEach((article, index) => {
          messageToSend += `${index + 1}. ${article.title}\n`;
          messageToSend += `   - Source: ${article.source.name}\n`;
          messageToSend += `   - Published: ${new Date(article.publishedAt).toDateString()}\n`;
          messageToSend += `   - Description: ${article.description}\n`;
          messageToSend += `   - Read more:\n${article.url}\n\n`;
        });

        api.sendMessage(messageToSend, event.threadID, event.messageID);
      } else {
        api.sendMessage('No news articles found.', event.threadID, event.messageID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage('Error', event.threadID, event.messageID);
    }
  },
};