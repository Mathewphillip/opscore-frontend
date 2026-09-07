import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await apiClient.get('/api/v1/billing/invoices/');
        setInvoices(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Invoices</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
            <tr>
              <th style={{ padding: '1rem' }}>Invoice #</th>
              <th style={{ padding: '1rem' }}>Order #</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Total</th>
              <th style={{ padding: '1rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{inv.invoice_number}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{inv.order.split('-')[0].toUpperCase()}</td>
                <td style={{ padding: '1rem' }}>{new Date(inv.issued_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${
                    inv.status === 'PAID' ? 'badge-success' : 
                    inv.status === 'CANCELLED' ? 'badge-error' : 'badge-primary'
                  }`}>
                    {inv.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>${parseFloat(inv.total_amount).toFixed(2)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link to={`/invoices/${inv.id}`} style={{ fontWeight: 600 }}>View & Pay</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
