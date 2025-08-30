import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/articles/public');
        if (Array.isArray(res.data)) {
          setArticles(res.data);
        } else {
          setError('Les articles reçus ne sont pas un tableau');
        }
      } catch (err) {
        console.error('Erreur récupération articles :', err);
        setError('Impossible de charger les articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Container>
      <Grid container spacing={2}>
        {articles.map((article) => (
          <Grid key={article._id || article.link} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{article.title}</Typography>
                <Typography variant="body2">{article.snippet}</Typography>
                <Typography variant="caption">{article.sourceName} - {new Date(article.date || article.publishedAt).toLocaleString()}</Typography>
                <Button
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '10px' }}
                >
                  Voir l'article
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ArticlesPage;
