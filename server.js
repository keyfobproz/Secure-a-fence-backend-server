const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store for simulation
let customers = [
  {
    id: "cust-1",
    name: "John Builder",
    email: "john@apexconstruction.com",
    role: "customer",
    company: "Apex Construction Services",
    phone: "(555) 234-5678"
  }
];

let orders = [
  {
    id: "ORD-101",
    customerId: "cust-1",
    customerName: "John Builder",
    customerCompany: "Apex Construction Services",
    customerEmail: "john@apexconstruction.com",
    customerPhone: "(555) 234-5678",
    orderType: "sale",
    items: [
      {
        productId: "prod-panel-6x12",
        name: "Refurbished Temporary Fence Panel (6' x 12')",
        unitPrice: 65.0,
        quantity: 20,
        total: 1300.0
      }
    ],
    subtotal: 1300.0,
    deliveryFee: 150.0,
    tax: 104.0,
    totalAmount: 1554.0,
    status: "pending",
    deliveryAddress: "742 Evergreen Terrace, Jobsite Alpha",
    deliveryDate: "2026-09-10",
    createdAt: "2026-08-29"
  }
];

let rentals = [
  {
    id: "RNT-501",
    orderId: "ORD-101",
    customerId: "cust-1",
    customerName: "John Builder",
    customerCompany: "Apex Construction Services",
    customerEmail: "john@apexconstruction.com",
    customerPhone: "(555) 234-5678",
    jobsiteAddress: "123 Construction Rd",
    jobsiteContact: "John Builder",
    startDate: "2026-08-01",
    endDate: "2026-11-01",
    monthlyRateTotal: 600.0,
    status: "active",
    items: [
      {
        productId: "prod-panel-6x12",
        name: "Refurbished Temporary Fence Panel (6' x 12')",
        quantity: 10,
        monthlyUnitPrice: 15.0,
        subtotal: 150.0
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
    destination: "742 Evergreen Terrace, Jobsite Alpha",
    notes: "Deliver before noon"
  }
];

let invoices = [];

// Auth Middleware
const authenticateToken = (req, res, next) => {
  console.log("Request URL:", req.url);
  console.log("Auth Header:", req.headers["authorization"]);
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

// 7. Customers / Logins Creation
app.get('/api/admin/customers', authenticateToken, (req, res) => {
  res.json(customers);
});

app.post('/api/admin/customers', authenticateToken, (req, res) => {
  const newCustomer = {
    id: "cust-" + (customers.length + 101),
    ...req.body,
    role: "customer"
  };
  customers.push(newCustomer);
  res.status(201).json({ success: true, customer: newCustomer });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
