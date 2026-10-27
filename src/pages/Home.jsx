import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button, Card, Spinner, Badge, EmptyState } from '../components/ui'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Newsletter form state
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true)
        setError(null)
        const { data, error: err } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(4)
        
        if (err) throw err
        setFeaturedProducts(data || [])
      } catch (err) {
        console.error('Error fetching featured products:', err)
        setError(err.message || 'Failed to load featured products.')
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero hero-diagonal">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-eyebrow">HIGH-VELOCITY PERFORMANCE GEAR</span>
            <h1 className="hero-title">
              PRECISION-BUILT. <br />
              <span className="gradient-text">CHAMPIONSHIP-PROVEN.</span>
            </h1>
            <p className="hero-subhead">
              Zero hesitation. Full velocity. AMI engineers ice hockey sticks, field hockey gear, and pro-spec protective armor for elite athletes who demand the extra edge.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn btn-primary">
                SHOP THE LINEUP
              </Link>
              <Link to="/customizer" className="btn btn-secondary">
                BUILD YOUR STICK
              </Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">27</span>
                <div className="stat-underline"></div>
                <span className="stat-label">National Teams</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <div className="stat-underline"></div>
                <span className="stat-label">Carbon Layup</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">30+</span>
                <div className="stat-underline"></div>
                <span className="stat-label">Years R&D</span>
              </div>
            </div>
          </div>
          
          <div className="hero-media">
            <div className="hero-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1000&q=80" 
                alt="Elite Hockey Action" 
                className="hero-img img-cover"
              />
              <div className="hero-badge-ribbon">
                <span>PRO SERIES X9</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER WITH DIAMOND */}
      <div className="section-divider">
        <div className="divider-diamond"></div>
      </div>

      {/* 2. CATEGORY TILES BAND */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">CHOOSE YOUR DISCIPLINE</span>
            <h2>BUILT FOR EVERY POSITION ON THE ICE & FIELD</h2>
            <p className="section-sub">Select a category to explore ultra-precise sticks, helmets, and armor engineered for total dominance.</p>
          </div>

          <div className="grid-4 categories-grid">
            <Link to="/catalog?category=Ice Hockey Sticks" className="category-tile">
              <img 
                src="https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=600&q=80" 
                alt="Ice Hockey Sticks" 
                className="tile-img"
              />
              <div className="tile-overlay">
                <h3>ICE HOCKEY STICKS</h3>
                <span className="tile-action">Explore Collection →</span>
              </div>
            </Link>

            <Link to="/catalog?category=Field Hockey Sticks" className="category-tile">
              <img 
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80" 
                alt="Field Hockey Sticks" 
                className="tile-img"
              />
              <div className="tile-overlay">
                <h3>FIELD HOCKEY</h3>
                <span className="tile-action">Explore Collection →</span>
              </div>
            </Link>

            <Link to="/catalog?category=Helmets & Protection" className="category-tile">
              <img 
                src="https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=600&q=80" 
                alt="Helmets & Protective Kit" 
                className="tile-img"
              />
              <div className="tile-overlay">
                <h3>HELMETS & PROTECTIVE</h3>
                <span className="tile-action">Explore Collection →</span>
              </div>
            </Link>

            <Link to="/customizer" className="category-tile highlight-tile">
              <div className="tile-content-box">
                <span className="badge badge-primary">CUSTOM LAB</span>
                <h3>CUSTOM STICK BUILDER</h3>
                <p>Select your exact flex, blade curve, grip weave, and personalized laser engraving.</p>
                <span className="tile-action">Launch Builder →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER WITH DIAMOND */}
      <div className="section-divider">
        <div className="divider-diamond"></div>
      </div>

      {/* 3. FEATURED PRODUCTS (LIVE SUPABASE DATA) */}
      <section className="section featured-products-section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">FLAGSHIP ARSENAL</span>
            <h2>THE STICKS EVERYONE IS TALKING ABOUT</h2>
            <p className="section-sub">Tested past the point of structural failure. Built for immediate snap and zero energy loss.</p>
          </div>

          {loading && (
            <div className="loading-state">
              <Spinner size="lg" />
              <p>Fetching pro gear from lab database...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <h4>Unable to load products</h4>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && featuredProducts.length === 0 && (
            <EmptyState
              icon="🏒"
              title="No Featured Gear Found"
              description="Our store catalog is currently being restocked. Check out the full lineup in the catalog."
              action={
                <Link to="/catalog" className="btn btn-primary">
                  View Full Catalog
                </Link>
              }
            />
          )}

          {!loading && !error && featuredProducts.length > 0 && (
            <div className="grid-4 products-grid">
              {featuredProducts.map((prod) => (
                <div key={prod.id} className="product-card">
                  <div className="card-top-bar"></div>
                  {prod.is_featured && (
                    <span className="pro-ribbon">PRO SERIES</span>
                  )}
                  <div className="product-image-box">
                    <img 
                      src={prod.image_url || "https://picsum.photos/seed/hockey/500/500"} 
                      alt={prod.name} 
                      className="product-img"
                    />
                  </div>
                  <div className="product-card-body">
                    <div className="product-meta">
                      <span className="product-category">{prod.category}</span>
                      {prod.rating && (
                        <span className="product-rating">★ {Number(prod.rating).toFixed(1)}</span>
                      )}
                    </div>
                    <h3 className="product-title">{prod.name}</h3>
                    <p className="product-desc">{prod.description}</p>
                    <div className="product-card-footer">
                      <span className="product-price">${Number(prod.price).toFixed(2)}</span>
                      <Link to="/catalog" className="btn btn-secondary btn-sm">
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="center-action-wrapper">
            <Link to="/catalog" className="btn btn-primary btn-lg">
              EXPLORE ALL GEAR ({featuredProducts.length}+ ITEMS)
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER WITH DIAMOND */}
      <div className="section-divider">
        <div className="divider-diamond"></div>
      </div>

      {/* 4. TECH & INNOVATION SHOWCASE */}
      <section className="section tech-section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">PROPRIETARY ENGINEERING</span>
            <h2>THE SCIENCE BEHIND THE SNAP</h2>
            <p className="section-sub">Every millimeter of dynamic carbon flex is calculated to increase shot velocity and blade durability.</p>
          </div>

          <div className="grid-3 features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>CarbonFlex™ 18K Weave</h3>
              <p>Ultra-lightweight Japanese carbon fibers woven at precise 45-degree angles to maximize torque transfer and eliminate shaft twist.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Precision Low-Kick Point</h3>
              <p>Engineered flex zone situated near the bottom taper allows lightning-quick loading for instant wrist shots and high-velocity one-timers.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>ExoBlade Dampening Core</h3>
              <p>Dual-density internal foam core dampens vibration upon puck impact while stabilizing the toe for laser-focused precision.</p>
            </div>
          </div>

          <div className="tech-banner">
            <div className="tech-banner-content">
              <h3>STRESS-TESTED PAST 10,000 SLAP SHOTS</h3>
              <p>Our lab testing ensures that AMI gear survives intense impact, heavy checks, and freeze-thaw chamber conditions without micro-fracturing.</p>
            </div>
            <Link to="/customizer" className="btn btn-primary">
              CUSTOMIZE YOUR FLEX
            </Link>
          </div>
        </div>
      </section>

      {/* 5. ATHLETE ENDORSEMENT & CREDIBILITY */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-head">
            <span className="section-label">CHAMPIONSHIP TESTED</span>
            <h2>TRUSTED BY THE PLAYERS WHO CAN'T AFFORD TO LOSE</h2>
          </div>

          <div className="grid-3 testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-quote">
                "AMI sticks don't just feel different — they score different. The pop off the blade on snap shots is unlike anything else on the market."
              </p>
              <div className="testimonial-author">
                <div className="author-info">
                  <strong>Marcus Hartley</strong>
                  <span>National League Forward</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                "We outfitted our entire field hockey squad with AMI Pro Field sticks this season. The weight balance and head rigidity gave us a huge edge."
              </p>
              <div className="testimonial-author">
                <div className="author-info">
                  <strong>Elena Rostova</strong>
                  <span>Head Coach, Premier Field Club</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                "The impact resistance on the helmet armor saved me twice last month. Heavy duty, comfortable, and zero vision obstruction."
              </p>
              <div className="testimonial-author">
                <div className="author-info">
                  <strong>Devon Vance</strong>
                  <span>Pro Goalie / Defensive Specialist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER & CALL TO ACTION */}
      <section className="cta-section">
        <div className="container container-narrow text-center">
          <span className="eyebrow">JOIN THE ROSTER</span>
          <h2>GEAR UP WITH AMI ELITE</h2>
          <p>
            Subscribe for early access to limited edition stick releases, pro athlete drills, and team discount programs.
          </p>

          {subscribed ? (
            <div className="alert alert-success">
              <h4>You're on the roster!</h4>
              <p>Thank you for subscribing. We will send updates on our next limited gear drop.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="btn btn-primary">
                JOIN NOW
              </button>
            </form>
          )}

          <p className="disclaimer-note">
            No spam. We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  )
}