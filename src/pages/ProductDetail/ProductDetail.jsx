import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  TruckIcon,
  ShieldIcon,
  CheckCircleIcon,
  ReturnIcon,
  WhatsAppIcon,
  ChevronDownIcon,
} from '../../assets/icons';
import Button from '../../components/UI/Button/Button';
import { products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('details');

  const wishlisted = product ? isInWishlist(product.id) : false;

  if (!product) {
    return (
      <main className="product-detail container" id="product-detail-page">
        <div className="product-detail__not-found">
          <h2>Product not found</h2>
          <Link to="/">Back to Home</Link>
        </div>
      </main>
    );
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      showToast('Please select a size first!', 'error');
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, 1);
    showToast(`Added "${product.name.slice(0, 25)}..." to Bag!`, 'success');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      showToast('Please select a size first!', 'error');
      return;
    }
    setSizeError(false);
    addToCart(product, selectedSize, 1);
    navigate('/cart');
  };

  const accordionItems = [
    { key: 'details', title: 'Product Details', content: product.description },
    {
      key: 'size',
      title: 'Size & Fits',
      content: `Available sizes: ${product.sizes.join(', ')}. This saree is ${product.details.length}. For the best fit, we recommend referring to our size guide or contacting us on WhatsApp for personalized assistance.`,
    },
    {
      key: 'material',
      title: 'Material',
      content: `Fabric: ${product.details.fabric}. Work: ${product.details.work}. Weight: ${product.details.weight}. Wash Care: ${product.details.washCare}.`,
    },
    {
      key: 'shipping',
      title: 'Shipping & Returns',
      content: 'Free shipping on all orders above ₹999. Easy returns within 48 hours of delivery. Items must be in original condition with tags attached. Refund will be processed within 5-7 business days.',
    },
    {
      key: 'faqs',
      title: 'FAQs',
      content: 'Q: Is the blouse piece included? A: Yes, an unstitched blouse piece is included. Q: Can I get custom stitching? A: Yes, we offer custom blouse stitching at an additional cost. Contact us on WhatsApp for details.',
    },
  ];

  return (
    <main className="product-detail" id="product-detail-page">
      {/* Breadcrumb */}
      <nav className="product-detail__breadcrumb container" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="product-detail__breadcrumb-sep">›</span>
        <Link to="/">{product.category}</Link>
        <span className="product-detail__breadcrumb-sep">›</span>
        <span>{product.subcategory}</span>
      </nav>

      <div className="product-detail__main container">
        {/* Image Gallery */}
        <div className="product-detail__gallery">
          <div className="product-detail__thumbnails">
            {product.images.map((img, index) => (
              <button
                key={index}
                className={`product-detail__thumb ${index === selectedImage ? 'product-detail__thumb--active' : ''}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img src={img} alt="" loading="lazy" />
              </button>
            ))}
          </div>
          <div className="product-detail__main-image">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="product-detail__image"
            />
            <button
              className={`product-detail__wishlist-btn ${wishlisted ? 'product-detail__wishlist-btn--active' : ''}`}
              onClick={() => toggleWishlist(product)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              id="product-wishlist-toggle-btn"
            >
              <HeartIcon size={22} filled={wishlisted} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="product-detail__info">
          <h1 className="product-detail__name">{product.name}</h1>

          <div className="product-detail__pricing">
            <span className="product-detail__price">₹{product.price.toLocaleString()}</span>
            <span className="product-detail__original-price">₹{product.originalPrice.toLocaleString()}</span>
            <span className="product-detail__discount">({discount}% off)</span>
          </div>
          <p className="product-detail__tax">Inclusive of all taxes</p>

          {/* Size Selector */}
          <div className="product-detail__sizes">
            <div className="product-detail__sizes-header">
              <h3 className="product-detail__sizes-title">SELECT SIZE</h3>
              {sizeError && <span className="size-error-text">Please select a size</span>}
            </div>
            <div className="product-detail__size-options">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`product-detail__size-btn ${selectedSize === size ? 'product-detail__size-btn--active' : ''}`}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  id={`size-btn-${size}`}
                >
                  {size}
                </button>
              ))}
              <button
                type="button"
                className={`product-detail__size-btn product-detail__size-btn--custom ${selectedSize === 'Custom' ? 'product-detail__size-btn--active' : ''}`}
                onClick={() => {
                  setSelectedSize('Custom');
                  setSizeError(false);
                }}
              >
                Custom size
              </button>
            </div>
          </div>

          {/* WhatsApp Help */}
          <div className="product-detail__whatsapp-help">
            <span>Need assistance in selecting your size?</span>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
              chat with us <WhatsAppIcon size={16} />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="product-detail__actions">
            <Button
              variant="outlined"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              id="add-to-cart-btn"
            >
              ADD TO CART
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleBuyNow}
              id="buy-now-btn"
            >
              BUY NOW
            </Button>
          </div>

          {/* Trust Icons */}
          <div className="product-detail__trust-row">
            <div className="product-detail__trust-item">
              <TruckIcon size={20} />
              <span>Free Shipping</span>
            </div>
            <div className="product-detail__trust-item">
              <ShieldIcon size={20} />
              <span>100% Purchase Protection</span>
            </div>
            <div className="product-detail__trust-item">
              <CheckCircleIcon size={20} />
              <span>Assured Quality</span>
            </div>
            <div className="product-detail__trust-item">
              <ReturnIcon size={20} />
              <span>48 Hours Easy Return</span>
            </div>
          </div>

          {/* Accordions */}
          <div className="product-detail__accordions">
            {accordionItems.map((item) => (
              <div key={item.key} className="product-detail__accordion">
                <button
                  className={`product-detail__accordion-header ${openAccordion === item.key ? 'product-detail__accordion-header--open' : ''}`}
                  onClick={() => setOpenAccordion(openAccordion === item.key ? null : item.key)}
                  aria-expanded={openAccordion === item.key}
                >
                  <span className="product-detail__accordion-title">{item.title}</span>
                  <ChevronDownIcon size={18} />
                </button>
                {openAccordion === item.key && (
                  <div className="product-detail__accordion-content">
                    <p>{item.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
