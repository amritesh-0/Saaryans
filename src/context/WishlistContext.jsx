import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import productPurple from '../assets/images/product-purple-saree.jpg';

const WishlistContext = createContext(null);

const INITIAL_WISHLIST = [
  {
    id: 3,
    name: 'Purple Satin Gaji Silk Saree With Floral Embroidery',
    slug: 'purple-satin-gaji-silk-saree',
    price: 1500,
    originalPrice: 5500,
    image: productPurple,
    images: [productPurple, productPurple, productPurple, productPurple],
    category: 'Saree',
    subcategory: 'Silk Saree',
    isSale: true,
    sizes: ['XS', 'S', 'M', 'L'],
  },
];

export function WishlistProvider({ children }) {
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('saaryans-wishlist');
      return saved ? JSON.parse(saved) : INITIAL_WISHLIST;
    } catch {
      return INITIAL_WISHLIST;
    }
  });

  useEffect(() => {
    localStorage.setItem('saaryans-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const addToWishlist = (product) => {
    if (!isInWishlist(product.id)) {
      setWishlist((prev) => [...prev, product]);
      showToast(`Added to your Wishlist`, 'success');
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    showToast('Removed from Wishlist', 'info');
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast('Removed from Wishlist', 'info');
      return false;
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast('Added to your Wishlist!', 'success');
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
