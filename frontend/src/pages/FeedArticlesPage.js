import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Card, CardContent, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, Box,
  Pagination, Grid, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { ArrowBack, CheckCircle, CheckCircleOutline, Star, StarBorder } from '@mui/icons-material';

const FeedArticlesPage = () => {
  const { feedId } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [favoriteFilter, setFavoriteFilter] = useState('');
  const [page, setPage] = useState(1);
  const articlesPerPage = 6;
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [availableCollections, setAvailableCollections] = useState([]);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/articles/feed/${feedId}/articles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur récupération articles');
        setArticles(data);
        setFiltered(data);
      } catch (err) {
        console.error('Erreur lors du fetch des articles:', err);
        setArticles([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [feedId, token]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/collections', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setAvailableCollections(data);
      } catch (err) {
        console.error("Erreur chargement collections:", err);
      }
    };
    fetchCollections();
  }, [token]);

  const allCategories = Array.from(new Set(articles.flatMap((a) => a.categories || [])));

  useEffect(() => {
    let result = articles;
    if (categoryFilter) {
      result = result.filter((a) => a.categories?.includes(categoryFilter));
    }
    if (readFilter) {
      result = result.filter((a) => a.isRead === (readFilter === 'read'));
    }
    if (favoriteFilter) {
      result = result.filter((a) => (a.favoritedBy || []).includes(userId) === (favoriteFilter === 'favorite'));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.title?.toLowerCase().includes(q) ||
          a.snippet?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q) ||
          a.sourceName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setPage(1);
  }, [categoryFilter, searchQuery, readFilter, favoriteFilter, articles, userId]);

  const paginatedArticles = filtered.slice((page - 1) * articlesPerPage, page * articlesPerPage);

  const toggleReadStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/articles/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      setArticles((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: newStatus } : a))
      );
    } catch (err) {
      console.error('Erreur mise à jour isRead', err);
    }
  };

  const toggleFavorite = async (articleId) => {
    try {
      await fetch(`http://localhost:5000/api/articles/${articleId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      setArticles(prev =>
        prev.map(article => {
          if (article._id !== articleId) return article;
          const isFav = (article.favoritedBy || []).includes(userId);
          const newFavList = isFav
            ? article.favoritedBy.filter(uid => uid !== userId)
            : [...(article.favoritedBy || []), userId];
          return { ...article, favoritedBy: newFavList };
        })
      );
    } catch (err) {
      console.error('Erreur lors de la mise à jour du favori:', err);
    }
  };

  const openCollectionDialog = (articleId) => {
    setSelectedArticleId(articleId);
    setShowCollectionDialog(true);
  };

  const confirmAddToCollection = async () => {
    if (!selectedCollectionId) {
      alert("Veuillez sélectionner une collection !");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${selectedCollectionId}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId: selectedArticleId })
      });

      if (res.ok) {
        alert("Ajouté à la collection !");
        setShowCollectionDialog(false);
        setSelectedArticleId(null);
        setSelectedCollectionId('');
      } else {
        alert("Erreur lors de l’ajout.");
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };


  return (
    <Container sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/feeds')}>Revenir aux flux</Button>
      <Typography variant="h4" gutterBottom>Articles du flux</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Recherche"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <FormControl>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={categoryFilter}
            label="Catégorie"
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Toutes</MenuItem>
            {allCategories.map((cat, i) => (
              <MenuItem key={i} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Lu ?</InputLabel>
          <Select
            value={readFilter}
            label="Lu ?"
            onChange={(e) => setReadFilter(e.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="read">Lu</MenuItem>
            <MenuItem value="unread">Non lu</MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Favori ?</InputLabel>
          <Select
            value={favoriteFilter}
            label="Favori ?"
            onChange={(e) => setFavoriteFilter(e.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="favorite">Favoris</MenuItem>
            <MenuItem value="non-favorite">Non favoris</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Chargement...</Typography>
      ) : filtered.length === 0 ? (
        <Typography>Aucun article trouvé.</Typography>
      ) : (
        <Grid container spacing={2}>
          {paginatedArticles.map((article) => (
            <Grid item xs={12} md={6} key={article._id}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{article.title}</Typography>
                    <Box>
                      <Tooltip title={article.favoritedBy?.includes(userId) ? "Retirer des favoris" : "Ajouter aux favoris"}>
                        <IconButton onClick={() => toggleFavorite(article._id)}>
                          {article.favoritedBy?.includes(userId)
                            ? <Star color="warning" />
                            : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={article.isRead ? "Marquer comme non lu" : "Marquer comme lu"}>
                        <IconButton onClick={() => toggleReadStatus(article._id, !article.isRead)}>
                          {article.isRead ? <CheckCircle color="success" /> : <CheckCircleOutline />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {article.date ? new Date(article.date).toLocaleDateString() : 'Date inconnue'}
                    {' • '}{article.author || 'Auteur inconnu'}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>{article.snippet || article.content?.slice(0, 150)}...</Typography>

                  <Box sx={{ mt: 2 }}>
                    {article.categories?.map((cat, i) => (
                      <Chip key={i} label={cat} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 2 }}
                  >
                    Lire l'article original
                  </Button>
                  <Button onClick={() => openCollectionDialog(article._id)}>
                    📥 Ajouter à une collection
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={4} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(filtered.length / articlesPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
        />
      </Box>

      <Dialog open={showCollectionDialog} onClose={() => setShowCollectionDialog(false)}>
        <DialogTitle>Sélectionner une collection</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Collection</InputLabel>
            <Select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              label="Collection"
            >
              {availableCollections.map((col) => (
                <MenuItem key={col._id} value={col._id}>{col.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCollectionDialog(false)}>Annuler</Button>
          <Button onClick={confirmAddToCollection} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FeedArticlesPage;
