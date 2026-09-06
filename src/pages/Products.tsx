import { useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';

interface Product {
  id: string;
  name: string;
  sku: string;
  price_amount: string;
  current_stock: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/api/v1/catalog/products/');
        setProducts(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Products & Inventory</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '1rem' }}>SKU</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Current Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{p.sku}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{p.name}</td>
                <td style={{ padding: '0.75rem 1rem' }}>${parseFloat(p.price_amount).toFixed(2)}</td>
                <td style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: p.current_stock > 0 ? 'var(--color-success)' : 'var(--color-error)'
                }}>
                  {p.current_stock !== undefined ? p.current_stock : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
