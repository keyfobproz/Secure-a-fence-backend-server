const https = require('https');

// Helper function to send push notification via FCM / Webhook or Expo / OneSignal if configured,
// or broadcast to connected admin channels
function notifyNewOrder(orderData) {
  console.log(`[PUSH NOTIFICATION TRIGGER] New Order #${orderData.id} placed by ${orderData.customerName} for $${orderData.totalAmount}`);
  
  // If an ADMIN_WEBHOOK_URL or FCM server key is set in environment variables, dispatch alert
  const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
  if (!webhookUrl) return;

  const data = JSON.stringify({
    title: `New ${orderData.orderType.toUpperCase()} Order #${orderData.id}`,
    body: `${orderData.customerName} ordered $${orderData.totalAmount}. Address: ${orderData.deliveryAddress}`,
    orderId: orderData.id
  });

  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, res => {
    res.on('data', () => {});
  });

  req.on('error', error => {
    console.error('Webhook notification error:', error);
  });

  req.write(data);
  req.end();
}

function notifyNewRental(rentalData) {
  console.log(`[PUSH NOTIFICATION TRIGGER] New Rental #${rentalData.id} started by ${rentalData.customerName} ($${rentalData.monthlyRateTotal}/mo)`);
}

module.exports = {
  notifyNewOrder,
  notifyNewRental
};
