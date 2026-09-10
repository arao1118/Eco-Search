import React from 'react';
import {
  X,
  ShoppingCart,
  Star,
  Info,
  ExternalLink,
  Leaf
} from 'lucide-react';

const ProductDetailsModal = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">

      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-6 right-6 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg z-10 transition-colors"
        >
          <X
            size={24}
            className="text-slate-900"
          />
        </button>

        {/* Image Section */}
        <div className="md:w-1/2 bg-stone-50 p-8 flex items-center justify-center relative border-r border-slate-100">

          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-[400px] object-contain drop-shadow-2xl"
          />

        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-8 overflow-y-auto">

          <div className="mb-2 flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
            <Leaf size={14} />
            <span>
              {product.store} Exclusive
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
            {product.name}
          </h2>

          <div className="flex items-center space-x-4 mb-6">

            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-lg text-sm font-bold">
              {product.rating}

              <Star
                size={14}
                className="ml-1 fill-current"
              />
            </div>

            <span className="text-slate-400 text-sm">
              {product.reviewCount} Verified Reviews
            </span>

          </div>

          <div className="flex items-baseline space-x-3 mb-8">

            <span className="text-3xl font-black text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>

            {product.originalPrice && (
              <span className="text-lg text-slate-400 line-through font-medium">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}

          </div>

          <div className="space-y-6 mb-8">

            <div>

              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center mb-3">
                <Info
                  size={16}
                  className="mr-2 text-emerald-600"
                />

                Description
              </h4>

              <p className="text-slate-600 leading-relaxed text-sm">
                {product.description}
              </p>

            </div>

            <div>

              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">
                Key Highlights
              </h4>

              <div className="grid grid-cols-1 gap-2">

                {product.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg"
                  >

                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3" />

                    {feature}

                  </div>
                ))}

              </div>

            </div>

          </div>

          <div className="flex flex-col space-y-3">

            <button
              onClick={() => onAddToCart(product)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-700/20 flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              <ShoppingCart size={20} />

              <span>
                Add to Shopping Cart
              </span>
            </button>

            {product.link !== '#' && (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors text-sm"
              >
                <ExternalLink size={16} />

                <span>
                  Source: Open Food Facts
                </span>
              </a>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;