import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
  {
    tagline: 'Traditional Handloom Craftsmanship',
    title: 'Woven by',
    titleAccent: 'Skilled Artisans',
    description: 'Watch tradition come alive — each thread carefully woven by Indian masters on age-old wooden looms.',
    // Artisan hands weaving on a loom — warm earthy threads, wooden loom texture
    image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=1400&q=90',
    overlayStyle: 'linear-gradient(105deg, rgba(0,0,0,0.85) 0%, rgba(10,5,0,0.65) 50%, rgba(0,0,0,0.20) 100%)',
    cta: 'Shop Now',
    ctaLink: '/products',
  },
  {
    tagline: 'Premium Handloom Collection',
    title: 'Heritage Fabrics,',
    titleAccent: 'Timeless Elegance',
    description: 'Vibrant sarees, rich dupattas, and exquisite bedsheets — handloom products crafted with devotion.',
    // Premium bedsheet / cotton fabric close-up — soft folds, warm tones
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&q=90',
    overlayStyle: 'linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(8,4,0,0.60) 50%, rgba(0,0,0,0.18) 100%)',
    cta: 'Explore Collection',
    ctaLink: '/collections',
  },
  {
    tagline: 'Pure Cotton · Made in India',
    title: 'Authentic Texture,',
    titleAccent: 'Pure Comfort',
    description: 'Eco-friendly handloom products that support 200+ local artisans and bring natural warmth to your home.',
    // Cozy folded blanket / quilt texture — warm earthy tones
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=90',
    overlayStyle: 'linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(5,3,0,0.68) 50%, rgba(0,0,0,0.22) 100%)',
    cta: 'View All Products',
    ctaLink: '/products',
  },
];

