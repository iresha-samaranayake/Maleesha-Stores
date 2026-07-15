import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [prevUser, setPrevUser] = useState(user);

  useEffect(() => {
    const handleUserChange = async () => {
      if (user && !prevUser) {
        // Guest just logged in!
        const guestCartData = localStorage.getItem('maleesha_stores_guest_cart');
        const guestItems = guestCartData ? JSON.parse(guestCartData) : [];

        try {
          if (guestItems.length > 0) {
            const config = {
              headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.post('/api/cart/merge', { guestItems }, config);
            
            localStorage.removeItem('maleesha_stores_guest_cart');
            localStorage.removeItem('maleesha_stores_cart');
            setCart(data);
          } else {
            const config = {
              headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get('/api/cart', config);
            setCart(data);
          }
        } catch (error) {
          console.error('Failed to sync/fetch cart after login:', error);
        }
      } else if (!user && prevUser) {
        // User logged out!
        setCart([]);
        localStorage.removeItem('maleesha_stores_guest_cart');
        localStorage.removeItem('maleesha_stores_cart');
      } else if (user) {
        // Logged in (page reload/load)
        try {
          const config = {
            headers: { Authorization: `Bearer ${user.token}` }
          };
          const { data } = await axios.get('/api/cart', config);
          setCart(data);
        } catch (error) {
          console.error('Failed to fetch user cart:', error);
        }
      } else {
        // Guest (not logged in, page load)
        const guestCartData = localStorage.getItem('maleesha_stores_guest_cart');
        setCart(guestCartData ? JSON.parse(guestCartData) : []);
      }
      setPrevUser(user);
    };

    handleUserChange();
  }, [user]);

  const addToCart = async (product) => {
    let newCart = [];
    const existingItem = cart.find((item) => item.product_id === product._id);
    if (existingItem) {
      newCart = cart.map((item) =>
        item.product_id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          product_id: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit || product.unitMeasurement || 'each',
          image_url: product.image_url,
          quantity: 1,
          stock: product.stock
        }
      ];
    }

    setCart(newCart);

    if (user) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.post('/api/cart', { items: newCart }, config);
      } catch (error) {
        console.error('Failed to sync cart add:', error);
      }
    } else {
      localStorage.setItem('maleesha_stores_guest_cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter((item) => item.product_id !== productId);
    setCart(newCart);

    if (user) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.post('/api/cart', { items: newCart }, config);
      } catch (error) {
        console.error('Failed to sync cart remove:', error);
      }
    } else {
      localStorage.setItem('maleesha_stores_guest_cart', JSON.stringify(newCart));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);

    if (user) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.post('/api/cart', { items: newCart }, config);
      } catch (error) {
        console.error('Failed to sync cart quantity:', error);
      }
    } else {
      localStorage.setItem('maleesha_stores_guest_cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (user) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.post('/api/cart', { items: [] }, config);
      } catch (error) {
        console.error('Failed to clear database cart:', error);
      }
    } else {
      localStorage.removeItem('maleesha_stores_guest_cart');
      localStorage.removeItem('maleesha_stores_cart');
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
