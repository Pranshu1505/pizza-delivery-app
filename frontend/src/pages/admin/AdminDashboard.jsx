import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Navbar from "../../components/Navbar.jsx";

const ORDER_STATUSES = ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered", "Cancelled"];

const InventoryTab = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchInventory = async () => {
    const { data } = await api.get("/admin/inventory");
    setInventory(data.inventory);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStockChange = (id, value) =>
    setInventory((inv) => inv.map((i) => (i._id === id ? { ...i, stock: value } : i)));

  const saveStock = async (item) => {
    setSavingId(item._id);
    try {
      await api.put(`/admin/inventory/${item._id}`, { stock: Number(item.stock) });
      await fetchInventory();
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="text-cream/60">Loading inventory…</p>;

  const grouped = inventory.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-display text-lg font-bold capitalize mb-3">{category}s</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const low = item.stock < item.lowStockThreshold;
              return (
                <div
                  key={item._id}
                  className={`bg-cream text-char rounded-xl p-4 border-2 ${low ? "border-tomato" : "border-transparent"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{item.name}</p>
                    {low && (
                      <span className="text-[10px] font-semibold text-tomato bg-tomato/10 px-1.5 py-0.5 rounded-full">
                        LOW STOCK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={item.stock}
                      onChange={(e) => handleStockChange(item._id, e.target.value)}
                      className="w-full rounded-lg border border-char/20 px-2 py-1.5 text-sm focus-ring outline-none"
                    />
                    <button
                      onClick={() => saveStock(item)}
                      disabled={savingId === item._id}
                      className="text-xs font-semibold bg-basil text-cream px-3 py-1.5 rounded-lg hover:bg-basil/90 disabled:opacity-50 whitespace-nowrap"
                    >
                      {savingId === item._id ? "Saving" : "Save"}
                    </button>
                  </div>
                  <p className="text-[11px] text-char/50 mt-1.5">Threshold: {item.lowStockThreshold} units</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await api.get("/admin/orders");
    setOrders(data.orders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 7000); // reflected in real time on user side too
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    fetchOrders();
  };

  if (loading) return <p className="text-cream/60">Loading orders…</p>;
  if (!orders.length) return <p className="text-cream/60">No paid orders yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order._id} className="bg-cream text-char rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-char/50">Order #{order._id.slice(-6).toUpperCase()} · {order.user?.name} ({order.user?.email})</p>
              <p className="font-medium text-sm mt-0.5">
                {order.items.length} pizza{order.items.length > 1 ? "s" : ""} · ₹{order.totalAmount}
              </p>
              <p className="text-xs text-char/50 mt-0.5">{order.deliveryAddress}</p>
            </div>
            <select
              value={order.status}
              onChange={(e) => updateStatus(order._id, e.target.value)}
              className="text-sm rounded-lg border border-char/20 px-2 py-1.5 focus-ring outline-none"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("inventory");

  return (
    <div className="min-h-screen bg-char text-cream">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-3xl font-bold mb-6">Admin dashboard</h1>
        <div className="flex gap-2 mb-8">
          {["inventory", "orders"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize focus-ring ${
                tab === t ? "bg-tomato text-cream" : "bg-cream/10 text-cream/70 hover:bg-cream/20"
              }`}
            >
              {t === "inventory" ? "Inventory" : "Order management"}
            </button>
          ))}
        </div>
        {tab === "inventory" ? <InventoryTab /> : <OrdersTab />}
      </main>
    </div>
  );
}
