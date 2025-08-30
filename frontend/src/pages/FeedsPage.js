import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, AppBar, Toolbar, Typography, Button, Card, CardContent,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Box, Chip, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip
} from "@mui/material";
import { Add, Delete, RssFeed } from "@mui/icons-material";

export default function FeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [newFeed, setNewFeed] = useState({
    name: "", //title
    url: "",
    description: "",
    categories: "",
    updateFrequency: "daily",
    status: "active",
    collectionId: ""
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/feeds", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setFeeds(data);
      else console.error("Les feeds reçus ne sont pas un tableau :", data);
    } catch (err) {
      console.error("Erreur fetch feeds:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchFeeds(); }, [fetchFeeds]);

  // Fonction pour récupérer les articles d'un flux (ajustée)
  const fetchArticles = async (feedId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/articles/feed/${feedId}/articles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Assure-toi que le token est passé ici
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des articles");
      }

      const articles = await response.json();
      console.log(articles); // Vérifie si les articles sont récupérés correctement

      // Naviguer vers la page des articles si nécessaire
      navigate(`/feeds/${feedId}/articles`, { state: { articles } });
    } catch (err) {
      console.error("Erreur lors de la récupération des articles:", err);
    }
  };

  const createFeed = async () => {
    try {
      const payload = {
        ...newFeed,
        categories: newFeed.categories
          ? newFeed.categories.split(",").map(c => c.trim()).filter(Boolean)
          : []
      };
      const res = await fetch("http://localhost:5000/api/feeds", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Impossible de créer le flux");
      const created = await res.json();
      setFeeds(prev => [...prev, created]);
      setOpenCreate(false);
      setNewFeed({
        name: "", //title 
        url: "",
        description: "",
        categories: "",
        updateFrequency: "daily",
        status: "active",
        collectionId: ""
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteFeed = async (id) => {
    if (!window.confirm("Supprimer ce flux ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/feeds/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur suppression");
      setFeeds(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <RssFeed sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Flux RSS</Typography>
          <Button color="inherit" startIcon={<Add />} onClick={() => setOpenCreate(true)}>
            Ajouter un flux
          </Button>
        </Toolbar>
      </AppBar>

      {loading ? (
        <p>Chargement...</p>
      ) : feeds.length === 0 ? (
        <Alert severity="info">Aucun flux pour le moment</Alert>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "stretch" }}>
          {feeds.map(f => (
            <Card key={f._id} sx={{ width: { xs: "100%", sm: "calc(50% - 12px)", lg: "calc(33.333% - 16px)" }, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.url}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{f.description}</Typography>

                <Box sx={{ mt: 1 }}>
                  {f.categories?.map((cat, idx) => (
                    <Chip key={`${f._id}-cat-${idx}`} label={cat} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>

                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Fréquence : {f.updateFrequency} | Statut : {f.status}
                </Typography>

                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => fetchArticles(f._id)} // Appelle fetchArticles avec l'ID du flux
                  >
                    Articles
                  </Button>
                  <Tooltip title="Supprimer">
                    <IconButton color="error" onClick={() => deleteFeed(f._id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>➕ Nouveau Flux RSS</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="normal" label="Nom du flux" fullWidth required
            value={newFeed.title}
            onChange={e => setNewFeed({ ...newFeed, title: e.target.value })}
          />
          <TextField
            margin="normal" label="URL RSS" fullWidth required
            value={newFeed.url}
            onChange={e => setNewFeed({ ...newFeed, url: e.target.value })}
          />
          <TextField
            margin="normal" label="Description" fullWidth multiline rows={2}
            value={newFeed.description}
            onChange={e => setNewFeed({ ...newFeed, description: e.target.value })}
          />
          <TextField
            margin="normal" label="Catégories (séparées par ,)" fullWidth
            value={newFeed.categories}
            onChange={e => setNewFeed({ ...newFeed, categories: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Fréquence</InputLabel>
            <Select
              value={newFeed.updateFrequency}
              label="Fréquence"
              onChange={e => setNewFeed({ ...newFeed, updateFrequency: e.target.value })}
            >
              <MenuItem value="hourly">Toutes les heures</MenuItem>
              <MenuItem value="6h">Toutes les 6 heures</MenuItem>
              <MenuItem value="daily">Quotidien</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Statut</InputLabel>
            <Select
              value={newFeed.status}
              label="Statut"
              onChange={e => setNewFeed({ ...newFeed, status: e.target.value })}
            >
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Annuler</Button>
          <Button variant="contained" onClick={createFeed}>Créer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
