// routes/articles.js
const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const parser = new Parser();

const rssFeeds = [
  'https://www.lemonde.fr/rss/une.xml',
  'https://www.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://feeds.feedburner.com/TechCrunch/',
];

router.get('/', async (req, res) => {
  try {
    const articles = [];

    for (const feedUrl of rssFeeds) {
      const feed = await parser.parseURL(feedUrl);
      feed.items.forEach(item => {
        articles.push({
          title: item.title,
          link: item.link,
          date: item.pubDate,
          author: item.creator || item.author || 'Inconnu',
          snippet: item.contentSnippet || '',
          source: feed.title || new URL(feedUrl).hostname,
          rssLink: feed.link || feedUrl,
        });
      });
    }

    // Trier les articles du plus récent au plus ancien
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(articles.slice(0, 30)); // Limite à 30 articles
  } catch (err) {
    console.error('Erreur RSS :', err);
    res.status(500).json({ error: 'Impossible de charger les articles.' });
  }
});

module.exports = router;
