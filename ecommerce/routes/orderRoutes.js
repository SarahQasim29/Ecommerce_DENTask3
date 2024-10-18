const express = require("express");
const router = express.Router();
const paypal = require("paypal-rest-sdk");
const { Order } = require("../models/Order");
const { Cart } = require("../models/Cart");
const { auth } = require("../middlewares/auth");

// Configure PayPal SDK with your credentials
paypal.configure({
  mode: "sandbox", // Change to 'live' for production
  client_id: process.env.REACT_APP_PAYPAL_CLIENT_ID, // Use the correct variable for Client ID
  client_secret: process.env.REACT_APP_PAYPAL_CLIENT_SECRET, // Use the correct variable for Client Secret
});

const populate = {
  path: "orderDetails",
  populate: {
    path: "_product",
    model: "products",
    populate: {
      path: "_category",
      model: "categories",
    },
  },
};

router.post("/checkout", auth, (req, res) => {
  Cart.findOne({ _customerId: req.customerId }).exec(
    async (error, cartData) => {
      if (error) return res.status(400).json({ status: false, error });

      const token = req.body.token;
      const totalAmount = req.body.total;

      // Create a payment object
      const payment = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        transactions: [
          {
            amount: {
              total: totalAmount.toFixed(2), // Amount as a string
              currency: "USD",
            },
            description: "Payment for product",
          },
        ],
        redirect_urls: {
          return_url: "http://localhost:3000/success", // Your success URL
          cancel_url: "http://localhost:3000/cancel", // Your cancel URL
        },
      };

      // Create a payment with PayPal
      paypal.payment.create(payment, async (error, paymentResponse) => {
        if (error) {
          console.error("PayPal payment error:", error);
          return res.status(500).json({ status: false, error });
        } else {
          // If the payment is approved, create the order
          const orderData = {
            _customerId: cartData._customerId,
            orderDetails: cartData.cartDetails,
            paymentId: paymentResponse.id, // Get the payment ID from the response
            orderDate: new Date(),
            totalAmount,
          };

          const newOrder = new Order(orderData); // Correctly instantiate Order
          newOrder.save(async (error, savedOrder) => {
            if (error) return res.status(400).json({ status: false, error });
            await Cart.deleteOne({ _customerId: req.customerId });
            return res.status(200).json({
              status: true,
              message: "Order has been created successfully!",
              data: savedOrder, // Return the saved order data
            });
          });
        }
      });
    }
  );
});

router.get("/orderHistory", auth, (req, res) => {
  Order.find({ _customerId: req.customerId })
    .sort({ orderDate: "desc" })
    .populate(populate)
    .exec((error, data) => {
      if (error) return res.status(400).json({ status: false, error });
      return res.status(200).json({
        status: true,
        message: "Get customer order history successfully!",
        data,
      });
    });
});

module.exports = router;
