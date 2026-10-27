import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button, Card, Badge, Input, Select, Spinner, Alert, EmptyState, Modal, toast } from '../components/ui'

export default function Catalog() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [levelFilter, setLevelFilter] = useState('All')
  const [sortOption, setSortOption] = useState('featured')

  // Selected item for Quick View modal
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [selectedHand, setSelectedHand] = useState('Left')
  const [selectedFlex, setSelectedFlex] = useState('85')

  // Comparison tray state (IDs)
  const [compareIds, setCompareIds] = useState([])
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  // Cart state stored locally in localStorage for demo/checkout flow
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    fetchProducts()
    updateCartCount()
  }, [])

  const updateCartCount = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('ami_cart') || '[]')
      const totalQty = existing.reduce((sum, item) => sum + (item.quantity || 1), 0)
      setCartCount(totalQty)
    } catch (e) {
      setCartCount(0)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr

      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching catalog products:', err)
      setError(err.message || 'Failed to load hockey equipment catalog.')
    } finally {
      setLoading(false)
    }
  }

  // Filter & Sort Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'All' || 
                            product.category?.toLowerCase() === categoryFilter.toLowerCase()
    
    const matchesLevel = levelFilter === 'All' || 
                         (product.specs && product.specs.level === levelFilter)

    return matchesSearch && matchesCategory && matchesLevel
  }).sort((a, b) => {
    if (sortOption === 'price-low') return Number(a.price) - Number(b.price)
    if (sortOption === 'price-high') return Number(b.price) - Number(a.price)
    if (sortOption === 'rating') return Number(b.rating || 0) - Number(a.rating || 0)
    // Default 'featured': featured items first, then newer
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return 0
  })

  // Compare Toggle
  const toggleCompare = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(item => item !== id))
    } else {
      if (compareIds.length >= 3) {
        toast.warning('You can compare up to 3 products at a time.')
        return
      }
      setCompareIds([...compareIds, id])
    }
  }

  // Add to Cart
  const handleAddToCart = (product, hand = selectedHand, flex = selectedFlex) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('ami_cart') || '[]')
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        hand: hand,
        flex: flex,
        quantity: 1
      }
      
      const itemIndex = existingCart.findIndex(item => item.id === product.id && item.hand === hand && item.flex === flex)
      if (itemIndex > -1) {
        existingCart[itemIndex].quantity += 1
      } else {
        existingCart.push(cartItem)
      }
      
      localStorage.setItem('ami_cart', JSON.stringify(existingCart))
      updateCartCount()
      toast.success(`${product.name} added to cart!`)
      if (quickViewProduct) {
        setQuickViewProduct(null)
      }
    } catch (e) {
      toast.error('Failed to update cart.')
    }
  }

  const comparedProductsList = products.filter(p => compareIds.includes(p.id))

  return (
    <div className="catalog-page">
      {/* 1. HERO SECTION */}
      <section className="catalog-hero-section">
        <div className="container">
          <div className="hero-content-wrapper">
            <span className="eyebrow">CHAMPIONSHIP ARSENAL</span>
            <h1 className="hero-title">The Full Arsenal.</h1>
            <p className="hero-subtitle">
              Engineered flex zones, ultra-dense carbon weaves, and impact-shielding gear. 
              Every piece in the AMI lineup is stress-tested past the point where conventional equipment fails.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CATALOG SECTION */}
      <section className="section catalog-main-section">
        <div className="container">

          {/* Controls Bar: Search & Quick Stats */}
          <div className="catalog-controls-bar">
            <div className="search-box-wrapper">
              <Input
                placeholder="Search sticks, helmets, pads, or specs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="cart-comparison-actions">
              {compareIds.length > 0 && (
                <Button 
                  variant="secondary" 
                  onClick={() => setIsCompareModalOpen(true)}
                  className="compare-tray-btn"
                >
                  ⚡ Compare ({compareIds.length}/3)
                </Button>
              )}

              <Button 
                variant="primary" 
                onClick={() => navigate('/checkout')}
                className="cart-nav-btn"
              >
                🛒 Cart ({cartCount})
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="catalog-filter-bar card">
            <div className="filter-group">
              <label className="filter-label">Sport / Category</label>
              <Select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Ice Hockey Sticks">Ice Hockey Sticks</option>
                <option value="Field Hockey Sticks">Field Hockey Sticks</option>
                <option value="Helmets & Protection">Helmets & Protection</option>
                <option value="Accessories">Accessories</option>
              </Select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Player Level</label>
              <Select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="All">All Levels</option>
                <option value="Pro">Pro Elite</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Youth">Youth / Junior</option>
              </Select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <Select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="featured">Featured / Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </Select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {(categoryFilter !== 'All' || levelFilter !== 'All' || searchTerm !== '') && (
            <div className="active-filters-row">
              <span className="active-filter-title">Active Filters:</span>
              {categoryFilter !== 'All' && (
                <Badge variant="primary">Category: {categoryFilter}</Badge>
              )}
              {levelFilter !== 'All' && (
                <Badge variant="secondary">Level: {levelFilter}</Badge>
              )}
              {searchTerm !== '' && (
                <Badge variant="info">Search: "{searchTerm}"</Badge>
              )}
              <button 
                type="button" 
                className="reset-filters-btn"
                onClick={() => {
                  setCategoryFilter('All')
                  setLevelFilter('All')
                  setSearchTerm('')
                }}
              >
                Clear All
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="loading-container">
              <Spinner size="lg" />
              <p className="loading-text">Loading AMI Carbon & Armor Catalog...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {error && (
            <Alert variant="error" title="Unable to load catalog">
              {error}
            </Alert>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && filteredProducts.length === 0 && (
            <EmptyState
              icon="🏒"
              title="No Gear Matches Your Spec"
              description="Try adjusting your category filters, clearing search criteria, or exploring our custom stick builder."
              action={
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setCategoryFilter('All')
                    setLevelFilter('All')
                    setSearchTerm('')
                  }}
                >
                  Reset Catalog Filters
                </Button>
              }
            />
          )}

          {/* PRODUCT GRID */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const isCompared = compareIds.includes(product.id)
                return (
                  <div 
                    key={product.id} 
                    className={`product-card ${product.is_featured ? 'flagship-card' : ''}`}
                  >
                    {product.is_featured && (
                      <span className="ribbon-badge">PRO SERIES</span>
                    )}

                    <div className="card-image-wrapper">
                      <img 
                        src={product.image_url || 'https://picsum.photos/seed/hockey1/600/400'} 
                        alt={product.name}
                        className="product-img"
                      />
                      <button 
                        type="button" 
                        className="quick-view-overlay-btn"
                        onClick={() => {
                          setQuickViewProduct(product)
                          setSelectedHand(product.specs?.hand || 'Left')
                          setSelectedFlex(product.specs?.flex || '85')
                        }}
                      >
                        ⚡ Quick Spec View
                      </button>
                    </div>

                    <div className="product-card-body">
                      <div className="product-card-header">
                        <span className="product-category-tag">{product.category}</span>
                        {product.rating && (
                          <span className="product-rating">★ {product.rating.toFixed(1)}</span>
                        )}
                      </div>

                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-description">{product.description}</p>

                      {/* Specs Teaser */}
                      {product.specs && (
                        <div className="specs-teaser-list">
                          {product.specs.flex && (
                            <span className="spec-pill">Flex: {product.specs.flex}</span>
                          )}
                          {product.specs.kickPoint && (
                            <span className="spec-pill">Kick: {product.specs.kickPoint}</span>
                          )}
                          {product.specs.weight && (
                            <span className="spec-pill">Weight: {product.specs.weight}</span>
                          )}
                          {product.specs.level && (
                            <span className="spec-pill level-pill">{product.specs.level}</span>
                          )}
                        </div>
                      )}

                      <div className="product-card-footer">
                        <div className="price-tag">
                          <span className="currency">$</span>
                          <span className="amount">{Number(product.price).toFixed(2)}</span>
                        </div>

                        <div className="card-action-buttons">
                          <button
                            type="button"
                            className={`compare-checkbox-btn ${isCompared ? 'active' : ''}`}
                            onClick={() => toggleCompare(product.id)}
                            title="Compare product specs side by side"
                          >
                            {isCompared ? '✓ Compare' : '+ Compare'}
                          </button>
                          
                          <Button 
                            variant="primary" 
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Bag
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. SIZE & FIT ADVISOR STRIP */}
      <section className="section fit-advisor-strip">
        <div className="container">
          <div className="fit-advisor-card card">
            <div className="fit-advisor-content">
              <span className="eyebrow">PRECISION SIZING</span>
              <h2>Wrong length costs you velocity. Get fitted in 60 seconds.</h2>
              <p>
                A stick two inches too long kills your wrist flex. A helmet quarter inch off loses impact absorption.
                Use our dynamic custom stick builder to calculate exact flex profile, kick point, and lie.
              </p>
            </div>
            <div className="fit-advisor-cta">
              <Link to="/customizer" className="btn btn-primary btn-lg">
                Launch Stick Builder →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRO ATHLETE ENDORSEMENT BANNER */}
      <section className="section athlete-trust-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow font-display">CHAMPIONSHIP PROVEN</span>
            <h2>Trusted by Players Who Can't Afford to Lose</h2>
          </div>

          <div className="grid-3 trust-grid">
            <div className="trust-card card">
              <div className="quote-body">
                "The snap on the Velocity X9 is unreal. The energy transfer off the blade gives me 3-4 extra miles per hour on wrist shots with zero blade twist."
              </div>
              <div className="author-info">
                <strong>Marcus Vance</strong>
                <span>First Line Forward — National League</span>
              </div>
            </div>

            <div className="trust-card card">
              <div className="quote-body">
                "We switched our entire collegiate field hockey program to AMI turf sticks this season. Durability in cold conditions is unmatched."
              </div>
              <div className="author-info">
                <strong>Coach Elena Rostova</strong>
                <span>Division 1 Head Coach</span>
              </div>
            </div>

            <div className="trust-card card">
              <div className="quote-body">
                "Finding a helmet that balances lightweight ventilation with true multi-impact protection was tough until AMI dropped the Impact Pro."
              </div>
              <div className="author-info">
                <strong>David Lindqvist</strong>
                <span>Pro Goalie / Defensive Specialist</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <Modal
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          title={quickViewProduct.name}
          size="lg"
        >
          <div className="quick-view-content">
            <div className="quick-view-grid">
              <div className="quick-view-media">
                <img 
                  src={quickViewProduct.image_url || 'https://picsum.photos/seed/hockey1/600/400'} 
                  alt={quickViewProduct.name} 
                  className="modal-product-img"
                />
              </div>
              <div className="quick-view-details">
                <Badge variant="primary">{quickViewProduct.category}</Badge>
                <div className="quick-view-price">${Number(quickViewProduct.price).toFixed(2)}</div>
                <p className="modal-description">{quickViewProduct.description}</p>

                {quickViewProduct.specs && (
                  <div className="modal-specs-table card">
                    <h4>Technical Specs</h4>
                    <div className="spec-row">
                      <span>Flex Rating:</span> <strong>{quickViewProduct.specs.flex || 'N/A'}</strong>
                    </div>
                    <div className="spec-row">
                      <span>Kick Point:</span> <strong>{quickViewProduct.specs.kickPoint || 'N/A'}</strong>
                    </div>
                    <div className="spec-row">
                      <span>Blade Curve:</span> <strong>{quickViewProduct.specs.curve || 'N/A'}</strong>
                    </div>
                    <div className="spec-row">
                      <span>Weight:</span> <strong>{quickViewProduct.specs.weight || 'N/A'}</strong>
                    </div>
                    <div className="spec-row">
                      <span>Level:</span> <strong>{quickViewProduct.specs.level || 'Pro'}</strong>
                    </div>
                  </div>
                )}

                <div className="selectors-block">
                  <div className="select-field">
                    <label>Handedness</label>
                    <Select value={selectedHand} onChange={(e) => setSelectedHand(e.target.value)}>
                      <option value="Left">Left Hand (Bottom Hand Left)</option>
                      <option value="Right">Right Hand (Bottom Hand Right)</option>
                    </Select>
                  </div>

                  <div className="select-field">
                    <label>Flex Rating</label>
                    <Select value={selectedFlex} onChange={(e) => setSelectedFlex(e.target.value)}>
                      <option value="75">75 Flex (Regular Mid-Flex)</option>
                      <option value="85">85 Flex (Stiff - Pro Standard)</option>
                      <option value="95">95 Flex (Extra Stiff - Heavy Slapshots)</option>
                    </Select>
                  </div>
                </div>

                <div className="modal-actions">
                  <Button 
                    variant="primary" 
                    onClick={() => handleAddToCart(quickViewProduct, selectedHand, selectedFlex)}
                  >
                    Add {quickViewProduct.name} to Cart — ${Number(quickViewProduct.price).toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* PRODUCT COMPARISON MODAL */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        title="Side-by-Side Equipment Comparison"
        size="xl"
      >
        <div className="compare-modal-content">
          {comparedProductsList.length === 0 ? (
            <p>No products selected for comparison.</p>
          ) : (
            <div className="compare-grid">
              {comparedProductsList.map((prod) => (
                <div key={prod.id} className="compare-col card">
                  <button 
                    type="button" 
                    className="remove-compare-btn"
                    onClick={() => toggleCompare(prod.id)}
                  >
                    ✕ Remove
                  </button>
                  <img src={prod.image_url} alt={prod.name} className="compare-img" />
                  <h3>{prod.name}</h3>
                  <div className="compare-price">${Number(prod.price).toFixed(2)}</div>
                  <hr />
                  <div className="compare-spec-list">
                    <p><strong>Category:</strong> {prod.category}</p>
                    <p><strong>Flex:</strong> {prod.specs?.flex || 'N/A'}</p>
                    <p><strong>Kick Point:</strong> {prod.specs?.kickPoint || 'N/A'}</p>
                    <p><strong>Curve:</strong> {prod.specs?.curve || 'N/A'}</p>
                    <p><strong>Weight:</strong> {prod.specs?.weight || 'N/A'}</p>
                    <p><strong>Level:</strong> {prod.specs?.level || 'Pro'}</p>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      handleAddToCart(prod)
                      setIsCompareModalOpen(false)
                    }}
                  >
                    Select & Add to Cart
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

    </div>
  )
}