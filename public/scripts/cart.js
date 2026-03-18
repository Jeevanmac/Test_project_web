// Cart Logic

function getCartKey() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? `projectMarketCart_${user.id}` : "projectMarketCart_guest";
}

function getCart() {
  return JSON.parse(localStorage.getItem(getCartKey())) || [];
}

function saveCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

function addToCart(project) {
  let cart = getCart();
  // Ensure we don't duplicate projects, but if we allow multiple qtys we can sum
  const existing = cart.find(item => item.id === project.id);
  if (!existing) {
    cart.push(project);
    saveCart(cart);
    alert(`${project.name} added to cart!`);
  } else {
    alert(`${project.name} is already in the cart.`);
  }
  updateCartCount();
}

function updateCartCount() {
  const countBadge = document.getElementById("cartCountBadge");
  if (countBadge) {
    const cart = getCart();
    countBadge.innerText = cart.length;
    // Highlight effect
    countBadge.classList.add("scale-125");
    setTimeout(() => countBadge.classList.remove("scale-125"), 200);
  }
}

function clearCart() {
  localStorage.removeItem(getCartKey());
  updateCartCount();
}

async function buyNow(project) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }

  // Inject Razorpay script if not present
  if (typeof window.Razorpay === 'undefined') {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  }

  try {
    const res = await fetch("http://localhost:5000/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: project.price, userId: user.id, items: [project] })
    });
    
    if (!res.ok) throw new Error("Order creation failed");
    const order = await res.json();

    const options = {
      key: "rzp_test_SSnN1v2ozWo3Z6",
      amount: order.amount,
      currency: "INR",
      name: "ProjectMarket",
      description: `Purchase: ${project.name}`,
      order_id: order.id,
      handler: async function (response) {
        try {
            const verificationRes = await fetch("http://localhost:5000/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    userId: user.id,
                    items: [project]
                })
            });
            const verifyData = await verificationRes.json();
            if (verifyData.success) {
                window.location.href = `/pages/order-success.html?projectId=${project.id}`;
            } else {
                alert("Payment verification failed. Please contact support.");
            }
        } catch(e) {
            alert("Verification error: " + e.message);
        }
      },
      prefill: {
        name: user.name,
        email: user.email
      },
      theme: { color: "#200df2" }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response){
        alert("Payment failed: " + response.error.description);
    });
    rzp.open();
  } catch(e) {
    console.error("Direct Checkout Error:", e);
    alert("Could not initialize purchase. Please check your connection.");
  }
}

