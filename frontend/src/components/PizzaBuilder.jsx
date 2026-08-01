import React, { useState } from "react";

const STEPS = ["base", "sauce", "cheese", "veggies", "review"];
const STEP_LABELS = {
  base: "Step 1 · Choose a base",
  sauce: "Step 2 · Choose a sauce",
  cheese: "Step 3 · Choose a cheese",
  veggies: "Step 4 · Choose your veggies",
  review: "Order summary",
};

export default function PizzaBuilder({ options, onAddToCart, onClose }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState({ base: null, sauce: null, cheese: null, veggies: [] });
  const step = STEPS[stepIndex];

  const canProceed =
    step === "veggies" || step === "review"
      ? true
      : !!selection[step];

  const pick = (type, item) => setSelection((s) => ({ ...s, [type]: item }));
  const toggleVeggie = (item) =>
    setSelection((s) => {
      const exists = s.veggies.find((v) => v.id === item.id);
      return {
        ...s,
        veggies: exists ? s.veggies.filter((v) => v.id !== item.id) : [...s.veggies, item],
      };
    });

  const total =
    (selection.base?.price || 0) +
    (selection.sauce?.price || 0) +
    (selection.cheese?.price || 0) +
    selection.veggies.reduce((sum, v) => sum + v.price, 0);

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));

  const renderOptionGrid = (type) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {(options[type] || []).map((item) => {
        const selected =
          type === "veggies"
            ? !!selection.veggies.find((v) => v.id === item.id)
            : selection[type]?.id === item.id;
        return (
          <button
            key={item.id}
            disabled={!item.inStock}
            onClick={() => (type === "veggies" ? toggleVeggie(item) : pick(type, item))}
            className={`text-left rounded-xl border-2 p-3 transition-colors focus-ring
              ${selected ? "border-tomato bg-tomato/10" : "border-char/15 hover:border-crust"}
              ${!item.inStock ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <p className="font-medium text-sm">{item.name}</p>
            <p className="text-xs text-char/60 mt-1">
              {item.inStock ? `+₹${item.price}` : "Out of stock"}
            </p>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-char/80 flex items-center justify-center p-4 z-50">
      <div className="bg-cream text-char rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto ticket-edge mt-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">{STEP_LABELS[step]}</h2>
            <button onClick={onClose} className="text-char/50 hover:text-char text-xl leading-none focus-ring" aria-label="Close">
              ×
            </button>
          </div>

          {/* progress */}
          <div className="flex gap-1 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-tomato" : "bg-char/10"}`} />
            ))}
          </div>

          {step !== "review" && renderOptionGrid(step)}

          {step === "review" && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-char/60">Base</span><span>{selection.base?.name}</span></div>
              <div className="flex justify-between"><span className="text-char/60">Sauce</span><span>{selection.sauce?.name}</span></div>
              <div className="flex justify-between"><span className="text-char/60">Cheese</span><span>{selection.cheese?.name}</span></div>
              <div className="flex justify-between">
                <span className="text-char/60">Veggies</span>
                <span className="text-right">{selection.veggies.length ? selection.veggies.map((v) => v.name).join(", ") : "None"}</span>
              </div>
              <div className="border-t border-char/15 pt-3 flex justify-between font-semibold">
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {stepIndex > 0 && (
              <button onClick={back} className="flex-1 rounded-lg border border-char/20 py-2.5 font-medium hover:bg-char/5 focus-ring">
                Back
              </button>
            )}
            {step !== "review" ? (
              <button
                onClick={next}
                disabled={!canProceed}
                className="flex-1 rounded-lg bg-tomato text-cream py-2.5 font-semibold hover:bg-tomato/90 disabled:opacity-40 focus-ring"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => onAddToCart({ ...selection, itemTotal: total })}
                className="flex-1 rounded-lg bg-basil text-cream py-2.5 font-semibold hover:bg-basil/90 focus-ring"
              >
                Add to cart · ₹{total}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
