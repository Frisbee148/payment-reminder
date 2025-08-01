import React, { useState } from 'react';
import { paymentAPI } from '../services/api';
import './PaymentForm.css';

const PaymentForm = ({ onPaymentAdded, onClose }) => {
  const [formData, setFormData] = useState({
    paymentName: '',
    description: '',
    amount: '',
    category: 'other',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await paymentAPI.createPayment({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      onPaymentAdded(response.data.data);
      setFormData({
        paymentName: '',
        description: '',
        amount: '',
        category: 'other',
        deadline: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form">
        <h3>Add New Payment</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="paymentName">Payment Name*</label>
            <input
              type="text"
              id="paymentName"
              name="paymentName"
              value={formData.paymentName}
              onChange={handleInputChange}
              required
              placeholder="e.g., Electricity Bill"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount*</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category*</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="bills">Bills</option>
                <option value="subscription">Subscription</option>
                <option value="loan">Loan</option>
                <option value="tax">Tax</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Deadline*</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
