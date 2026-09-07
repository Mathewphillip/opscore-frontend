import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: string;
  created_at: string;
  customer_name?: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/api/v1/orders/');
        setOrders(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1>Orders</h1>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Order #</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
              <th style={{ padding: '1rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, fontFamily: 'monospace' }}>{o.id.split('-')[0].toUpperCase()}</td>
                <td style={{ padding: '0.75rem 1rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${
                    o.status === 'COMPLETED' || o.status === 'CONFIRMED' ? 'badge-success' : 
                    o.status === 'CANCELLED' ? 'badge-error' : 'badge-primary'
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>${parseFloat(o.total_amount).toFixed(2)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link to={`/orders/${o.id}`} style={{ fontWeight: 600 }}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
