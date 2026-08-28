import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

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
      content: 'Free shipping on all orders. Easy returns within 48 hours of delivery. Items must be in original condition with tags attached. Refund will be processed within 5-7 business days.',
    },
    {
      key: 'faqs',
      title: 'FAQs',
      content: 'Q: Is the blouse piece included? A: Yes, an unstitched blouse piece is included. Q: Can I get custom stitching? A: Yes, we offer custom blouse stitching at an additional cost. Contact us for details.',
    },
  ];

  return (
    <main className="product-detail" id="product-detail-page">
      {/* Breadcrumb */}
      <nav className="product-detail__breadcrumb container" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="product-detail__breadcrumb-sep">›</span>
        <Link to={`/category/${product.category.toLowerCase()}`}>{product.category}</Link>
        <span className="product-detail__breadcrumb-sep">›</span>
        <Link to="#">{product.subcategory}</Link>
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
              className={`product-detail__wishlist-btn ${isWishlisted ? 'product-detail__wishlist-btn--active' : ''}`}
              onClick={() => setIsWishlisted(!isWishlisted)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <HeartIcon size={22} filled={isWishlisted} />
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
            <h3 className="product-detail__sizes-title">SIZE</h3>
            <div className="product-detail__size-options">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`product-detail__size-btn ${selectedSize === size ? 'product-detail__size-btn--active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
              <button className="product-detail__size-btn product-detail__size-btn--custom">
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
            <Button variant="outlined" size="lg" fullWidth>
              ADD TO CART
            </Button>
            <Button variant="primary" size="lg" fullWidth>
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
              <span>100% purchase protection</span>
            </div>
            <div className="product-detail__trust-item">
              <CheckCircleIcon size={20} />
              <span>Assured Quality</span>
            </div>
            <div className="product-detail__trust-item">
              <ReturnIcon size={20} />
              <span>48 hours easy return</span>
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
