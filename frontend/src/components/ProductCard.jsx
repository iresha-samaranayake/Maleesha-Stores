import React, { useContext } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useContext(CartContext);
  
  const cartItem = cart.find(item => item.product_id === product._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleIncrement = () => {
    if (quantityInCart < product.stock) {
      updateQuantity(product._id, quantityInCart + 1);
    }
  };

  const handleDecrement = () => {
    updateQuantity(product._id, quantityInCart - 1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition duration-200">
      
      {/* Product Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 font-semibold text-sm">
            Fresh Grocery
          </div>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 right-2.5 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Info & CTA Section */}
      <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
            {product.category_id?.name || 'Grocery'}
          </span>
          {/* Product Name */}
          <h3 className="font-bold text-sm mt-1 leading-tight group-hover:text-emerald-700 transition">
            {product.name}
          </h3>
          {/* Unit Description */}
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Per {product.unit}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-emerald-700 font-extrabold text-sm md:text-base">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>

          {/* Cart Actions */}
          {isOutOfStock ? (
            <button
              disabled
              className="bg-slate-100 text-slate-400 p-2.5 rounded-xl cursor-not-allowed border border-slate-200"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 rounded-xl border border-emerald-200 p-1">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-sm font-bold"
              >
                <Minus className="w-4.5 h-4.5" />
              </button>
              <span className="text-emerald-950 font-bold text-sm px-2">
                {quantityInCart}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantityInCart >= product.stock}
                className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-sm font-bold ${
                  quantityInCart >= product.stock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 hover:shadow-md transition active:scale-95"
            >
              <Plus className="w-5 h-5 font-bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
