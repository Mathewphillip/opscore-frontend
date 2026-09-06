import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await apiClient.get(`/api/v1/orders/${id}/`);
      const orderData = res.data;
      
      try {
        const custRes = await apiClient.get(`/api/v1/customers/${orderData.customer}/`);
        orderData.customer_name = custRes.data.name;
      } catch (e) {}

      try {
        const prodRes = await apiClient.get(`/api/v1/catalog/products/`);
        const products = prodRes.data.results || prodRes.data;
        orderData.items = orderData.items.map((item: any) => {
          const prod = products.find((p: any) => p.id === item.product);
          return { ...item, product_name: prod ? prod.name : item.product };
        });
      } catch (e) {}

      setOrder(orderData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    const toastId = toast.loading(`Processing ${action}...`);
    try {
      await apiClient.post(`/api/v1/orders/${id}/${action}/`);
      toast.success(`Order ${action}ed successfully!`, { id: toastId });
      fetchOrder();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.response?.data?.[0] || 'Action failed.', { id: toastId });
    }
  };

  if (loading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '0.5rem' }}>&larr; Back to Orders</button>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Order {order.id.split('-')[0].toUpperCase()}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {order.status === 'DRAFT' && (
            <button className="btn btn-primary" onClick={() => handleAction('confirm')}>Confirm Order</button>
          )}
          {['DRAFT', 'CONFIRMED'].includes(order.status) && (
            <button className="btn" style={{ backgroundColor: 'var(--color-error)', color: 'white' }} onClick={() => handleAction('cancel')}>Cancel Order</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>Order Items</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 0' }}>Product</th>
                <th style={{ padding: '0.5rem 0' }}>Qty</th>
                <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ padding: '0.75rem 0' }}>{item.product_name || item.product}</td>
                  <td style={{ padding: '0.75rem 0' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>${parseFloat(item.unit_price_amount).toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>${(item.quantity * parseFloat(item.unit_price_amount)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600 }}>Total Amount:</td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600, fontSize: '1.25rem' }}>${parseFloat(order.total_amount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Order Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                <span style={{ fontWeight: 600 }}>{order.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Date</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Customer</span>
                <span>{order.customer_name || order.customer}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
