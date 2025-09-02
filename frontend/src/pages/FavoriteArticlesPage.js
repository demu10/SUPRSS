import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button, Box, Chip, IconButton, Tooltip
} from '@mui/material';
import { Star } from '@mui/icons-material';

const FavoriteArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const token = localStorage.getItem('token');

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/articles/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur de l'API :", data?.error || 'Erreur inconnue');
        setArticles([]);
      } else if (Array.isArray(data)) {
        setArticles(data);
      } else {
        console.warn("Réponse inattendue:", data);
        setArticles([]);
      }
    } catch (err) {
      console.error('Erreur fetch favoris:', err);
      setArticles([]);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (articleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${articleId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchFavorites();
      }
    } catch (err) {
      console.error("Erreur lors du retrait des favoris:", err);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>⭐ Articles Favoris</Typography>

      {articles.length === 0 ? (
        <Typography variant="body1">Aucun article favori trouvé.</Typography>
      ) : (
        <Grid container spacing={2}>
          {articles.map((a) => (
            <Grid item xs={12} md={6} key={a._id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6">{a.title}</Typography>
                    <Tooltip title="Retirer des favoris">
                      <IconButton onClick={() => toggleFavorite(a._id)}>
                        <Star sx={{ color: 'gold' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {a.date ? new Date(a.date).toLocaleDateString() : 'Date inconnue'} • {a.author || 'Auteur inconnu'}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {a.snippet || a.content?.slice(0, 150)}...
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    {a.categories?.map((cat, i) => (
                      <Chip key={i} label={cat} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </Box>

                  <Box mt={2}>
                    <Button
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                    >
                      Lire l'article
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoriteArticlesPage;
