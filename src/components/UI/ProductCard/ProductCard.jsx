import { Link } from 'react-router-dom';
import { HeartIcon } from '../../../assets/icons';
import { useWishlist } from '../../../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <article className="product-card" id={`product-card-${product.id}`}>
      <Link to={`/product/${product.id}`} className="product-card__image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        {product.isSale && (
          <span className="product-card__badge">Sale</span>
        )}
        <button
          className={`product-card__wishlist ${wishlisted ? 'product-card__wishlist--active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HeartIcon size={20} filled={wishlisted} />
        </button>
      </Link>
      <div className="product-card__info">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <div className="product-card__pricing">
          <span className="product-card__price">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="product-card__original-price">₹{product.originalPrice.toLocaleString()}</span>
              <span className="product-card__discount">({discount}% off)</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
