import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { HeartIcon, CloseIcon, CartIcon } from '../../assets/icons';
import Button from '../../components/UI/Button/Button';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // State to hold selected size for each item before moving to bag
  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleMoveToBag = (product) => {
    const chosenSize = selectedSizes[product.id] || (product.sizes && product.sizes[0]) || 'Free Size';
    addToCart(product, chosenSize, 1);
    removeFromWishlist(product.id);
    showToast(`Moved "${product.name.slice(0, 25)}..." to Bag!`, 'success');
  };

  if (wishlistCount === 0) {
    return (
      <main className="wishlist-page container" id="wishlist-empty-page">
        <div className="wishlist-empty">
          <div className="wishlist-empty__icon">
            <HeartIcon size={56} />
          </div>
          <h1 className="wishlist-empty__title">Your Wishlist is Empty</h1>
          <p className="wishlist-empty__desc">
            Explore our handcrafted luxury sarees and save your favorite styles to review later.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            CONTINUE SHOPPING
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page" id="wishlist-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="wishlist-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span className="breadcrumb-current">My Wishlist</span>
        </nav>

        <div className="wishlist-header">
          <h1 className="wishlist-title">
            My Wishlist <span className="wishlist-count-tag">{wishlistCount} {wishlistCount === 1 ? 'Item' : 'Items'}</span>
          </h1>
        </div>

        <div className="wishlist-grid">
          {wishlist.map((product) => {
            const discount = Math.round(
              ((product.originalPrice - product.price) / product.originalPrice) * 100
            );
            const currentSelectedSize = selectedSizes[product.id] || (product.sizes && product.sizes[0]) || 'M';

            return (
              <article key={product.id} className="wishlist-card" id={`wishlist-card-${product.id}`}>
                <div className="wishlist-card__image-wrap">
                  <Link to={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className="wishlist-card__img" loading="lazy" />
                  </Link>

                  {product.isSale && <span className="wishlist-card__badge">Sale</span>}

                  <button
                    className="wishlist-card__remove-btn"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove from wishlist"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>

                <div className="wishlist-card__info">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="wishlist-card__name">{product.name}</h3>
                  </Link>

                  <div className="wishlist-card__pricing">
                    <span className="wishlist-card__price">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="wishlist-card__original-price">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="wishlist-card__discount">({discount}% off)</span>
                      </>
                    )}
                  </div>

                  {/* Size Options Selector */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="wishlist-card__size-selector">
                      <span className="size-selector-label">Select Size:</span>
                      <div className="size-selector-pills">
                        {product.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`size-pill ${currentSelectedSize === s ? 'size-pill--active' : ''}`}
                            onClick={() => handleSizeSelect(product.id, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="wishlist-card__action">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleMoveToBag(product)}
                      className="wishlist-move-btn"
                    >
                      <CartIcon size={16} /> MOVE TO BAG
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Wishlist;
