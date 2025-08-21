import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Container, Card, CardContent, TextField,
  Button, CircularProgress, Alert, List, ListItem, ListItemText, Box, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [openCreateCollection, setOpenCreateCollection] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [openMembers, setOpenMembers] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  const [openArticleModal, setOpenArticleModal] = useState(false);
  const [currentArticle, setCurrentArticle] = useState({ title: '', source: '', content: '', keywords: '' });
  const [editingArticle, setEditingArticle] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // --- Fetch collections + articles ---
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/collections', {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.status === 401) { localStorage.removeItem("token"); navigate("/login"); return; }
      const data = await res.json();

      const collectionsWithArticles = await Promise.all(
        data.map(async c => {
          try {
            const resArticles = await fetch(`http://localhost:5000/api/collections/${c._id}/articles`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const articles = resArticles.ok ? await resArticles.json() : [];
            return { ...c, articles, search: "" };
          } catch { return { ...c, articles: [], search: "" }; }
        })
      );
      setCollections(collectionsWithArticles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  // Listen for refresh event
  useEffect(() => {
    const handleRefresh = () => fetchCollections();
    window.addEventListener('refreshCollections', handleRefresh);
    return () => window.removeEventListener('refreshCollections', handleRefresh);
  }, [fetchCollections]);

  const handleSearch = (id, value) => {
    setCollections(prev => prev.map(c => c._id === id ? { ...c, search: value } : c));
  };

  // --- CRUD Collections ---
  // --- CRUD Collections ---
  const createCollection = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/collections', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(newCollection)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Impossible de créer la collection');
      }

      const createdCollection = await res.json();

      setCollections(prev => [...prev, { ...createdCollection, articles: [], search: "" }]);
      setOpenCreateCollection(false);
      setNewCollection({ name: '', description: '' });

    } catch (err) {
      alert(err.message);
    }
  };


  const deleteCollection = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette collection ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Impossible de supprimer la collection');
      }

      // Mise à jour directe de l'état pour enlever la collection supprimée
      setCollections(prev => prev.filter(c => c._id !== id));

    } catch (err) {
      alert(err.message);
    }
  };


  // --- Gestion Membres ---
  const addMember = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/collections/add-member', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: selectedCollection._id, email: memberEmail })
      });
      if (!res.ok) throw new Error('Impossible d\'ajouter le membre');
      setMemberEmail('');
      setOpenMembers(false);
      window.dispatchEvent(new Event('refreshCollections'));
    } catch (err) { alert(err.message); }
  };

  const removeMember = async (email) => {
    try {
      const res = await fetch('http://localhost:5000/api/collections/remove-member', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: selectedCollection._id, email })
      });
      if (!res.ok) throw new Error('Impossible de supprimer le membre');
      window.dispatchEvent(new Event('refreshCollections'));
    } catch (err) { alert(err.message); }
  };

  // --- CRUD Articles ---
  const openArticleForm = (collection, article = null) => {
    setSelectedCollection(collection);
    if (article) {
      setEditingArticle(article);
      setCurrentArticle({ title: article.title, source: article.source, content: article.content, keywords: article.keywords.join(', ') });
    } else {
      setEditingArticle(null);
      setCurrentArticle({ title: '', source: '', content: '', keywords: '' });
    }
    setOpenArticleModal(true);
  };

  const saveArticle = async () => {
    try {
      const body = {
        ...currentArticle,
        keywords: currentArticle.keywords.split(',').map(k => k.trim())
      };
      let url = `http://localhost:5000/api/collections/${selectedCollection._id}/articles`;
      let method = 'POST';
      if (editingArticle) {
        url = `http://localhost:5000/api/articles/${editingArticle._id}`;
        method = 'PUT';
      }
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Impossible de sauvegarder l\'article');
      setOpenArticleModal(false);
      window.dispatchEvent(new Event('refreshCollections'));
    } catch (err) { alert(err.message); }
  };

  const deleteArticle = async (articleId) => {
    if (!window.confirm("Supprimer cet article ?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/articles/${articleId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Impossible de supprimer');
      window.dispatchEvent(new Event('refreshCollections'));
    } catch (err) { alert(err.message); }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Container maxWidth="md"><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>📚 Collections</Typography>
          <Button color="inherit" onClick={() => setOpenCreateCollection(true)}>+ Nouvelle</Button>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3}>
        {collections.map(c => {
          const filteredArticles = c.articles.filter(a => {
            const query = c.search.toLowerCase();
            return (
              a.title?.toLowerCase().includes(query) ||
              a.source?.toLowerCase().includes(query) ||
              a.keywords?.some(k => k.toLowerCase().includes(query)) ||
              a.content?.toLowerCase().includes(query)
            );
          });

          return (
            <Grid item xs={12} md={6} key={c._id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{c.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{c.description}</Typography>

                  <TextField
                    label="🔍 Rechercher..."
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="normal"
                    value={c.search} onChange={e => handleSearch(c._id, e.target.value)}
                  />

                  {filteredArticles.length === 0 ? (
                    <Alert severity="warning">Aucun article trouvé.</Alert>
                  ) : (
                    <List>
                      {filteredArticles.map(a => (
                        <ListItem key={a._id} alignItems="flex-start" secondaryAction={
                          <>
                            <Button size="small" onClick={() => openArticleForm(c, a)}>Modifier</Button>
                            <Button size="small" color="error" onClick={() => deleteArticle(a._id)}>Supprimer</Button>
                          </>
                        }>
                          <ListItemText primary={a.title} secondary={`${a.source} — ${a.content?.substring(0, 120)}...`} />
                        </ListItem>
                      ))}
                    </List>
                  )}

                  <Box mt={2} display="flex" justifyContent="space-between" gap={1}>
                    <Button variant="outlined" onClick={() => { setSelectedCollection(c); setOpenMembers(true); }}>Membres</Button>
                    <Button variant="contained" onClick={() => openArticleForm(c)}>Ajouter Article</Button>
                    <Button variant="contained" color="error" onClick={() => deleteCollection(c._id)}>Supprimer</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* --- Modal Création Collection --- */}
      <Dialog open={openCreateCollection} onClose={() => setOpenCreateCollection(false)}>
        <DialogTitle>Nouvelle Collection</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Nom" fullWidth value={newCollection.name} onChange={e => setNewCollection(prev => ({ ...prev, name: e.target.value }))} />
          <TextField margin="normal" label="Description" fullWidth value={newCollection.description} onChange={e => setNewCollection(prev => ({ ...prev, description: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateCollection(false)}>Annuler</Button>
          <Button onClick={createCollection}>Créer</Button>
        </DialogActions>
      </Dialog>

      {/* --- Modal Membres --- */}
      <Dialog open={openMembers} onClose={() => setOpenMembers(false)}>
        <DialogTitle>Membres de {selectedCollection?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="normal" label="Email"
            fullWidth value={memberEmail} onChange={e => setMemberEmail(e.target.value)}
          />
          <Button variant="contained" sx={{ mt: 1 }} onClick={addMember}>Ajouter</Button>
          <List>
            {selectedCollection?.members?.map(m => (
              <ListItem key={m.email} secondaryAction={<Button color="error" onClick={() => removeMember(m.email)}>Supprimer</Button>}>
                <ListItemText primary={m.email} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMembers(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* --- Modal Article --- */}
      <Dialog open={openArticleModal} onClose={() => setOpenArticleModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingArticle ? 'Modifier Article' : 'Nouvel Article'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="normal" label="Titre" fullWidth value={currentArticle.title} onChange={e => setCurrentArticle(prev => ({ ...prev, title: e.target.value }))} />
          <TextField margin="normal" label="Source" fullWidth value={currentArticle.source} onChange={e => setCurrentArticle(prev => ({ ...prev, source: e.target.value }))} />
          <TextField margin="normal" label="Contenu" fullWidth multiline rows={4} value={currentArticle.content} onChange={e => setCurrentArticle(prev => ({ ...prev, content: e.target.value }))} />
          <TextField margin="normal" label="Mots-clés (séparés par ,)" fullWidth value={currentArticle.keywords} onChange={e => setCurrentArticle(prev => ({ ...prev, keywords: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenArticleModal(false)}>Annuler</Button>
          <Button onClick={saveArticle}>{editingArticle ? 'Sauvegarder' : 'Créer'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
