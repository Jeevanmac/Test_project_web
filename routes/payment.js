const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const ordersFile = path.join(__dirname, "../data/orders.json");
const usersFile = path.join(__dirname, "../data/users.json");
const { sendOrderEmail } = require("../utils/email");

const razorpay = new Razorpay({
  key_id: "rzp_test_SSnN1v2ozWo3Z6",
  key_secret: "Qb5Aevq3nQH62N0oHFBJRQBf"
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, userId, items } = req.body;
    
    // Create Razorpay order
    const options = {
      amount: amount * 100,
      currency: "INR"
    };
    const order = await razorpay.orders.create(options);

    // Save order to our database
    const orders = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile, "utf-8")) : [];
    const newOrder = {
      id: order.id,
      userId,
      amount,
      items,
      status: "created",
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

    res.json(order);
  } catch (error) {
    console.error("Payment Order Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, items } = req.body;

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", "Qb5Aevq3nQH62N0oHFBJRQBf")
                                    .update(body.toString())
                                    .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is valid
      if (fs.existsSync(ordersFile)) {
        const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
        const orderIndex = orders.findIndex(o => o.id === razorpay_order_id);
        if (orderIndex !== -1) {
          orders[orderIndex].status = "paid";
          fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
        }
      }

      // Send Email
      if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        const user = users.find(u => u.id === userId);
        if (user) {
          await sendOrderEmail(user, items);
        }
      }

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, error: "Server error during verification" });
  }
});

router.get("/user-orders/:userId", (req, res) => {
  const { userId } = req.params;
  if (!fs.existsSync(ordersFile)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders);
});

module.exports = router;
