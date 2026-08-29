const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store for simulation
let orders = [
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
];

let rentals = [
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
];

let shipments = [
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
];

let invoices = [];

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
      totalOrdersCount: orders.length,
      activeRentalsCount: rentals.filter(r => r.status === 'active').length,
      pendingDispatchesCount: shipments.filter(s => s.status === 'scheduled').length
    }
  });
});

// 3. Sales / Orders
app.get('/api/admin/sales', authenticateToken, (req, res) => {
  res.json(orders);
});

app.post('/api/admin/sales', authenticateToken, (req, res) => {
  const newOrder = {
    id: "ORD-" + (orders.length + 101),
    ...req.body,
    createdAt: new Date().toISOString().split('T')[0]
  };
  orders.push(newOrder);
  res.status(201).json({ success: true, order: newOrder });
});

app.put('/api/admin/sales/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    return res.json({ success: true, order });
  }
  res.status(404).json({ error: "Order not found" });
});

// 4. Rentals
app.get('/api/admin/rentals', authenticateToken, (req, res) => {
  res.json(rentals);
});

app.put('/api/admin/rentals/:id/checkin', authenticateToken, (req, res) => {
  const { id } = req.params;
  const rental = rentals.find(r => r.id === id);
  if (rental) {
    rental.status = "checked_in";
    return res.json({ success: true, rental });
  }
  res.status(404).json({ error: "Rental not found" });
});

app.put('/api/admin/rentals/:id/extend', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { endDate } = req.body;
  const rental = rentals.find(r => r.id === id);
  if (rental) {
    rental.endDate = endDate;
    return res.json({ success: true, rental });
  }
  res.status(404).json({ error: "Rental not found" });
});

// 5. Shipments / Deliveries & Pickups
app.get('/api/admin/shipments', authenticateToken, (req, res) => {
  res.json(shipments);
});

app.post('/api/admin/shipments/pickup', authenticateToken, (req, res) => {
  const newShipment = {
    id: "SHP-" + (shipments.length + 901),
    type: "Pickup",
    ...req.body,
    status: "scheduled"
  };
  shipments.push(newShipment);
  res.status(201).json({ success: true, shipment: newShipment });
});

app.put('/api/admin/shipments/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const shipment = shipments.find(s => s.id === id);
  if (shipment) {
    Object.assign(shipment, req.body);
    return res.json({ success: true, shipment });
  }
  res.status(404).json({ error: "Shipment not found" });
});

// 6. Invoices
app.get('/api/admin/invoices', authenticateToken, (req, res) => {
  res.json(invoices);
});

app.post('/api/admin/invoices', authenticateToken, (req, res) => {
  const newInvoice = {
    id: "INV-" + (invoices.length + 1001),
    ...req.body,
    createdAt: new Date().toISOString().split('T')[0]
  };
  invoices.push(newInvoice);
  res.status(201).json({ success: true, invoice: newInvoice });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
