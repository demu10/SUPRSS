require('dotenv').config();
const mongoose = require('mongoose');
const Parser = require('rss-parser');
const parser = new Parser();
const connectDB = require('./config/db');
const Article = require('./models/Article');
const Feed = require('./models/Feed');

connectDB();

(async () => {
  try {
    console.log("🔄 Récupération des articles depuis les flux RSS...");

    const feeds = await Feed.find();
    if (!feeds.length) {
      console.log("⚠️ Aucun flux RSS trouvé dans la base.");
      process.exit(0);
    }

    for (let feed of feeds) {
      const rss = await parser.parseURL(feed.url);

      for (let item of rss.items) {
        // Vérifier si l'article existe déjà
        const exists = await Article.findOne({ link: item.link });

        if (!exists) {
          await Article.create({
            title: item.title,
            link: item.link,
            content: item.contentSnippet || item.content || "",
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            source: feed.name || rss.title,
          });
          console.log(`✅ Nouvel article ajouté : ${item.title}`);
        } else {
          console.log(`⏭️ Article déjà existant : ${item.title}`);
        }
      }

      // 🔥 Supprimer les anciens articles (on garde seulement 20 derniers par flux)
      const articles = await Article.find({ source: feed.name || rss.title })
        .sort({ pubDate: -1 });

      if (articles.length > 20) {
        const toDelete = articles.slice(20); // à partir du 21e
        const idsToDelete = toDelete.map(a => a._id);
        await Article.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`🗑️ ${toDelete.length} anciens articles supprimés pour ${feed.name || rss.title}`);
      }
    }

    console.log("🎉 Import terminé !");
    process.exit(0);

  } catch (error) {
    console.error("❌ Erreur lors du fetch :", error);
    process.exit(1);
  }
})();
