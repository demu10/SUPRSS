const cron = require('node-cron');
const RSSParser = require('rss-parser');
const mongoose = require('mongoose');
const Feed = require('./models/Feed');
const Article = require('./models/Article');

const parser = new RSSParser();

mongoose.connect('mongodb://localhost:27017/suprss_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fetchFeedArticles(feed) {
  try {
    const rss = await parser.parseURL(feed.url);
    for (const item of rss.items || []) {
      if (!item.link) continue;

      const exists = await Article.findOne({ link: item.link });
      if (exists) continue;

      await Article.create({
        feedId: feed._id,
        collectionIds: [feed.collectionId],
        title: item.title || '',
        link: item.link,
        date: item.pubDate ? new Date(item.pubDate) : new Date(),
        author: item.creator || item.author || '',
        snippet: item.contentSnippet || '',
        content: item.content || item.contentSnippet || '',
        sourceName: rss.title || feed.name,
        feedUrl: feed.url,
        readBy: [],
        favoritedBy: []
      });
    }
  } catch (err) {
    console.error(`Erreur flux ${feed.name} :`, err.message);
  }
}

async function fetchAllFeeds() {
  const feeds = await Feed.find({ status: 'active' });
  for (const feed of feeds) {
    await fetchFeedArticles(feed);
  }
}

cron.schedule('*/30 * * * *', () => {
  console.log('⏰ CRON RSS lancé');
  fetchAllFeeds();
});
