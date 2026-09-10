import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

const CartDrawer = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove
}) => {
  const total = items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="flex-1 flex flex-col bg-white shadow-xl">

          <div className="px-4 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <ShoppingBag className="mr-2" size={20} />
              Your Cart ({items.length})
            </h2>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close cart"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <ShoppingBag
                  size={48}
                  className="opacity-20"
                />

                <p>Your cart is empty</p>

                <button
                  onClick={onClose}
                  className="text-emerald-600 font-medium hover:underline"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div
                  key={item.id}
                  className="flex bg-white border border-slate-100 rounded-xl p-3 shadow-sm"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="text-[8px] text-slate-400 font-bold uppercase text-center p-1">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium text-slate-900">
                      <h3 className="line-clamp-2 text-sm leading-tight mr-2 font-bold">
                        {item.name}
                      </h3>

                      <p className="ml-4 font-black">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {item.store}
                      </p>

                      {item.link && item.link !== '#' && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 flex items-center font-bold"
                        >
                          View Source
                          <ExternalLink
                            size={10}
                            className="ml-1"
                          />
                        </a>
                      )}
                    </div>

                    <div className="flex flex-1 items-end justify-between text-sm mt-3">

                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, -1)
                          }
                          className="p-1 hover:bg-slate-100 text-slate-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="px-3 font-bold text-slate-900">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, 1)
                          }
                          className="p-1 hover:bg-slate-100 text-slate-600"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="font-bold text-red-500 hover:text-red-600 flex items-center text-xs"
                      >
                        <Trash2
                          size={14}
                          className="mr-1"
                        />
                        Remove
                      </button>

                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-slate-200 p-6 bg-slate-50">
              <div className="flex justify-between text-base font-medium text-slate-900 mb-4">
                <p className="font-bold text-slate-500 uppercase text-xs tracking-widest">
                  Subtotal
                </p>

                <p className="text-2xl font-black">
                  ₹{total.toLocaleString('en-IN')}
                </p>
              </div>

              <button
                className="flex w-full items-center justify-center rounded-xl border border-transparent bg-emerald-700 px-6 py-4 text-base font-black text-white shadow-lg hover:bg-emerald-800 transition-all active:scale-95"
                onClick={() =>
                  alert("Proceeding to secure checkout...")
                }
              >
                Checkout Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;