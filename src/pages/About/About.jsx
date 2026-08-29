import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import { ShieldIcon, TruckIcon, SupportIcon, CheckCircleIcon } from '../../assets/icons';
import heroBanner from '../../assets/images/hero-banner.jpg';
import newArrivalsBanner from '../../assets/images/new-arrivals-banner.jpg';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <main className="about-page" id="about-page">
      {/* Hero Banner Section */}
      <section className="about-hero" aria-label="About Saaryans">
        <div className="container">
          <div className="about-hero__content">
            <span className="about-hero__tagline">HERITAGE • ELEGANCE • CRAFTSMANSHIP</span>
            <h1 className="about-hero__title">The Story of Saaryans</h1>
            <p className="about-hero__desc">
              Weaving timeless royal heritage into contemporary elegance. Every fold, thread, and zari weave
              carries centuries of Indian artisanal mastery.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Journey Section */}
      <section className="about-story container">
        <div className="about-story__grid">
          <div className="about-story__image-wrap">
            <img src={heroBanner} alt="Saaryans Silk Weaving" className="about-story__img" />
            <div className="about-story__badge">
              <span className="badge-years">100%</span>
              <span className="badge-text">Authentic Handloom Weaves</span>
            </div>
          </div>

          <div className="about-story__content">
            <span className="section-eyebrow">OUR PHILOSOPHY</span>
            <h2 className="about-story__heading">Preserving the Royal Art of Indian Handlooms</h2>
            <p className="about-story__text">
              Born with a deep reverence for India's rich textile heritage, <strong>SAARYANS</strong> was founded to bring
              the finest handcrafted sarees directly from the historic loom cities of Varanasi, Kanchipuram, Surat,
              and Chanderi to discerning women across the world.
            </p>
            <p className="about-story__text">
              A saree is not merely an attire; it is an emotion passed down through generations—a mother’s wedding heirloom,
              a festive celebration, and an undeniable expression of grace. At Saaryans, we celebrate this enduring legacy
              by ensuring that every piece in our collection is crafted with authentic pure silks, intricate real zari,
              and painstaking hand-embroidery.
            </p>

            <div className="about-story__highlights">
              <div className="highlight-item">
                <CheckCircleIcon size={20} />
                <span>Direct collaboration with 1,200+ master weavers</span>
              </div>
              <div className="highlight-item">
                <CheckCircleIcon size={20} />
                <span>Certified Pure Silk mark and gold standard quality checks</span>
              </div>
              <div className="highlight-item">
                <CheckCircleIcon size={20} />
                <span>Custom tailoring and personal drapery consultation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Excellence */}
      <section className="about-pillars">
        <div className="container">
          <div className="pillars-header">
            <span className="section-eyebrow">WHY CONNOISSEURS CHOOSE US</span>
            <h2 className="pillars-title">The Four Pillars of Saaryans</h2>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">
                <ShieldIcon size={32} />
              </div>
              <h3 className="pillar-card__title">Authentic Heritage</h3>
              <p className="pillar-card__text">
                Every weave is ethically sourced from certified master weavers. We champion real Banarasi, Kanjivaram, and Gaji silk traditions.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <CheckCircleIcon size={32} />
              </div>
              <h3 className="pillar-card__title">Uncompromising Quality</h3>
              <p className="pillar-card__text">
                Each drape undergoes a 7-point quality inspection ensuring zero blemishes, perfect zari tension, and luxurious tactile handfeel.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <TruckIcon size={32} />
              </div>
              <h3 className="pillar-card__title">Global Express Delivery</h3>
              <p className="pillar-card__text">
                Complimentary insured shipping across India and reliable door-to-door express delivery to over 25 countries worldwide.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <SupportIcon size={32} />
              </div>
              <h3 className="pillar-card__title">Stylist Concierge</h3>
              <p className="pillar-card__text">
                Enjoy personalized bridal consultations, custom blouse stitching, and 1-on-1 WhatsApp styling sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="about-stats container">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">50,000+</span>
            <span className="stat-label">Happy Global Patrons</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">1,200+</span>
            <span className="stat-label">Artisan Families Supported</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">25+</span>
            <span className="stat-label">Countries Served</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">4.9 / 5</span>
            <span className="stat-label">Customer Satisfaction</span>
          </div>
        </div>
      </section>

      {/* Founder Quote & CTA */}
      <section className="about-cta container">
        <div className="about-cta__card">
          <div className="about-cta__content">
            <blockquote className="founder-quote">
              "The six-yard saree is an eternal poem in silk. Our mission is to keep India's glorious weaving legacy alive, celebrated, and cherished in every modern wardrobe."
            </blockquote>
            <span className="founder-name">— The House of Saaryans</span>
            <div className="cta-action">
              <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                EXPLORE OUR ROYAL COLLECTION
              </Button>
            </div>
          </div>
          <div className="about-cta__image-wrap">
            <img src={newArrivalsBanner} alt="Saaryans Bridal Weaves" className="about-cta__img" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
