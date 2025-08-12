import React, { useEffect, useState } from 'react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/collections')
      .then(res => {
        if (!res.ok) throw new Error('Erreur réseau');
        return res.json();
      })
      .then(data => {
        setCollections(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Erreur lors du chargement des collections');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>📚 Collections</h1>
      {collections.length === 0 && <p>Aucune collection disponible.</p>}
      <ul>
        {collections.map(c => (
          <li key={c._id}>
            <h3>{c.name}</h3>
            <p>{c.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
