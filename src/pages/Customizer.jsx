import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Badge, Alert, Stat } from '../components/ui'

const FLEX_OPTIONS = [
  { value: 55, label: '55 Flex (Junior/Light)', desc: 'Quick release, effortless whip for lighter players' },
  { value: 65, label: '65 Flex (Intermediate)', desc: 'Ideal for fast wrist shots and agility' },
  { value: 77, label: '77 Flex (Regular)', desc: 'Balanced pop for versatile playmakers' },
  { value: 85, label: '85 Flex (Stiff)', desc: 'Maximum power transfer for heavy slapshots' },
  { value: 102, label: '102 Flex (Extra Stiff)', desc: 'Pro-grade rigidity for maximum force' }
]

const CURVE_OPTIONS = [
  { id: 'P92', name: 'P92 - Matthews / Backstrom', pattern: 'Mid Curve', face: 'Open', lie: 6, desc: 'Most popular all-around pattern. Great for quick toe-drags and elevated shots.' },
  { id: 'P28', name: 'P28 - McDavid / Eichel', pattern: 'Toe Curve', face: 'Open', lie: 5.5, desc: 'Aggressive toe hook engineered for modern toe-load snipers and high-speed release.' },
  { id: 'P88', name: 'P88 - Kane / Ovechkin', pattern: 'Mid-Heel Curve', face: 'Slightly Open', lie: 6, desc: 'Classic puck control curve. Outstanding backhand accuracy and stickhandling.' },
  { id: 'P02', name: 'P02 - Lidstrom / Square Toe', pattern: 'Heel Curve', face: 'Open', lie: 5, desc: 'Defenseman favorite. Maximum surface area for shot blocking and clearing.' }
]

const GRIP_FINISHES = [
  { id: 'tactile-tack', name: 'Tactile Micro-Tack', price: 0, desc: 'Raised spiral ridge texture for non-slip lock during high-velocity wrist snaps.' },
  { id: 'matte-velvet', name: 'Matte Smooth Velvet', price: 0, desc: 'Ultra-clean finish for rapid hand transitions along the shaft.' },
  { id: 'griptoner-pro', name: 'GripToner™ 3D Matrix', price: 15, desc: '3D printed carbon lattice pattern offering targeted thumb and palm traction.' }
]

const SHAFT_GEOMETRIES = [
  { id: 'traditional', name: 'Square Traditional', desc: 'Square corners with double concave sidewalls for traditional heavy feel.' },
  { id: 'ergonomic', name: 'Ergo-Vee™ Rounded', desc: 'Slightly rounded corners conforming naturally to palm anatomy.' }
]

const COLOR_SCHEMES = [
  { id: 'stealth-black', name: 'Stealth Matte Black / Crimson Red', primary: '#C8102E', secondary: '#0B1220' },
  { id: 'ice-blue', name: 'Glacier Blue / Deep Navy', primary: '#00B4D8', secondary: '#0A2E5C' },
  { id: 'gold-champion', name: 'Championship Gold / Obsidian', primary: '#D4AF37', secondary: '#111111' },
  { id: 'raw-carbon', name: 'Raw Carbon Weave / Crimson Spec', primary: '#E63946', secondary: '#2B2D42' }
]

