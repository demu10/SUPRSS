// backend/routes/articlesPublic.js
const express = require('express');
const Parser = require('rss-parser');
const router = express.Router();

// User-Agent + timeout pour limiter les blocages
const parser = new Parser({
  headers: { 'User-Agent': 'SUPRSS/1.0 (+http://localhost:5000)' },
  requestOptions: { timeout: 8000 }
});

// ✅ Flux pour la bannière (ajoute/enlève ce que tu veux)
const rssFeeds = [
  'https://www.lemonde.fr/rss/une.xml',
  'https://www.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  'https://www.francetvinfo.fr/titres.rss',
  'https://www.theverge.com/rss/index.xml',
  'https://www.france24.com/fr/rss',
  'https://www.rfi.fr/fr/rss',
  'https://feeds.bbci.co.uk/news/world/rss.xml',

];

// GET /api/articles/public  (si monté sur /api/articles/public)
router.get('/', async (req, res) => {
  try {
    const articles = [];

    for (const feedUrl of rssFeeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        (feed.items || []).forEach(item => {
          articles.push({
            title: item.title,
            link: item.link,
            date: item.pubDate || item.isoDate,
            sourceName: feed.title || new URL(feedUrl).hostname,
            snippet: item.contentSnippet || item.content || '',
            feedUrl
          });
        });
      } catch (e) {
        console.warn('Flux en échec :', feedUrl, e.message);
      }
    }

    // tri + limite
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(articles.slice(0, 30));
  } catch (err) {
    console.error('Erreur RSS :', err);
    // On renvoie un tableau vide pour ne jamais casser le front
    res.json([]);
  }
});

module.exports = router;
