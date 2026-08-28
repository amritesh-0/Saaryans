import { useState } from 'react';
import { MailIcon } from '../../../assets/icons';
import Button from '../../UI/Button/Button';
import newsletterBanner from '../../../assets/images/newsletter-banner.jpg';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <section className="newsletter" id="newsletter" aria-label="Newsletter subscription">
      <div className="container">
        <div className="newsletter__card">
          <div className="newsletter__image-wrapper">
            <img
              src={newsletterBanner}
              alt="Saaryans collection"
              className="newsletter__image"
              loading="lazy"
            />
          </div>
          <div className="newsletter__content">
            <div className="newsletter__icon">
              <MailIcon size={56} />
            </div>
            <h2 className="newsletter__title">BE THE FIRST TO KNOW</h2>
            <p className="newsletter__subtitle">JOIN THE OUR SAARYANS FAMILY</p>
            {isSubmitted ? (
              <div className="newsletter__success">
                Thank you for subscribing! ✨
              </div>
            ) : (
              <form className="newsletter__form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="newsletter-email"
                />
                <Button type="submit" variant="primary" size="md">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
