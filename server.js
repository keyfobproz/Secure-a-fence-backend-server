const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = 'https://mzpjfssmrstrogbjzgry.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2Td3u23a7SwawMK-q2dsnw_S-8BYjS1';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  next();
};

// 1. Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (data && password === 'password123') {
    return res.json({ token: "demo_token", user: data });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// 2. Overview
app.get('/api/admin/overview', authenticateToken, async (req, res) => {
  const { data: orders } = await supabase.from('orders').select('*');
  const { data: rentals } = await supabase.from('rentals').select('*');
  const { data: shipments } = await supabase.from('shipments').select('*');
  
  res.json({
    metrics: {
      totalSalesRevenue: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      monthlyRentalRevenue: rentals.reduce((sum, r) => sum + Number(r.monthlyRateTotal), 0),
      totalPanelsRentedOut: rentals.reduce((sum, r) => sum + r.items.reduce((acc, item) => acc + item.quantity, 0), 0),
      panelsInWarehouse: 280,
      totalOrdersCount: orders.length,
      activeRentalsCount: rentals.filter(r => r.status === 'Active').length,
      pendingDispatchesCount: shipments.filter(s => s.status !== 'Delivered').length
    }
  });
});

// 3. Sales / Orders
app.get('/api/admin/sales', authenticateToken, async (req, res) => {
  const { data } = await supabase.from('orders').select('*');
  res.json(data);
});

app.post('/api/admin/sales', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('orders').insert([req.body]);
  res.status(201).json({ success: !error, order: data });
});

app.put('/api/admin/sales/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', req.params.id);
  res.json({ success: !error, order: data });
});

app.put('/api/admin/sales/:id/payment', authenticateToken, async (req, res) => {
  const { paymentStatus, paymentMethod } = req.body;
  const { data, error } = await supabase.from('orders').update({ paymentStatus, paymentMethod }).eq('id', req.params.id);
  res.json({ success: !error, order: data });
});

// 4. Rentals
app.get('/api/admin/rentals', authenticateToken, async (req, res) => {
  const { data } = await supabase.from('rentals').select('*');
  res.json(data);
});

app.put('/api/admin/rentals/:id/extend', authenticateToken, async (req, res) => {
  const { endDate } = req.body;
  const { data, error } = await supabase.from('rentals').update({ endDate }).eq('id', req.params.id);
  res.json({ success: !error, rental: data });
});

// 5. Shipments
app.get('/api/admin/shipments', authenticateToken, async (req, res) => {
  const { data } = await supabase.from('shipments').select('*');
  res.json(data);
});

// 6. Invoices
app.get('/api/admin/invoices', authenticateToken, async (req, res) => {
  const { data } = await supabase.from('invoices').select('*');
  res.json(data);
});

app.post('/api/admin/invoices', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('invoices').insert([req.body]);
  res.status(201).json({ success: !error, invoice: data });
});

// 7. Customers
app.get('/api/admin/customers', authenticateToken, async (req, res) => {
  const { data } = await supabase.from('users').select('*').eq('role', 'customer');
  res.json(data);
});

app.post('/api/admin/customers', authenticateToken, async (req, res) => {
  const { data, error } = await supabase.from('users').insert([req.body]);
  res.status(201).json({ success: !error, customer: data });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Supabase backend running on port ${PORT}`));
