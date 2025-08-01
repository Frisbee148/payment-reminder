import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI } from '../services/api';
import PaymentForm from './PaymentForm';
import PaymentList from './PaymentList';
import './Dashboard.css';

const Dashboard = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments based on search term, status, and category
  useEffect(() => {
    let filtered = payments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.paymentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(payment => payment.category === categoryFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter, categoryFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPayments();
      setPayments(response.data.data);
    } catch (err) {
      setError('Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAdded = (newPayment) => {
    setPayments([...payments, newPayment]);
    setShowForm(false);
  };

  const handlePaymentUpdated = (updatedPayment) => {
    setPayments(payments.map(p => 
      p._id === updatedPayment._id ? updatedPayment : p
    ));
  };

  const handlePaymentDeleted = (paymentId) => {
    setPayments(payments.filter(p => p._id !== paymentId));
  };

  const getPaymentStats = () => {
    const pending = payments.filter(p => p.status === 'pending').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const totalAmount = payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);

    return { pending, overdue, paid, totalAmount };
  };

  const stats = getPaymentStats();

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Payment Reminder Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card pending">
            <h3>Pending Payments</h3>
            <div className="stat-number">{stats.pending}</div>
          </div>
          <div className="stat-card overdue">
            <h3>Overdue Payments</h3>
            <div className="stat-number">{stats.overdue}</div>
          </div>
          <div className="stat-card paid">
            <h3>Paid Payments</h3>
            <div className="stat-number">{stats.paid}</div>
          </div>
          <div className="stat-card total">
            <h3>Total Outstanding</h3>
            <div className="stat-number">${stats.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="actions-section">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="add-payment-button"
          >
            {showForm ? 'Cancel' : 'Add New Payment'}
          </button>
          <button onClick={fetchPayments} className="refresh-button">
            Refresh
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <PaymentForm 
            onPaymentAdded={handlePaymentAdded}
            onClose={() => setShowForm(false)}
          />
        )}

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="bills">Bills</option>
              <option value="subscription">Subscription</option>
              <option value="loan">Loan</option>
              <option value="tax">Tax</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <PaymentList 
          payments={filteredPayments}
          onPaymentUpdated={handlePaymentUpdated}
          onPaymentDeleted={handlePaymentDeleted}
        />
      </main>
    </div>
  );
};

export default Dashboard;
