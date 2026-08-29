import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/UI/Button/Button';
import {
  LocationIcon,
  PhoneIcon,
  MailIcon,
  WhatsAppIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ShieldIcon,
} from '../../assets/icons';
import './Contact.css';

const Contact = () => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      showToast('Thank you! Your message has been sent to our concierge team.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const faqs = [
    {
      q: 'How long does domestic and international delivery take?',
      a: 'Domestic express delivery within India typically arrives within 3-5 business days. International deliveries to USA, UK, UAE, and 25+ countries take 5-8 business days with full end-to-end tracking.',
    },
    {
      q: 'Do you offer custom blouse stitching and fall/pico service?',
      a: 'Yes! Complimentary fall & pico is provided with every saree. We also offer bespoke blouse stitching with customizable necklines and sleeve styles via our WhatsApp stylist concierge.',
    },
    {
      q: 'Can I book a private virtual video shopping appointment?',
      a: 'Certainly. You can connect with our senior saree draper on video call to inspect real fabric drapes, zari shimmer, and pleating in live HD lighting before placing your order.',
    },
    {
      q: 'What is the return and exchange window?',
      a: 'We offer an easy 48-hour return and exchange window from the date of delivery. Simply initiate a return from your Account Dashboard for free doorstep courier pickup.',
    },
  ];

  return (
    <main className="contact-page" id="contact-page">
      {/* Hero Banner */}
      <section className="contact-hero" aria-label="Contact Saaryans">
        <div className="container">
          <span className="contact-hero__tagline">WE ARE AT YOUR SERVICE</span>
          <h1 className="contact-hero__title">Contact Our Concierge</h1>
          <p className="contact-hero__desc">
            Have a question about a weave, sizing, bespoke bridal orders, or shipping?
            Reach our luxury heritage stylists directly.
          </p>
        </div>
      </section>

      <div className="container contact-main-container">
        <div className="contact-grid">
          {/* Left Column: Direct Info & Flagship Address */}
          <aside className="contact-info-card" aria-label="Contact Information">
            <h2 className="contact-info__heading">The Heritage Flagship</h2>
            <p className="contact-info__subtext">
              Visit our luxury boutique or get in touch through any of our direct care channels.
            </p>

            <div className="contact-details-list">
              <div className="contact-detail-item">
                <div className="detail-icon">
                  <LocationIcon size={20} />
                </div>
                <div className="detail-text">
                  <strong>Flagship Boutique</strong>
                  <p>4th Floor, Saaryans Silk, SG Highway, Bodakdev, Ahmedabad, Gujarat - 380015</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="detail-icon">
                  <PhoneIcon size={20} />
                </div>
                <div className="detail-text">
                  <strong>Direct & International Helpline</strong>
                  <p>+91 12345 67890 / +91 98765 43210</p>
                  <span className="detail-hours">Mon - Sat: 10:00 AM - 08:30 PM (IST)</span>
                </div>
              </div>

              <div className="contact-detail-item">
                <div className="detail-icon">
                  <MailIcon size={20} />
                </div>
                <div className="detail-text">
                  <strong>Client Care & Inquiries</strong>
                  <p>care@saaryans.com</p>
                  <p>bespoke@saaryans.com (Bridal & Custom)</p>
                </div>
              </div>
            </div>

            {/* WhatsApp Direct Stylist */}
            <div className="whatsapp-concierge-box">
              <div className="whatsapp-concierge-icon">
                <WhatsAppIcon size={28} />
              </div>
              <div className="whatsapp-concierge-info">
                <strong>Instant WhatsApp Styling</strong>
                <p>Chat with our lead saree draper for real-time recommendations and video showcases.</p>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-chat-link"
                >
                  START WHATSAPP CHAT ›
                </a>
              </div>
            </div>
          </aside>

          {/* Right Column: Contact Message Form */}
          <section className="contact-form-section" aria-label="Send Inquiry">
            <div className="contact-form-card">
              <h2 className="form-card-title">Send Us a Message</h2>
              <p className="form-card-subtitle">
                Fill out the form below and our client specialist will get back to you within 2 hours.
              </p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row-2">
                  <div className="contact-field">
                    <label htmlFor="contact-name">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-email">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="e.g. priya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="contact-field">
                    <label htmlFor="contact-phone">Phone Number (Optional)</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-subject">Inquiry Type *</label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="contact-select"
                    >
                      <option value="General Inquiry">General Product Inquiry</option>
                      <option value="Custom Blouse Stitching">Custom Blouse Stitching / Tailoring</option>
                      <option value="Bridal Appointment">Bridal Video Consultation</option>
                      <option value="Order Status">Order Status & Shipping Tracking</option>
                      <option value="Bulk Orders">Bulk / Festive Trousseau Orders</option>
                    </select>
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-message">Your Message / Special Requests *</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Tell us how we can assist you with your saree choice..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} id="contact-submit-btn">
                  {isSubmitting ? 'SENDING INQUIRY...' : 'SEND MESSAGE'}
                </Button>
              </form>
            </div>
          </section>
        </div>

        {/* FAQs Section */}
        <section className="contact-faqs" aria-label="Frequently Asked Questions">
          <div className="faqs-header">
            <span className="section-eyebrow">HELP & ASSISTANCE</span>
            <h2 className="faqs-title">Frequently Asked Questions</h2>
          </div>

          <div className="faqs-accordion-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-header ${openFaq === index ? 'faq-header--open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                >
                  <span className="faq-question">{faq.q}</span>
                  <ChevronDownIcon size={20} />
                </button>
                {openFaq === index && (
                  <div className="faq-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Contact;
