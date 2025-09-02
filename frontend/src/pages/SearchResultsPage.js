import React, { useState, useEffect } from 'react';
import {
  Container, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Card, CardContent, Typography, Chip, Box, IconButton, Button
} from '@mui/material';
import {
  Star, StarBorder,
  CheckCircle, CheckCircleOutline
} from '@mui/icons-material';

const SearchResultsPage = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [isFavorite, setIsFavorite] = useState('');
  const [isRead, setIsRead] = useState('');
  const [articles, setArticles] = useState([]);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const fetchArticles = async () => {
    const params = new URLSearchParams();
    if (searchText) params.append('q', searchText);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedSource) params.append('source', selectedSource);
    if (isFavorite) params.append('isFavorite', isFavorite);
    if (isRead) params.append('isRead', isRead);

    try {
      const res = await fetch(`http://localhost:5000/api/articles/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error('Erreur lors de la recherche :', err);
    }
  };

  // ⚠️ Pas besoin de mettre fetchArticles dans les dépendances
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedCategory, selectedSource, isFavorite, isRead]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>🔍 Recherche d'articles</Typography>

      {/* Filtres */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField
          label="Recherche texte"
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select value={selectedCategory} label="Catégorie" onChange={(e) => setSelectedCategory(e.target.value)}>
            <MenuItem value="">Toutes</MenuItem>
            <MenuItem value="tech">Tech</MenuItem>
            <MenuItem value="news">News</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Source</InputLabel>
          <Select value={selectedSource} label="Source" onChange={(e) => setSelectedSource(e.target.value)}>
            <MenuItem value="">Toutes</MenuItem>
            <MenuItem value="Le Monde">Le Monde</MenuItem>
            <MenuItem value="France24">France24</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Favori ?</InputLabel>
          <Select value={isFavorite} label="Favori ?" onChange={(e) => setIsFavorite(e.target.value)}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">Favoris</MenuItem>
            <MenuItem value="false">Non Favoris</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Lu ?</InputLabel>
          <Select value={isRead} label="Lu ?" onChange={(e) => setIsRead(e.target.value)}>
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">Lu</MenuItem>
            <MenuItem value="false">Non lu</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Résultats */}
      <Grid container spacing={2}>
        {articles.map((article) => (
          <Grid item xs={12} md={6} key={article._id}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{article.title}</Typography>
                  <Box>
                    <IconButton>
                      {(article.favoritedBy || []).includes(userId)
                        ? <Star color="warning" />
                        : <StarBorder />}
                    </IconButton>
                    <IconButton>
                      {article.isRead
                        ? <CheckCircle color="success" />
                        : <CheckCircleOutline />}
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="caption">{article.sourceName}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{article.snippet}</Typography>
                <Box sx={{ mt: 2 }}>
                  {article.categories?.map((cat, i) => (
                    <Chip key={i} label={cat} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Box>
                <Button
                  href={article.link}
                  target="_blank"
                  rel="noopener"
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Lire l'article
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SearchResultsPage;
