const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  next();
};

// 1. Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    return res.json({
      token: "demo_admin_jwt_token_12345",
      user: {
        id: "u1",
        name: "Admin User",
        email: email,
        role: "admin",
        company: "Secure A Fence Co",
        phone: "555-0199"
      }
    });
  }
  res.status(400).json({ error: "Invalid credentials" });
});

// 2. Admin Overview Metrics
app.get('/api/admin/overview', authenticateToken, (req, res) => {
  res.json({
    metrics: {
      totalSalesRevenue: 125000.0,
      monthlyRentalRevenue: 34000.0,
      totalPanelsRentedOut: 520,
      panelsInWarehouse: 280,
      totalOrdersCount: 45,
      activeRentalsCount: 22,
      pendingDispatchesCount: 5
    }
  });
});

// 3. Sales / Invoices
app.get('/api/admin/sales', authenticateToken, (req, res) => {
  res.json([
    {
      id: "ORD-101",
      customerId: "CUST-1",
      customerName: "Jane Smith",
      customerCompany: "Apex Construction",
      customerEmail: "jane@apex.com",
      customerPhone: "555-4321",
      orderType: "sale",
      items: [
        {
          productId: "PROD-1",
          name: "Chainlink Fence Panel 6ft",
          unitPrice: 50.0,
          quantity: 20,
          total: 1000.0
        }
      ],
      subtotal: 1000.0,
      deliveryFee: 100.0,
      tax: 80.0,
      totalAmount: 1180.0,
      status: "completed",
      deliveryAddress: "456 Construction Rd",
      jobsiteContact: "Jane (555-4321)",
      deliveryDate: "2026-08-30",
      createdAt: "2026-08-25"
    }
  ]);
});

app.put('/api/admin/sales/:id/status', authenticateToken, (req, res) => {
  res.json({ success: true, message: "Order status updated" });
});

// 4. Rentals
app.get('/api/admin/rentals', authenticateToken, (req, res) => {
  res.json([
    {
      id: "RNT-501",
      orderId: "ORD-101",
      customerId: "CUST-1",
      customerName: "Jane Smith",
      customerCompany: "Apex Construction",
      customerEmail: "jane@apex.com",
      customerPhone: "555-4321",
      jobsiteAddress: "456 Construction Rd",
      jobsiteContact: "Jane",
      startDate: "2026-08-01",
      endDate: "2026-11-01",
      monthlyRateTotal: 600.0,
      status: "active",
      items: [
        {
          productId: "PROD-1",
          name: "Chainlink Fence Panel 6ft",
          quantity: 10,
          monthlyUnitPrice: 60.0,
          subtotal: 600.0
        }
      ],
      notes: "Gate key in lockbox"
    }
  ]);
});

app.put('/api/admin/rentals/:id/checkin', authenticateToken, (req, res) => {
  res.json({ success: true, message: "Rental checked in" });
});

// 5. Shipments / Deliveries
app.get('/api/admin/shipments', authenticateToken, (req, res) => {
  res.json([
    {
      id: "SHP-901",
      orderId: "ORD-101",
      type: "Delivery",
      driverName: "Alex Turner",
      dispatchDate: "2026-08-30",
      status: "scheduled",
      destination: "456 Construction Rd",
      notes: "Deliver before noon"
    }
  ]);
});

app.put('/api/admin/shipments/:id', authenticateToken, (req, res) => {
  res.json({ success: true, message: "Shipment updated" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
