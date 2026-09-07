import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const fetchInvoice = async () => {
    try {
      const res = await apiClient.get(`/api/v1/billing/invoices/${id}/`);
      setInvoice(res.data);
      if (res.data.status !== 'PAID') {
        setAmount(res.data.total_amount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Processing payment...');
    try {
      await apiClient.post(`/api/v1/billing/payments/`, {
        invoice_id: id,
        amount,
        currency: invoice.currency || 'USD',
        method: paymentMethod
      });
      toast.success('Payment recorded successfully!', { id: toastId });
      fetchInvoice();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.response?.data?.[0] || 'Payment failed.', { id: toastId });
    }
  };

  if (loading) return <div>Loading invoice...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button onClick={() => navigate('/invoices')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: '0.5rem' }}>&larr; Back to Invoices</button>
          <h1>Invoice {invoice.invoice_number}</h1>
        </div>
        <div>
          <span className={`badge ${
            invoice.status === 'PAID' ? 'badge-success' : 
            invoice.status === 'CANCELLED' ? 'badge-error' : 'badge-primary'
          }`}>
            {invoice.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Invoice Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Total Amount</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>${parseFloat(invoice.total_amount).toFixed(2)}</span>
          </div>
          
          <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Payment History</h4>
          {invoice.payments?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem 0' }}>Date</th>
                  <th style={{ padding: '0.5rem 0' }}>Method</th>
                  <th style={{ padding: '0.5rem 0' }}>Ref</th>
                  <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ padding: '0.5rem 0' }}>{new Date(p.paid_at).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem 0' }}>{p.method}</td>
                    <td style={{ padding: '0.5rem 0', color: 'var(--color-text-muted)' }}>{p.reference}</td>
                    <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: 500 }}>${parseFloat(p.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No payments recorded yet.</p>
          )}
        </div>

        {invoice.status !== 'PAID' && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Record Payment</h3>
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Submit Payment</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
