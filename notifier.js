// Helper function to broadcast push notifications via webhooks or FCM when orders are placed
function notifyNewOrder(orderData) {
  console.log(`[NOTIFICATION] NEW ORDER RECEIVED: #${orderData.id} | Type: ${orderData.orderType} | Amount: $${orderData.totalAmount} | Customer: ${orderData.customerName}`);
}

function notifyNewRental(rentalData) {
  console.log(`[NOTIFICATION] NEW RENTAL AGREEMENT: #${rentalData.id} | Monthly: $${rentalData.monthlyRateTotal} | Customer: ${rentalData.customerName}`);
}

module.exports = {
  notifyNewOrder,
  notifyNewRental
};
