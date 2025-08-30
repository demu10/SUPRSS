const cron = require('node-cron');
const RSSParser = require('rss-parser');
const Feed = require('./models/feeds');
const Article = require('./models/articles');

const parser = new RSSParser();

// Fonction pour récupérer et stocker les articles d'un flux
async function fetchFeedArticles(feed) {
  try {
    const rss = await parser.parseURL(feed.url);

    for (const item of rss.items) {
      // Vérifier si l'article existe déjà
      const exists = await Article.findOne({ link: item.link });
      if (!exists) {
        await Article.create({
          feedId: feed._id,
          collectionId: feed.collectionId,
          title: item.title,
          link: item.link,
          author: item.creator || item.author || '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          summary: item.contentSnippet || '',
          isRead: false,
          isFavorite: false
        });
      }
    }
  } catch (err) {
    console.error(`Erreur récupération flux ${feed.title}:`, err.message);
  }
}

// Fonction pour récupérer tous les flux actifs
async function fetchAllFeeds() {
  try {
    const feeds = await Feed.find({ status: 'active' });
    for (const feed of feeds) {
      await fetchFeedArticles(feed);
    }
  } catch (err) {
    console.error('Erreur récupération des flux:', err.message);
  }
}

// Planifier selon la fréquence (ici toutes les 10 minutes par défaut)
cron.schedule('*/10 * * * *', () => {
  console.log('Lancement de la récupération RSS...');
  fetchAllFeeds();
});
