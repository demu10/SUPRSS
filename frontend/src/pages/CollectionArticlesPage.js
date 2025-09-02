// Nouvelle page : Voir les articles d'une collection
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, List, ListItem, ListItemText,
  Button, CircularProgress, Alert, AppBar, Toolbar, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CollectionArticlesPage() {
  const { id } = useParams(); // ID de la collection
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/collections/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erreur récupération collection");
        const data = await res.json();

        const articlesRes = await fetch(`http://localhost:5000/api/collections/${id}/articles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const articles = articlesRes.ok ? await articlesRes.json() : [];

        setCollection({ ...data, articles });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, [id, token]);

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm("Supprimer cet article de la collection ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${id}/articles/${articleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur suppression article");
      setCollection(prev => ({ ...prev, articles: prev.articles.filter(a => a._id !== articleId) }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Container><Alert severity="error">{error}</Alert></Container>;
  if (!collection) return null;

  return (
    <Container>
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{collection.name}</Typography>
        </Toolbar>
      </AppBar>

      {collection.articles.length === 0 ? (
        <Alert severity="info">Aucun article pour cette collection.</Alert>
      ) : (
        <List>
          {collection.articles.map(article => (
            <ListItem key={article._id} alignItems="flex-start" divider>
              <ListItemText
                primary={article.title}
                secondary={
                  <Typography component="span" variant="body2" color="text.secondary">
                    {article.content}
                  </Typography>
                }
              />
              <Box display="flex" flexDirection="column" gap={1}>
                <Button size="small" onClick={() => window.open(article.link, '_blank')}>Lire</Button>
                <Button size="small" color="error" onClick={() => handleDeleteArticle(article._id)}>Supprimer</Button>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
