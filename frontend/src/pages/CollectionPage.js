import React, { useEffect, useState } from 'react';
import axios from 'axios';

function CollectionPage({ collectionId }) {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const response = await axios.get(`/api/collections/${collectionId}/articles`, {
        params: { search }
      });
      setArticles(response.data);
    };
    fetchArticles();
  }, [search]);

  return (
    <div className="p-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher dans les articles..."
        className="w-full p-2 border mb-4"
      />
      <ul>
        {articles.map((article) => (
          <li key={article._id} className="mb-4 border-b pb-2">
            <a href={article.url} className="text-blue-600 font-bold">{article.title}</a>
            <p>{article.contentSnippet}</p>
            <small>{article.publishedAt}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CollectionPage;
