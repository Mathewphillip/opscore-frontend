import { useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [custRes, ordRes, invRes] = await Promise.all([
          apiClient.get('/api/v1/customers/'),
          apiClient.get('/api/v1/orders/'),
          apiClient.get('/api/v1/billing/invoices/')
        ]);
        
        const invoices = invRes.data.results || invRes.data || [];
        const revenue = invoices
          .filter((inv: any) => inv.status === 'PAID')
          .reduce((sum: number, inv: any) => sum + parseFloat(inv.total_amount || 0), 0);

        setStats({
          customers: custRes.data.count || custRes.data.length || 0,
          orders: ordRes.data.count || ordRes.data.length || 0,
          revenue
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Customers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.customers}</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Orders</h3>
          <p style={{ fontSize: '2rem', fontWeight: 600 }}>{stats.orders}</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Revenue (Paid)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 600 }}>${stats.revenue.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