const STATS = [
  { value: '200+', label: 'Artisans' },
  { value: '5000+', label: 'Products' },
  { value: '25+', label: 'Years' },
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef(null);

  const goToSlide = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setAnimating(false), 700);
  }, [animating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  }, [currentSlide, goToSlide]);

  // Auto-slide with pause on hover
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4500);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovered]);

  return (
    <>
      <style>{`
        .hero-root {
          position: relative;
          height: 680px;
          overflow: hidden;
          background: #0a0a0a;
        }
        @media (min-width: 768px) { .hero-root { height: 720px; } }

        /* Slides */
        .hero-slide {
          position: absolute; inset: 0;
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .hero-slide.active  { opacity: 1;  transform: scale(1);     z-index: 2; }
        .hero-slide.inactive { opacity: 0; transform: scale(1.03);  z-index: 1; }

        /* BG image */
        .hero-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
        }
        /* Dark + gradient overlay */
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            105deg,
            rgba(0,0,0,0.82) 0%,
            rgba(0,0,0,0.60) 45%,
            rgba(0,0,0,0.25) 100%
          );
        }

        /* Content */
        .hero-content-wrap {
          position: relative; z-index: 3;
          height: 100%;
          display: flex; align-items: center;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .hero-content {
          max-width: 640px;
          transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
        }
        .hero-slide.active  .hero-content { opacity: 1; transform: translateY(0); }
        .hero-slide.inactive .hero-content { opacity: 0; transform: translateY(24px); }

        /* Tagline */
        .hero-tagline {
          display: inline-flex; align-items: center; gap: 8px;
          color: #f97316;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .hero-tagline::before {
          content: '';
          display: inline-block;
          width: 28px; height: 2px;
          background: #f97316; border-radius: 2px;
        }

        /* Heading */
        .hero-h1 {
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .hero-h1-accent {
          background: linear-gradient(90deg, #fb923c, #f97316);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }

        /* Description */
        .hero-desc {
          font-size: clamp(15px, 1.8vw, 18px);
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          margin-bottom: 32px;
          max-width: 500px;
        }

        /* CTA buttons */
        .hero-btns { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 40px; }
        .hero-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px; font-weight: 700;
          text-decoration: none;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          box-shadow: 0 6px 20px rgba(234,88,12,0.38);
          letter-spacing: 0.01em;
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 32px rgba(234,88,12,0.50);
        }
        .hero-btn-primary .arrow { transition: transform 0.2s ease; }
        .hero-btn-primary:hover .arrow { transform: translateX(4px); }

        .hero-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(10px);
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.35);
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px; font-weight: 600;
          text-decoration: none;
          transition: background 0.22s ease, border-color 0.22s ease, transform 0.22s ease;
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.6);
          transform: translateY(-2px);
        }

        /* Stats */
        .hero-stats {
          display: flex; gap: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.15);
        }
        .hero-stat-val {
          font-size: 26px; font-weight: 800; color: #fff;
          line-height: 1; margin-bottom: 4px;
        }
        .hero-stat-lbl {
          font-size: 12px; color: rgba(255,255,255,0.55);
          font-weight: 500; letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Arrows */
        .hero-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 10;
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 50%;
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, border-color 0.2s;
        }
        .hero-arrow:hover {
          background: rgba(234,88,12,0.7);
          border-color: #ea580c;
          transform: translateY(-50%) scale(1.1);
        }
        .hero-arrow-left  { left: 20px; }
        .hero-arrow-right { right: 20px; }
        @media (max-width: 640px) {
          .hero-arrow { width: 38px; height: 38px; }
          .hero-arrow-left  { left: 10px; }
          .hero-arrow-right { right: 10px; }
        }

        /* Dots */
        .hero-dots {
          position: absolute; bottom: 28px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 8px; z-index: 10;
        }
        .hero-dot {
          height: 6px; border-radius: 6px;
          background: rgba(255,255,255,0.40);
          cursor: pointer;
          transition: width 0.35s ease, background 0.3s ease;
          border: none; padding: 0;
        }
        .hero-dot.active { width: 32px; background: #f97316; }
        .hero-dot:not(.active) { width: 8px; }
        .hero-dot:not(.active):hover { background: rgba(255,255,255,0.75); }

        /* Scroll indicator */
        .hero-scroll {
          position: absolute; bottom: 28px; right: 28px;
          display: none; flex-direction: column; align-items: center; gap: 6px;
          z-index: 10;
        }
        @media (min-width: 768px) { .hero-scroll { display: flex; } }
        .hero-scroll-lbl {
          font-size: 10px; color: rgba(255,255,255,0.4);
          letter-spacing: 0.1em; text-transform: uppercase;
          writing-mode: vertical-rl;
        }
        .hero-scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5), transparent);
          animation: scrollLine 1.8s ease-in-out infinite;
        }
        @keyframes scrollLine {
          0%   { transform: scaleY(0); transform-origin: top; }
          50%  { transform: scaleY(1); transform-origin: top; }
          51%  { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>

      <div
        className="hero-root"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : 'inactive'}`}
          >
            <img src={slide.image} alt={slide.title} className="hero-img" loading={index === 0 ? 'eager' : 'lazy'} />
            <div className="hero-overlay" style={{ background: slide.overlayStyle }} />

            <div className="hero-content-wrap">
              <div className="hero-content">
                <p className="hero-tagline">{slide.tagline}</p>

                <h1 className="hero-h1">
                  {slide.title}
                  <span className="hero-h1-accent">{slide.titleAccent}</span>
                </h1>

                <p className="hero-desc">{slide.description}</p>

                <div className="hero-btns">
                  <Link to={slide.ctaLink} className="hero-btn-primary">
                    <FiShoppingBag size={18} />
                    {slide.cta}
                    <FiArrowRight size={16} className="arrow" />
                  </Link>
                  <Link to="/about" className="hero-btn-secondary">
                    Our Story
                  </Link>
                </div>

                <div className="hero-stats">
                  {STATS.map((s, i) => (
                    <div key={i}>
                      <p className="hero-stat-val">{s.value}</p>
                      <p className="hero-stat-lbl">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Left Arrow */}
        <button className="hero-arrow hero-arrow-left" onClick={prevSlide} aria-label="Previous slide">
          <FiChevronLeft size={22} />
        </button>

        {/* Right Arrow */}
        <button className="hero-arrow hero-arrow-right" onClick={nextSlide} aria-label="Next slide">
          <FiChevronRight size={22} />
        </button>

        {/* Dots */}
        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          <span className="hero-scroll-lbl">Scroll</span>
        </div>
      </div>
    </>
  );
};

export default HeroSection;