export default function Customizer() {
  const navigate = useNavigate()

  // Configuration state
  const [flex, setFlex] = useState(77)
  const [curve, setCurve] = useState('P92')
  const [grip, setGrip] = useState('tactile-tack')
  const [geometry, setGeometry] = useState('ergonomic')
  const [colorScheme, setColorScheme] = useState('stealth-black')
  const [customText, setCustomText] = useState('AMI-PRO-2025')
  const [playerNumber, setPlayerNumber] = useState('88')
  const [hand, setHand] = useState('Left')
  
  // Customizer UI State
  const [activeTab, setActiveTab] = useState('specs') // specs | aesthetic | review
  const [addedNotice, setAddedNotice] = useState(false)

  // Calculations
  const basePrice = 289.99
  const selectedGrip = GRIP_FINISHES.find(g => g.id === grip)
  const gripExtra = selectedGrip ? selectedGrip.price : 0
  const totalPrice = basePrice + gripExtra

  const selectedCurveObj = useMemo(() => CURVE_OPTIONS.find(c => c.id === curve), [curve])
  const selectedColorObj = useMemo(() => COLOR_SCHEMES.find(c => c.id === colorScheme), [colorScheme])

  const handleAddToCart = () => {
    const customStickConfig = {
      id: `custom-stick-${Date.now()}`,
      name: `AMI VELOCITY Custom Lab Stick (${curve} / ${flex} Flex)`,
      category: 'Ice Hockey Sticks',
      price: totalPrice,
      image_url: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&q=80&w=800',
      specs: {
        Flex: `${flex} Flex`,
        Curve: curve,
        Hand: hand,
        Grip: selectedGrip?.name,
        Geometry: SHAFT_GEOMETRIES.find(g => g.id === geometry)?.name,
        'Custom Text': `${customText} #${playerNumber}`,
        'Color Theme': selectedColorObj?.name
      }
    }

    // Persist custom item to local storage cart
    const existingCart = JSON.parse(localStorage.getItem('ami_cart') || '[]')
    existingCart.push(customStickConfig)
    localStorage.setItem('ami_cart', JSON.stringify(existingCart))

    setAddedNotice(true)
    setTimeout(() => {
      navigate('/checkout')
    }, 1200)
  }

  return (
    <div className="customizer-page">
      {/* HEADER HERO */}
      <section className="customizer-hero">
        <div className="container">
          <div className="customizer-hero-content">
            <span className="eyebrow">LABORATORY & CUSTOMIZATION STUDIO</span>
            <h1 className="hero-title">ENGINEER YOUR EDGE</h1>
            <p className="hero-subtitle">
              Precision flex points, bespoke carbon layups, and personalized shaft laser-etching. Built exactly to your game specifications in our lab.
            </p>
          </div>
        </div>
      </section>

      {/* MAIN BUILDER WORKSPACE */}
      <section className="section customizer-workspace">
        <div className="container">
          {addedNotice && (
            <Alert variant="success" title="Stick Spec Saved!">
              Your custom AMI Velocity stick configuration has been saved. Transferring you to checkout...
            </Alert>
          )}

          <div className="builder-layout">
            {/* LEFT COLUMN: LIVE PREVIEW & VISUALIZER */}
            <div className="preview-column">
              <div className="preview-card">
                <div className="preview-badge-bar">
                  <Badge variant="primary">CUSTOM PRO BUILD</Badge>
                  <span className="preview-spec-tag">{hand} Handed • {flex} Flex</span>
                </div>

                <div className="stick-visualizer" style={{ borderColor: selectedColorObj?.primary }}>
                  <div className="stick-graphic" style={{ background: `linear-gradient(135deg, ${selectedColorObj?.secondary} 0%, #1a1e29 100%)` }}>
                    <div className="stick-accent-stripe" style={{ backgroundColor: selectedColorObj?.primary }} />
                    <div className="stick-brand-logo">AMI VELOCITY X-PRO</div>
                    <div className="stick-laser-text">
                      <span className="player-name">{customText || 'YOUR NAME'}</span>
                      <span className="player-num">#{playerNumber || '00'}</span>
                    </div>
                    <div className="stick-blade-spec">
                      <span className="blade-curve-tag">{curve}</span>
                      <span className="blade-flex-tag">{flex} F</span>
                    </div>
                  </div>
                </div>

                {/* LIVE SPEC OVERVIEW */}
                <div className="live-specs-grid">
                  <div className="spec-metric">
                    <span className="spec-label">CURVE PATTERN</span>
                    <span className="spec-val">{selectedCurveObj?.id} ({selectedCurveObj?.pattern})</span>
                  </div>
                  <div className="spec-metric">
                    <span className="spec-label">HANDEDNESS</span>
                    <span className="spec-val">{hand} Hand</span>
                  </div>
                  <div className="spec-metric">
                    <span className="spec-label">SHAFT SHAPE</span>
                    <span className="spec-val">{SHAFT_GEOMETRIES.find(g => g.id === geometry)?.name}</span>
                  </div>
                  <div className="spec-metric">
                    <span className="spec-label">GRIP FINISH</span>
                    <span className="spec-val">{selectedGrip?.name}</span>
                  </div>
                </div>

                <div className="price-checkout-card">
                  <div className="price-row">
                    <div className="price-details">
                      <span className="price-label">Custom Build Total</span>
                      <span className="price-amount">${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={handleAddToCart}
                      className="build-cta-btn"
                    >
                      Lock In Spec & Purchase
                    </Button>
                  </div>
                  <p className="price-footnote">
                    ⚡ Built on demand. Hand-checked by master stick technicians before shipping within 5 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CONFIGURATION CONTROLS */}
            <div className="controls-column">
              {/* TAB NAVIGATION */}
              <div className="customizer-tabs">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  1. Performance Specs
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'aesthetic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('aesthetic')}
                >
                  2. Branding & Colors
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
                  onClick={() => setActiveTab('review')}
                >
                  3. Lab Summary
                </button>
              </div>

              {/* STEP 1: PERFORMANCE SPECS */}
              {activeTab === 'specs' && (
                <div className="tab-content animate-in">
                  <div className="config-group">
                    <h3 className="config-title">1. Select Handedness</h3>
                    <div className="toggle-options grid-2">
                      <button
                        type="button"
                        className={`option-card ${hand === 'Left' ? 'selected' : ''}`}
                        onClick={() => setHand('Left')}
                      >
                        <span className="option-name">Left Hand</span>
                        <span className="option-sub">Bottom hand is Left</span>
                      </button>
                      <button
                        type="button"
                        className={`option-card ${hand === 'Right' ? 'selected' : ''}`}
                        onClick={() => setHand('Right')}
                      >
                        <span className="option-name">Right Hand</span>
                        <span className="option-sub">Bottom hand is Right</span>
                      </button>
                    </div>
                  </div>

                  <div className="config-group">
                    <h3 className="config-title">2. Choose Flex Rating</h3>
                    <p className="config-help">Flex indicates the force in pounds required to bend the shaft 1 inch.</p>
                    <div className="flex-stack">
                      {FLEX_OPTIONS.map((f) => (
                        <div
                          key={f.value}
                          className={`flex-row-card ${flex === f.value ? 'selected' : ''}`}
                          onClick={() => setFlex(f.value)}
                        >
                          <div className="flex-value-badge">{f.value}</div>
                          <div className="flex-info">
                            <span className="flex-label">{f.label}</span>
                            <span className="flex-desc">{f.desc}</span>
                          </div>
                          <input 
                            type="radio" 
                            name="flex-select" 
                            checked={flex === f.value} 
                            onChange={() => setFlex(f.value)} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="config-group">
                    <h3 className="config-title">3. Blade Curve Pattern</h3>
                    <div className="curve-grid">
                      {CURVE_OPTIONS.map((c) => (
                        <div
                          key={c.id}
                          className={`curve-card ${curve === c.id ? 'selected' : ''}`}
                          onClick={() => setCurve(c.id)}
                        >
                          <div className="curve-header">
                            <span className="curve-id">{c.id}</span>
                            <span className="curve-pattern">{c.pattern}</span>
                          </div>
                          <div className="curve-name">{c.name}</div>
                          <p className="curve-desc">{c.desc}</p>
                          <div className="curve-meta">
                            <span>Lie: {c.lie}</span> • <span>Face: {c.face}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="tab-footer">
                    <Button variant="secondary" onClick={() => setActiveTab('aesthetic')}>
                      Next: Branding & Colors →
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: AESTHETIC & PERSONALIZATION */}
              {activeTab === 'aesthetic' && (
                <div className="tab-content animate-in">
                  <div className="config-group">
                    <h3 className="config-title">4. Grip & Shaft Texture</h3>
                    <div className="grip-options">
                      {GRIP_FINISHES.map((g) => (
                        <div
                          key={g.id}
                          className={`option-card-wide ${grip === g.id ? 'selected' : ''}`}
                          onClick={() => setGrip(g.id)}
                        >
                          <div className="option-header">
                            <span className="option-title-text">{g.name}</span>
                            <span className="option-price-tag">
                              {g.price === 0 ? 'Included' : `+$${g.price}.00`}
                            </span>
                          </div>
                          <p className="option-body-text">{g.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="config-group">
                    <h3 className="config-title">5. Shaft Geometry</h3>
                    <div className="geometry-grid grid-2">
                      {SHAFT_GEOMETRIES.map((geom) => (
                        <div
                          key={geom.id}
                          className={`option-card ${geometry === geom.id ? 'selected' : ''}`}
                          onClick={() => setGeometry(geom.id)}
                        >
                          <span className="option-name">{geom.name}</span>
                          <span className="option-sub">{geom.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="config-group">
                    <h3 className="config-title">6. Color Scheme Theme</h3>
                    <div className="color-schemes-grid">
                      {COLOR_SCHEMES.map((scheme) => (
                        <button
                          type="button"
                          key={scheme.id}
                          className={`color-scheme-tile ${colorScheme === scheme.id ? 'selected' : ''}`}
                          onClick={() => setColorScheme(scheme.id)}
                        >
                          <div className="color-swatch-pair">
                            <span style={{ backgroundColor: scheme.primary }} />
                            <span style={{ backgroundColor: scheme.secondary }} />
                          </div>
                          <span className="scheme-name">{scheme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="config-group">
                    <h3 className="config-title">7. Laser Etched Name & Number</h3>
                    <p className="config-help">Direct precision laser incision into the upper spine carbon matrix.</p>
                    <div className="laser-inputs-grid grid-2">
                      <div className="input-field">
                        <label className="field-label">PLAYER NAME / BRANDING</label>
                        <input
                          type="text"
                          maxLength={18}
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                          placeholder="e.g. D. McDAVID"
                          className="custom-text-input"
                        />
                      </div>
                      <div className="input-field">
                        <label className="field-label">JERSEY NUMBER</label>
                        <input
                          type="text"
                          maxLength={3}
                          value={playerNumber}
                          onChange={(e) => setPlayerNumber(e.target.value)}
                          placeholder="97"
                          className="custom-text-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="tab-footer">
                    <Button variant="ghost" onClick={() => setActiveTab('specs')}>
                      ← Back to Specs
                    </Button>
                    <Button variant="secondary" onClick={() => setActiveTab('review')}>
                      Review Full Build →
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: LAB SUMMARY */}
              {activeTab === 'review' && (
                <div className="tab-content animate-in">
                  <div className="config-group">
                    <h3 className="config-title">Bespoke Production Summary</h3>
                    <p className="config-help">Please verify your custom specs before routing to production.</p>
                    
                    <div className="summary-specs-list">
                      <div className="summary-row">
                        <span className="summary-key">Base Platform</span>
                        <span className="summary-val">AMI Velocity X-Pro Carbon Frame</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-key">Handedness</span>
                        <span className="summary-val">{hand} Hand</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-key">Flex Profile</span>
                        <span className="summary-val">{flex} Flex ({FLEX_OPTIONS.find(f => f.value === flex)?.label})</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-key">Curve Pattern</span>
                        <span className="summary-val">{selectedCurveObj?.id} - {selectedCurveObj?.name}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-key">Shaft Geometry</span>
                        <span className="summary-val">{SHAFT_GEOMETRIES.find(g => g.id === geometry)?.name}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-key">Grip Texture</span>
                        <span className="summary-val">{selectedGrip?.name} (+${gripExtra}.00)</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-key">Aesthetic Theme</span>
                        <span className="summary-val">{selectedColorObj?.name}</span>
                      </div>
                      <div className="summary-row highlight">
                        <span className="summary-key">Laser Inscription</span>
                        <span className="summary-val">"{customText}" #{playerNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="config-group">
                    <div className="lab-guarantee-box">
                      <h4>🛡️ Championship Craftsmanship Guarantee</h4>
                      <p>Every custom lab stick undergoes structural acoustic inspection, high-speed impact resonance tests, and flex validation before leaving our facility.</p>
                    </div>
                  </div>

                  <div className="tab-footer">
                    <Button variant="ghost" onClick={() => setActiveTab('aesthetic')}>
                      ← Edit Aesthetic
                    </Button>
                    <Button variant="primary" onClick={handleAddToCart}>
                      Confirm & Send to Cart (${totalPrice.toFixed(2)})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TECH DETAILS SECTION */}
      <section className="section section-tech-specs">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">LAB TECHNOLOGY</span>
            <h2>THE CARBONFLEX™ ADVANTAGE</h2>
            <p>Why custom engineered AMI sticks outperform off-the-shelf mass retail sticks.</p>
          </div>

          <div className="grid-3 tech-cards-grid">
            <Card padding="lg" variant="bordered">
              <div className="tech-icon">🔬</div>
              <h3>Continuous Monocomp Carbon</h3>
              <p>
                Our single-molding process eliminates the traditional weak point where the blade fuses to the shaft, giving you 100% uninterrupted energy transfer.
              </p>
            </Card>

            <Card padding="lg" variant="bordered">
              <div className="tech-icon">⚡</div>
              <h3>Optimized Low-Kick Energy Zone</h3>
              <p>
                Soft bottom shaft section allows quick loading on wrist shots, while a stiffened lower blade dampens flutter for laser-guided accuracy.
              </p>
            </Card>

            <Card padding="lg" variant="bordered">
              <div className="tech-icon">🎯</div>
              <h3>Micro-Rib Blade Core</h3>
              <p>
                Dual carbon-fiber ribs filled with high-density aerospace foam maintain structural blade stiffness even after thousands of hard puck contacts.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* PRO ATHLETE TESTIMONIAL BANNER */}
      <section className="section customizer-proof-section">
        <div className="container">
          <div className="proof-box">
            <div className="proof-stat">
              <Stat value="4.9 / 5" label="Pro Custom Lab Rating" />
            </div>
            <div className="proof-quote-content">
              <blockquote className="proof-quote">
                "Having my exact curve and flex dialed in down to the gram changed my release time. You can't get this level of customization anywhere else."
              </blockquote>
              <div className="proof-author">
                <strong>— MARCUS HARTLEY</strong>, National League Forward
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}