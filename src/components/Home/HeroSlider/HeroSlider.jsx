import { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../assets/icons';
import Button from '../../UI/Button/Button';
import heroBanner from '../../../assets/images/hero-banner.jpg';
import './HeroSlider.css';

const slides = [
  {
    id: 1,
    image: heroBanner,
    subtitle: 'CELEBRATE',
    title: 'EVERY OCCASION\nWITH ETHNIC\nGRACE',
    cta: 'SHOP NOW',
  },
  {
    id: 2,
    image: heroBanner,
    subtitle: 'DISCOVER',
    title: 'TIMELESS\nELEGANCE IN\nEVERY THREAD',
    cta: 'EXPLORE',
  },
  {
    id: 3,
    image: heroBanner,
    subtitle: 'EXPERIENCE',
    title: 'THE ART OF\nINDIAN\nCRAFTSMANSHIP',
    cta: 'VIEW COLLECTION',
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="hero" id="hero-slider" aria-label="Hero banner">
      <div className="hero__slides">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero__slide ${index === currentSlide ? 'hero__slide--active' : ''}`}
          >
            <img
              src={slide.image}
              alt=""
              className="hero__image"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="hero__overlay" />
            <div className="hero__content container">
              <div className="hero__text">
                <span className="hero__subtitle">{slide.subtitle}</span>
                <h1 className="hero__title">
                  {slide.title.split('\n').map((line, i) => (
                    <span key={i} className="hero__title-line">
                      {line}
                      {i < slide.title.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </h1>
                <Button variant="primary" size="lg">
                  {slide.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="hero__arrow hero__arrow--left" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeftIcon size={32} />
      </button>
      <button className="hero__arrow hero__arrow--right" onClick={nextSlide} aria-label="Next slide">
        <ChevronRightIcon size={32} />
      </button>

      {/* Dots */}
      <div className="hero__dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`hero__dot ${index === currentSlide ? 'hero__dot--active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
