import React, { useState } from 'react';
import api from '../api';

export default function AddFeedPage() {
  const [url, setUrl] = useState('');
  const [collectionId, setCollectionId] = useState('');
  async function add() {
    // backend /feeds POST { url, title?, collectionId, frequency }
    const feed = await api.post('/feeds', { url, collectionId });
    // ensuite ajouter le feed._id dans collection (controller collection)
    await api.post(`/collections/${collectionId}/feeds`, { feedId: feed.data._id });
    alert('Flux ajouté');
  }
  return (
    <div>
      <h2>Ajouter un flux</h2>
      <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL RSS" />
      <input value={collectionId} onChange={e=>setCollectionId(e.target.value)} placeholder="ID collection" />
      <button onClick={add}>Ajouter</button>
    </div>
  );
}
