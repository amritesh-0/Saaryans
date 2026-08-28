import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

// Demo coupon codes
const COUPONS = {
  SAARYANS10: { type: 'percent', value: 10, minOrder: 0, label: '10% off on all orders' },
  FIRST50: { type: 'flat', value: 500, minOrder: 0, label: '₹500 flat off' },
  FESTIVE20: { type: 'percent', value: 20, minOrder: 2000, label: '20% off on orders above ₹2,000' },
};

const initialState = {
  items: [],
  couponCode: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, size, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: Math.min(updatedItems[existingIndex].quantity + quantity, 10),
        };
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            originalPrice: product.originalPrice,
            size,
            quantity,
            category: product.category,
          },
        ],
      };
    }

    case 'REMOVE_FROM_CART': {
      const { id, size } = action.payload;
      return {
        ...state,
        items: state.items.filter((item) => !(item.id === id && item.size === size)),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, size, quantity } = action.payload;
      if (quantity < 1 || quantity > 10) return state;
      const updatedItems = state.items.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      );
      return { ...state, items: updatedItems };
    }

    case 'APPLY_COUPON': {
      return { ...state, couponCode: action.payload };
    }

    case 'REMOVE_COUPON': {
      return { ...state, couponCode: null };
    }

    case 'CLEAR_CART': {
      return { ...initialState };
    }

    case 'LOAD_CART': {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem('saaryans-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed };
      }
    } catch (e) {
      // ignore
    }
    return initial;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('saaryans-cart', JSON.stringify(state));
  }, [state]);

  // Computed values
  const computed = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalMRP = state.items.reduce(
      (sum, item) => sum + item.originalPrice * item.quantity,
      0
    );
    const discountOnMRP = totalMRP - subtotal;
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

    // Coupon discount
    let couponDiscount = 0;
    let couponError = null;
    const couponData = state.couponCode ? COUPONS[state.couponCode] : null;

    if (couponData) {
      if (couponData.minOrder > 0 && subtotal < couponData.minOrder) {
        couponError = `Minimum order of ₹${couponData.minOrder} required`;
      } else if (couponData.type === 'percent') {
        couponDiscount = Math.round(subtotal * (couponData.value / 100));
      } else {
        couponDiscount = Math.min(couponData.value, subtotal);
      }
    }

    const deliveryFee = subtotal > 0 && subtotal < 999 ? 79 : 0;
    const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);
    const totalSavings = discountOnMRP + couponDiscount;

    return {
      subtotal,
      totalMRP,
      discountOnMRP,
      couponDiscount,
      couponError,
      couponData,
      deliveryFee,
      grandTotal,
      totalSavings,
      itemCount,
    };
  }, [state]);

  // Actions
  const addToCart = (product, size, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, size, quantity } });
  };

  const removeFromCart = (id, size) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, size } });
  };

  const updateQuantity = (id, size, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity } });
  };

  const applyCoupon = (code) => {
    const upperCode = code.toUpperCase().trim();
    if (COUPONS[upperCode]) {
      dispatch({ type: 'APPLY_COUPON', payload: upperCode });
      return { success: true, label: COUPONS[upperCode].label };
    }
    return { success: false, error: 'Invalid coupon code' };
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    items: state.items,
    couponCode: state.couponCode,
    ...computed,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    COUPONS,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
