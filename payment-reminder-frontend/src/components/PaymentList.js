import React, { useState } from 'react';
import { paymentAPI } from '../services/api';
import './PaymentList.css';

const PaymentList = ({ payments, onPaymentUpdated, onPaymentDeleted }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (id) => {
    if (!selectedStatus) return;

    setLoading(true);
    setError('');
    try {
      const response = await paymentAPI.updatePaymentStatus(id, selectedStatus);
      onPaymentUpdated(response.data.data);
      setSelectedPayment(null);
      setSelectedStatus('');
    } catch (err) {
      setError('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      await paymentAPI.deletePayment(id);
      onPaymentDeleted(id);
    } catch (err) {
      setError('Failed to delete payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-list">
      <h3>Payments</h3>
      {error && <div className="error-message">{error}</div>}
      <ul>
        {payments.map((payment) => (
          <li key={payment._id} className="payment-item">
            <div className="payment-details">
              <div className="payment-name">{payment.paymentName}</div>
              <div className="payment-info">
                <span>Amount: ${payment.amount.toFixed(2)}</span>
                <span>Status: {payment.status}</span>
                <span>Due: {new Date(payment.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            {selectedPayment === payment._id ? (
              <div className="payment-actions">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => handleStatusChange(payment._id)}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => setSelectedPayment(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedPayment(payment._id)}
              >
                Change Status
              </button>
            )}
            <button
              onClick={() => handleDelete(payment._id)}
              disabled={loading}
              className="delete-button"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentList;

