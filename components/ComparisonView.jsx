import React from 'react';
import {
  X,
  Scale,
  Info,
  CheckCircle2
} from 'lucide-react';

const ComparisonView = ({
  products,
  onClose,
  onRemoveProduct
}) => {
  if (products.length === 0) return null;

  // Manual comparison logic
  const bestPrice = Math.min(
    ...products.map(p => p.price)
  );

  const bestRating = Math.max(
    ...products.map(p => p.rating)
  );

  const comparisonRows = [
    {
      label: 'Price',
      key: 'price',
      format: val =>
        `₹${val.toLocaleString('en-IN')}`,
      highlight: val =>
        val === bestPrice
          ? 'text-green-600 font-black'
          : ''
    },
    {
      label: 'Store',
      key: 'store',
      format: val => val
    },
    {
      label: 'Rating',
      key: 'rating',
      format: val => `${val} ★`,
      highlight: val =>
        val === bestRating
          ? 'text-amber-600 font-black'
          : ''
    },
    {
      label: 'Reviews',
      key: 'reviewCount',
      format: val => val.toString()
    },
    {
      label: 'Ingredients',
      key: 'features',
      format: val =>
        val.slice(0, 2).join(', ') + '...'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">

          <div className="flex items-center space-x-3">

            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Scale size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-800">
                Deterministic Price Comparison
              </h2>

              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Data-driven analysis from product registry
              </p>
            </div>

          </div>

          <button
            type="button"
            title="Close comparison"
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X
              size={24}
              className="text-slate-500"
            />
          </button>

        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">

          <div className="grid grid-cols-[200px_1fr] gap-8">

            {/* Features Labels */}
            <div className="pt-48 space-y-12">

              {comparisonRows.map(row => (
                <div
                  key={row.label}
                  className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] h-12 flex items-center"
                >
                  {row.label}
                </div>
              ))}

            </div>

            {/* Products Columns */}
            <div
              className={`grid grid-cols-${products.length} gap-6`}
            >

              {products.map(p => (
                <div
                  key={p.id}
                  className="relative"
                >

                  <button
                    type="button"
                    title="Remove product from comparison"
                    onClick={() =>
                      onRemoveProduct(p.id)
                    }
                    className="absolute -top-2 -right-2 p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full z-10 transition-all shadow-sm"
                  >
                    <X size={14} />
                  </button>

                  <div className="mb-8 text-center group">

                    <div className="h-40 bg-stone-50 rounded-2xl p-4 mb-4 flex items-center justify-center border border-slate-100 group-hover:border-emerald-200 transition-colors">

                      <img
                        src={p.image}
                        alt={p.name}
                        className="max-h-full object-contain"
                      />

                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-tight h-10 line-clamp-2">
                      {p.name}
                    </h3>

                  </div>

                  <div className="space-y-12">

                    {comparisonRows.map(row => {

                      const value = p[row.key];

                      const highlight =
                        row.highlight
                          ? row.highlight(value)
                          : 'text-slate-600 font-medium';

                      return (
                        <div
                          key={row.label}
                          className={`h-12 flex items-center text-sm ${highlight}`}
                        >
                          {row.format(value)}
                        </div>
                      );
                    })}

                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* Verdict Logic (deterministic) */}
          <div className="mt-12 p-8 bg-emerald-50 rounded-3xl border border-emerald-100">

            <h3 className="text-lg font-black text-emerald-900 mb-4 flex items-center">
              <CheckCircle2
                className="mr-2"
                size={24}
              />

              Shopping Analysis
            </h3>

            <div className="grid md:grid-cols-2 gap-8 text-sm">

              <div className="space-y-3">

                <p className="flex items-start">

                  <span className="font-bold text-emerald-700 mr-2">
                    Best Value:
                  </span>

                  <span className="text-emerald-800">

                    {
                      products.reduce(
                        (prev, curr) =>
                          curr.price < prev.price
                            ? curr
                            : prev
                      ).name
                    }

                    {' '}
                    is the most budget-friendly option at ₹
                    {bestPrice.toLocaleString('en-IN')}.
                  </span>

                </p>

                <p className="flex items-start">

                  <span className="font-bold text-emerald-700 mr-2">
                    Top Rated:
                  </span>

                  <span className="text-emerald-800">

                    {
                      products.reduce(
                        (prev, curr) =>
                          curr.rating > prev.rating
                            ? curr
                            : prev
                      ).name
                    }

                    {' '}
                    has the highest consumer trust rating (
                    {bestRating} ★).
                  </span>

                </p>

              </div>

              <div className="bg-white/50 p-4 rounded-xl border border-emerald-100 text-emerald-900 italic">

                <Info
                  size={16}
                  className="inline mr-2 mb-1"
                />

                This analysis is based on raw technical
                specifications fetched from Open Food Facts
                India. Prices are reflective of{' '}
                {products
                  .map(p => p.store)
                  .join(', ')}
                {' '}listings.

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComparisonView;