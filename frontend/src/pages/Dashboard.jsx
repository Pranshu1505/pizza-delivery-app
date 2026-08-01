import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import PizzaBuilder from "../components/PizzaBuilder.jsx";
import OrderTracker from "../components/OrderTracker.jsx";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const toOrderItem = (selection) => ({
  base: { name: selection.base.name, inventoryKey: selection.base.inventoryKey },
  sauce: { name: selection.sauce.name, inventoryKey: selection.sauce.inventoryKey },
  cheese: { name: selection.cheese.name, inventoryKey: selection.cheese.inventoryKey },
  veggies: selection.veggies.map((v) => ({ name: v.name, inventoryKey: v.inventoryKey })),
  quantity: 1,
});

export default function Dashboard() {
  const [options, setOptions] = useState({ base: [], sauce: [], cheese: [], veggie: [] });
  const [builderOpen, setBuilderOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkoutStatus, setCheckoutStatus] = useState({ loading: false, error: "" });
  const [address, setAddress] = useState("");

  useEffect(() => {
    api.get("/pizza/options").then(({ data }) => setOptions(data));
  }, []);

  const addToCart = (selection) => {
    setCart((c) => [...c, selection]);
    setBuilderOpen(false);
  };

  const removeFromCart = (index) => setCart((c) => c.filter((_, i) => i !== index));

  const cartTotal = cart.reduce((sum, item) => sum + item.itemTotal, 0);

  const handleCheckout = async () => {
    setCheckoutStatus({ loading: true, error: "" });
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Could not load payment gateway. Check your connection.");

      // 1. Create the order in our DB
      const { data: orderData } = await api.post("/orders", {
        items: cart.map(toOrderItem),
        deliveryAddress: address,
      });
      const dbOrderId = orderData.order._id;

      // 2. Create a Razorpay order (test mode)
      const { data: rzp } = await api.post("/payments/create-razorpay-order", { orderId: dbOrderId });

      // 3. Open Razorpay checkout - in test mode click "Success" to simulate payment
      const rzpInstance = new window.Razorpay({
        key: rzp.keyId,
        amount: rzp.amount,
        currency: rzp.currency,
        name: "Pizza Palace",
        description: "Pizza order payment (test mode)",
        order_id: rzp.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              dbOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setCart([]);
            setCheckoutStatus({ loading: false, error: "" });
          } catch (err) {
            setCheckoutStatus({ loading: false, error: "Payment verification failed. Contact support." });
          }
        },
        modal: { ondismiss: () => setCheckoutStatus({ loading: false, error: "" }) },
        theme: { color: "#C1440E" },
      });
      rzpInstance.open();
      setCheckoutStatus({ loading: false, error: "" });
    } catch (err) {
      setCheckoutStatus({ loading: false, error: err.response?.data?.message || err.message || "Checkout failed" });
    }
  };

  return (
    <div className="min-h-screen bg-char text-cream">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <h1 className="font-display text-3xl font-bold mb-2">Build your pizza</h1>
          <p className="text-cream/60 mb-6">Pick a base, sauce, cheese, and toppings — your way.</p>

          <button
            onClick={() => setBuilderOpen(true)}
            className="w-full sm:w-auto rounded-xl bg-tomato text-cream font-semibold px-6 py-3 hover:bg-tomato/90 transition-colors focus-ring"
          >
            + Start building
          </button>

          {cart.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold mb-3">Your cart</h2>
              <div className="space-y-3">
                {cart.map((item, i) => (
                  <div key={i} className="bg-cream text-char rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {item.base.name} · {item.sauce.name} · {item.cheese.name}
                      </p>
                      <p className="text-xs text-char/60 mt-0.5">
                        {item.veggies.length ? item.veggies.map((v) => v.name).join(", ") : "No extra veggies"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">₹{item.itemTotal}</span>
                      <button onClick={() => removeFromCart(i)} className="text-tomato text-sm hover:underline focus-ring">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-cream text-char rounded-xl p-5 ticket-edge">
                <h3 className="font-display font-bold mb-3">Order summary</h3>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-char/60">Total</span>
                  <span className="font-semibold">₹{cartTotal}</span>
                </div>
                <label className="text-sm font-medium">Delivery address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Flat / street / city"
                  className="mt-1 w-full rounded-lg border border-char/20 px-3 py-2 text-sm focus-ring outline-none"
                />
                {checkoutStatus.error && <p className="text-tomato text-sm mt-3">{checkoutStatus.error}</p>}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutStatus.loading || !address.trim()}
                  className="mt-4 w-full rounded-lg bg-basil text-cream font-semibold py-2.5 hover:bg-basil/90 disabled:opacity-50 focus-ring"
                >
                  {checkoutStatus.loading ? "Processing..." : `Pay ₹${cartTotal} with Razorpay (test mode)`}
                </button>
              </div>
            </div>
          )}
        </section>

        <aside>
          <h2 className="font-display text-xl font-bold mb-3">Track your orders</h2>
          <OrderTracker />
        </aside>
      </main>

      {builderOpen && (
        <PizzaBuilder options={options} onAddToCart={addToCart} onClose={() => setBuilderOpen(false)} />
      )}
    </div>
  );
}
