import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './HomePage.css';

function HomePage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/articles')
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => console.error('Erreur chargement articles:', err));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <div className="home-page">

        {/* Bande animée d'articles */}
        <div className="animated-cards">
          {articles.map((article, index) => (
            <div className="card" key={index}>
              <h4>
                <a href={article.link} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h4>

              <p className="card-source">
                Source : <strong>{article.sourceName}</strong>
              </p>

              <p className="card-link">
                Flux RSS :&nbsp;
                <a href={article.feedUrl} target="_blank" rel="noopener noreferrer">
                  {article.feedUrl}
                </a>
              </p>

              <p className="card-date">
                Publié le : {new Date(article.date).toLocaleDateString()}
              </p>

              <p className="card-snippet">{article.snippet}</p>
            </div>
          ))}
        </div>

        {/* Message de bienvenue */}
        <div className="welcome-message">
          <h1>Bienvenue sur <strong>SUPRSS</strong> 👋</h1>
          <p>
            Votre lecteur de flux RSS intelligent et collaboratif.<br />
            Commencez à suivre vos sources préférées, explorez les collections partagées,<br />
            et collaborez avec votre équipe !
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
