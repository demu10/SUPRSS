const Parser = require('rss-parser');
const parser = new Parser();
const Feed = require('../models/Feed');
const Article = require('../models/Article');

async function fetchFeedAndStore(feedDoc) {
  if (!feedDoc || feedDoc.status !== 'active') return 0;
  try {
    const feed = await parser.parseURL(feedDoc.url);
    let added = 0;
    for (const item of feed.items) {
      const link = item.link || item.guid;
      if (!link) continue;

      const exists = await Article.findOne({ link }); // changed from url → link
      if (exists) continue;

      const art = {
        feedId: feedDoc._id, // changed from feed → feedId
        title: item.title || 'Sans titre',
        link, // changed from url → link
        date: item.isoDate
          ? new Date(item.isoDate)
          : (item.pubDate ? new Date(item.pubDate) : new Date()),
        author: item.creator || item.author || '',
        snippet: item.contentSnippet || '', // added snippet field
        content: item.content || item['content:encoded'] || item.contentSnippet || '',
        sourceName: feed.title || feedDoc.title || '', // fallback adapted
        feedUrl: feed.link || feedDoc.url, // added feedUrl
        collectionIds: [feedDoc.collectionId] // added collections
      };

      await Article.create(art);
      added++;
    }

    await Feed.findByIdAndUpdate(feedDoc._id, { lastFetchedAt: new Date() }); // added update

    return added;
  } catch (err) {
    console.error('rssService.fetchFeedAndStore error', feedDoc.url, err.message);
    return 0;
  }
}

async function fetchAllActiveFeeds() {
  const feeds = await Feed.find({ status: 'active' });
  let total = 0;
  for (const f of feeds) {
    total += await fetchFeedAndStore(f);
  }
  return total;
}

module.exports = { fetchFeedAndStore, fetchAllActiveFeeds };
