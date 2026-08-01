import React, { useEffect, useState } from "react";
import api from "../api/axios.js";

const PIPELINE = ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered"];

const StatusPipeline = ({ status }) => {
  if (status === "Cancelled") {
    return <span className="text-xs font-semibold text-tomato bg-tomato/10 px-2 py-1 rounded-full">Cancelled</span>;
  }
  const currentIndex = PIPELINE.indexOf(status);
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {PIPELINE.map((stage, i) => (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full ${i <= currentIndex ? "bg-basil" : "bg-char/15"}`}
              title={stage}
            />
          </div>
          {i < PIPELINE.length - 1 && (
            <div className={`h-0.5 w-6 sm:w-10 ${i < currentIndex ? "bg-basil" : "bg-char/15"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function OrderTracker() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/mine");
        setOrders(data.orders.filter((o) => o.payment.status === "paid"));
      } catch {
        // silent - polling will retry
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // real-time-ish polling
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-cream/60 text-sm">Loading your orders…</p>;
  if (!orders.length) return <p className="text-cream/60 text-sm">You haven't placed any orders yet.</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-cream text-char rounded-xl p-4 ticket-edge mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-char/50">Order #{order._id.slice(-6).toUpperCase()}</p>
              <p className="font-medium text-sm mt-0.5">
                {order.items.length} pizza{order.items.length > 1 ? "s" : ""} · ₹{order.totalAmount}
              </p>
            </div>
            <span className="text-xs font-semibold text-basil bg-basil/10 px-2 py-1 rounded-full">
              {order.status}
            </span>
          </div>
          <StatusPipeline status={order.status} />
        </div>
      ))}
    </div>
  );
}
