import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useStaff } from '../lib/useStaff'
import {
  Button,
  Card,
  Spinner,
  Badge,
  Alert,
  Input,
  Select,
  Textarea,
  Modal,
  Stat,
  EmptyState,
  PageHeader,
  Table,
  Tabs,
  toast
} from '../components/ui'

export default function AdminDashboard() {
  const { user, isStaff, loading: authLoading } = useStaff()
  
  // Tab control
  const [activeTab, setActiveTab] = useState('products')

  // Products state
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [productCategoryFilter, setProductCategoryFilter] = useState('all')

  // Orders state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState(null)
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState(null)
  const [reviewFilter, setReviewFilter] = useState('all')

  // Modal States
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    category: 'Ice Hockey Sticks',
    price: '',
    rating: '5.0',
    image_url: '',
    description: '',
    is_featured: false,
    specs_flex: '85',
    specs_curve: 'P92',
    specs_kick: 'Low-Kick',
    specs_weight: '375g'
  })
  const [savingProduct, setSavingProduct] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(false)

  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false)

  // Fetch data on mount if staff
  useEffect(() => {
    if (isStaff) {
      fetchProducts()
      fetchOrders()
      fetchReviews()
    }
  }, [isStaff])

  async function fetchProducts() {
    setLoadingProducts(true)
    setProductsError(null)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setProductsError(err.message || 'Failed to load products inventory.')
    } finally {
      setLoadingProducts(false)
    }
  }

  async function fetchOrders() {
    setLoadingOrders(true)
    setOrdersError(null)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setOrdersError(err.message || 'Failed to load order queue.')
    } finally {
      setLoadingOrders(false)
    }
  }

  async function fetchReviews() {
    setLoadingReviews(true)
    setReviewsError(null)
    try {
      const { data, error } = await supabase
        .from('gear_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (err) {
      setReviewsError(err.message || 'Failed to load athlete reviews.')
    } finally {
      setLoadingReviews(false)
    }
  }

  // --- PRODUCT MANAGEMENT HANDLERS ---
  const openNewProductModal = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      slug: '',
      category: 'Ice Hockey Sticks',
      price: '',
      rating: '5.0',
      image_url: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&q=80&w=800',
      description: '',
      is_featured: false,
      specs_flex: '85',
      specs_curve: 'P92',
      specs_kick: 'Low-Kick',
      specs_weight: '375g'
    })
    setProductModalOpen(true)
  }

  const openEditProductModal = (product) => {
    setEditingProduct(product)
    const specs = product.specs || {}
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      category: product.category || 'Ice Hockey Sticks',
      price: product.price ? String(product.price) : '',
      rating: product.rating ? String(product.rating) : '5.0',
      image_url: product.image_url || '',
      description: product.description || '',
      is_featured: !!product.is_featured,
      specs_flex: specs.flex || '85',
      specs_curve: specs.curve || 'P92',
      specs_kick: specs.kick || 'Low-Kick',
      specs_weight: specs.weight || '375g'
    })
    setProductModalOpen(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!productForm.name || !productForm.price || !productForm.description) {
      toast.error('Please fill in all required fields.')
      return
    }

    setSavingProduct(true)
    const slug = productForm.slug || productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    const payload = {
      name: productForm.name,
      slug,
      category: productForm.category,
      price: parseFloat(productForm.price),
      rating: parseFloat(productForm.rating || '5.0'),
      image_url: productForm.image_url || 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&q=80&w=800',
      description: productForm.description,
      is_featured: Boolean(productForm.is_featured),
      specs: {
        flex: productForm.specs_flex,
        curve: productForm.specs_curve,
        kick: productForm.specs_kick,
        weight: productForm.specs_weight
      }
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)
        if (error) throw error

        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p))
        toast.success(`Updated gear spec: ${payload.name}`)
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single()

        if (error) throw error
        setProducts(prev => [data, ...prev])
        toast.success(`Added new equipment: ${payload.name}`)
      }
      setProductModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save product.')
    } finally {
      setSavingProduct(false)
    }
  }

  const confirmDeleteProduct = (product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    setDeletingProduct(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
      toast.success('Product permanently purged from catalog.')
      setDeleteModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to delete product.')
    } finally {
      setDeletingProduct(false)
      setProductToDelete(null)
    }
  }

  // --- ORDER MANAGEMENT HANDLERS ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderStatus(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }
      toast.success(`Order ${orderId.slice(0, 8)} status changed to ${newStatus}.`)
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.')
    } finally {
      setUpdatingOrderStatus(false)
    }
  }

  // --- REVIEW MODERATION HANDLERS ---
  const handleToggleReviewApproval = async (review) => {
    const updatedStatus = !review.is_approved
    try {
      const { error } = await supabase
        .from('gear_reviews')
        .update({ is_approved: updatedStatus })
        .eq('id', review.id)

      if (error) throw error

      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: updatedStatus } : r))
      toast.success(updatedStatus ? 'Review approved for public display.' : 'Review pulled from public site.')
    } catch (err) {
      toast.error(err.message || 'Failed to update review status.')
    }
  }

  // Auth & Role Guard Rendering
  if (authLoading) {
    return (
      <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: '16px', color: 'var(--muted)', fontWeight: 600 }}>Verifying Brand Ops authorization...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="section">
        <div className="container container-narrow" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <Card padding="lg" variant="bordered" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🔒</span>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Staff Access Restricted</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              The AMI Brand Ops console requires active staff authentication. Please sign in with an authorized credentials account.
            </p>
            <Link to="/login" className="btn btn-primary">Sign in to Staff Console</Link>
          </Card>
        </div>
      </div>
    )
  }

  if (!isStaff) {
    return (
      <div className="section">
        <div className="container container-narrow" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
          <Card padding="lg" variant="bordered" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>⛔</span>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Access Denied</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
              Account <strong>{user.email}</strong> is not listed on the staff roster. Contact AMI Engineering Ops if you require authorization.
            </p>
            <Link to="/" className="btn btn-secondary">Return to Storefront</Link>
          </Card>
        </div>
      </div>
    )
  }

  // Filtered views calculation
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(productSearch.toLowerCase())
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true
    return o.status === orderStatusFilter
  })

  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === 'pending') return !r.is_approved
    if (reviewFilter === 'approved') return !!r.is_approved
    return true
  })

  // Calculations for Stat Row
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0)
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length
  const pendingReviewsCount = reviews.filter(r => !r.is_approved).length

  return (
    <div className="admin-page section" style={{ paddingTop: '40px' }}>
      <div className="container">
        {/* Top Operational Header */}
        <PageHeader
          title="BRAND OPS CONSOLE"
          subtitle="Championship gear inventory control, order fulfillment, and athlete feedback moderation."
          actions={
            <Button variant="primary" onClick={openNewProductModal}>
              + Add New Spec Gear
            </Button>
          }
        />

        {/* Operational Performance Bar */}
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          <Stat
            label="Total Gear Revenue"
            value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="⚡"
          />
          <Stat
            label="Catalog Items"
            value={products.length}
            icon="🏒"
          />
          <Stat
            label="Pending Fulfillment"
            value={pendingOrdersCount}
            icon="📦"
          />
          <Stat
            label="Reviews Pending Review"
            value={pendingReviewsCount}
            icon="💬"
          />
        </div>

        {/* Navigation Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <Tabs
            tabs={[
              { id: 'products', label: `Product Catalog (${products.length})` },
              { id: 'orders', label: `Orders Queue (${orders.length})` },
              { id: 'reviews', label: `Gear Reviews (${reviews.length})` }
            ]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* ================= PRODUCTS TAB ================= */}
        {activeTab === 'products' && (
          <div className="ops-section">
            <Card padding="md" variant="bordered" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <Input
                    placeholder="Search gear by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div style={{ minWidth: '220px' }}>
                  <Select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Categories' },
                      { value: 'Ice Hockey Sticks', label: 'Ice Hockey Sticks' },
                      { value: 'Field Hockey Sticks', label: 'Field Hockey Sticks' },
                      { value: 'Helmets & Protective', label: 'Helmets & Protective' },
                      { value: 'Gear Bags & Accessories', label: 'Gear Bags & Accessories' }
                    ]}
                  />
                </div>
              </div>
            </Card>

            {loadingProducts ? (
              <Card padding="lg" style={{ textAlign: 'center' }}>
                <Spinner size="lg" />
                <p style={{ marginTop: '12px', color: 'var(--muted)' }}>Loading live product specs...</p>
              </Card>
            ) : productsError ? (
              <Alert variant="error" title="Inventory Sync Error">{productsError}</Alert>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                icon="🏒"
                title="No Products Found"
                description={productSearch ? "No gear matches your current filter query." : "The catalog is empty. Add your first item."}
                action={
                  <Button variant="primary" onClick={openNewProductModal}>
                    Add First Product
                  </Button>
                }
              />
            ) : (
              <Card padding="none" variant="bordered" style={{ overflowX: 'auto' }}>
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Th>Product</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Specs (Flex / Kick)</Table.Th>
                      <Table.Th>Badge Status</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {filteredProducts.map((prod) => (
                      <Table.Row key={prod.id}>
                        <Table.Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', background: 'var(--surface-2)' }}
                            />
                            <div>
                              <strong style={{ display: 'block', color: 'var(--text)' }}>{prod.name}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>/{prod.slug}</span>
                            </div>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="secondary">{prod.category}</Badge>
                        </Table.Td>
                        <Table.Td style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                          ${Number(prod.price).toFixed(2)}
                        </Table.Td>
                        <Table.Td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          {prod.specs ? `${prod.specs.flex || 'N/A'} Flex | ${prod.specs.kick || 'N/A'}` : 'N/A'}
                        </Table.Td>
                        <Table.Td>
                          {prod.is_featured ? (
                            <Badge variant="primary">PRO SERIES</Badge>
                          ) : (
                            <Badge variant="info">STANDARD</Badge>
                          )}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={() => openEditProductModal(prod)}>
                              Edit
                            </Button>
                            <Button variant="danger" onClick={() => confirmDeleteProduct(prod)}>
                              Delete
                            </Button>
                          </div>
                        </Table.Td>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card>
            )}
          </div>
        )}

        {/* ================= ORDERS TAB ================= */}
        {activeTab === 'orders' && (
          <div className="ops-section">
            <Card padding="md" variant="bordered" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                  Filter Orders By Status:
                </span>
                <div style={{ width: '220px' }}>
                  <Select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Orders' },
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Confirmed', label: 'Confirmed' },
                      { value: 'Shipped', label: 'Shipped' },
                      { value: 'Delivered', label: 'Delivered' }
                    ]}
                  />
                </div>
              </div>
            </Card>

            {loadingOrders ? (
              <Card padding="lg" style={{ textAlign: 'center' }}>
                <Spinner size="lg" />
                <p style={{ marginTop: '12px', color: 'var(--muted)' }}>Retrieving incoming gear orders...</p>
              </Card>
            ) : ordersError ? (
              <Alert variant="error" title="Order Queue Error">{ordersError}</Alert>
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No Orders Found"
                description="There are currently no orders in this queue segment."
              />
            ) : (
              <Card padding="none" variant="bordered" style={{ overflowX: 'auto' }}>
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Th>Order Reference</Table.Th>
                      <Table.Th>Customer</Table.Th>
                      <Table.Th>Timestamp</Table.Th>
                      <Table.Th>Total Value</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {filteredOrders.map((ord) => (
                      <Table.Row key={ord.id}>
                        <Table.Td>
                          <code style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                            #{ord.id.slice(0, 8).toUpperCase()}
                          </code>
                        </Table.Td>
                        <Table.Td>
                          <strong style={{ display: 'block' }}>{ord.customer_name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{ord.customer_email}</span>
                        </Table.Td>
                        <Table.Td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                          {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Table.Td>
                        <Table.Td style={{ fontWeight: 700 }}>
                          ${Number(ord.total_amount).toFixed(2)}
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant={
                              ord.status === 'Shipped' ? 'success' :
                              ord.status === 'Confirmed' ? 'info' :
                              ord.status === 'Pending' ? 'warning' : 'secondary'
                            }
                          >
                            {ord.status || 'Pending'}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedOrder(ord)
                              setOrderDetailsModalOpen(true)
                            }}
                          >
                            Inspect Order
                          </Button>
                        </Table.Td>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Card>
            )}
          </div>
        )}

        {/* ================= REVIEWS TAB ================= */}
        {activeTab === 'reviews' && (
          <div className="ops-section">
            <Card padding="md" variant="bordered" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                  Filter Athlete Reviews:
                </span>
                <div style={{ width: '220px' }}>
                  <Select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Reviews' },
                      { value: 'pending', label: 'Pending Approval' },
                      { value: 'approved', label: 'Approved & Live' }
                    ]}
                  />
                </div>
              </div>
            </Card>

            {loadingReviews ? (
              <Card padding="lg" style={{ textAlign: 'center' }}>
                <Spinner size="lg" />
                <p style={{ marginTop: '12px', color: 'var(--muted)' }}>Fetching community feedback...</p>
              </Card>
            ) : reviewsError ? (
              <Alert variant="error" title="Review Sync Error">{reviewsError}</Alert>
            ) : filteredReviews.length === 0 ? (
              <EmptyState
                icon="💬"
                title="No Reviews Recorded"
                description="No gear test reviews fit the selected criteria."
              />
            ) : (
              <div className="grid-2">
                {filteredReviews.map((rev) => (
                  <Card key={rev.id} variant="bordered" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text)' }}>{rev.headline}</strong>
                        <div style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '2px' }}>
                          {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))} ({rev.rating}/5)
                        </div>
                      </div>
                      <Badge variant={rev.is_approved ? 'success' : 'warning'}>
                        {rev.is_approved ? 'LIVE' : 'PENDING'}
                      </Badge>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: 'var(--muted)', margin: '12px 0', fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <div>
                        <span style={{ fontWeight: 600, display: 'block', fontSize: '0.85rem' }}>{rev.reviewer_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Category: {rev.product_category}</span>
                      </div>
                      <Button
                        variant={rev.is_approved ? 'ghost' : 'primary'}
                        onClick={() => handleToggleReviewApproval(rev)}
                      >
                        {rev.is_approved ? 'Unpublish' : 'Approve Review'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= EDIT / CREATE PRODUCT MODAL ================= */}
        <Modal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          title={editingProduct ? `Edit Spec: ${editingProduct.name}` : 'Add New AMI Spec Gear'}
          size="lg"
        >
          <form onSubmit={handleSaveProduct}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Gear Name *"
                placeholder="e.g. VELOCITY X9 Carbon Stick"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />

              <div className="grid-2">
                <Select
                  label="Category *"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  options={[
                    { value: 'Ice Hockey Sticks', label: 'Ice Hockey Sticks' },
                    { value: 'Field Hockey Sticks', label: 'Field Hockey Sticks' },
                    { value: 'Helmets & Protective', label: 'Helmets & Protective' },
                    { value: 'Gear Bags & Accessories', label: 'Gear Bags & Accessories' }
                  ]}
                />
                <Input
                  label="Price ($) *"
                  type="number"
                  step="0.01"
                  placeholder="299.99"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <Input
                  label="Image URL *"
                  placeholder="https://images.unsplash.com/..."
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  required
                />
                <Input
                  label="Slug (Auto-generated if blank)"
                  placeholder="velocity-x9-carbon"
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                />
              </div>

              <Textarea
                label="Product Technical Description *"
                rows={3}
                placeholder="Precision engineered with 18K carbon weave structure..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
              />

              <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: '4px' }}>
                <span style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Technical Specifications (JSON Details)
                </span>
                <div className="grid-4">
                  <Input
                    label="Flex Rating"
                    placeholder="85"
                    value={productForm.specs_flex}
                    onChange={(e) => setProductForm({ ...productForm, specs_flex: e.target.value })}
                  />
                  <Input
                    label="Blade Curve"
                    placeholder="P92"
                    value={productForm.specs_curve}
                    onChange={(e) => setProductForm({ ...productForm, specs_curve: e.target.value })}
                  />
                  <Input
                    label="Kick Point"
                    placeholder="Low-Kick"
                    value={productForm.specs_kick}
                    onChange={(e) => setProductForm({ ...productForm, specs_kick: e.target.value })}
                  />
                  <Input
                    label="Weight"
                    placeholder="375g"
                    value={productForm.specs_weight}
                    onChange={(e) => setProductForm({ ...productForm, specs_weight: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={productForm.is_featured}
                  onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="is_featured" style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Flagship Product (Display PRO SERIES badge & Home spotlight)
                </label>
              </div>
            </div>

            <Modal.Footer>
              <Button variant="ghost" type="button" onClick={() => setProductModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={savingProduct}>
                {editingProduct ? 'Save Specs' : 'Publish Product'}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

        {/* ================= DELETE CONFIRMATION MODAL ================= */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Purge"
          size="sm"
        >
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
            Are you sure you want to purge <strong>{productToDelete?.name}</strong> from the AMI system? This action cannot be undone.
          </p>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProduct} loading={deletingProduct}>
              Delete Permanently
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ================= ORDER DETAILS MODAL ================= */}
        <Modal
          isOpen={orderDetailsModalOpen}
          onClose={() => setOrderDetailsModalOpen(false)}
          title={`Order Ref: #${selectedOrder?.id?.slice(0, 8).toUpperCase()}`}
          size="lg"
        >
          {selectedOrder && (
            <div>
              <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div>
                  <h4 style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer Details</h4>
                  <strong style={{ fontSize: '1.1rem', display: 'block' }}>{selectedOrder.customer_name}</strong>
                  <span style={{ color: 'var(--secondary)', display: 'block' }}>{selectedOrder.customer_email}</span>
                </div>
                <div>
                  <h4 style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Shipping Destination</h4>
                  <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedOrder.shipping_address}</p>
                </div>
              </div>

              <div style={{ margin: '20px 0' }}>
                <h4 style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Line Items</h4>
                <div style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: '4px' }}>
                  {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx !== selectedOrder.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span><strong>{item.qty || 1}x</strong> {item.name || 'Custom Hockey Item'}</span>
                      <strong>${Number((item.price || 0) * (item.qty || 1)).toFixed(2)}</strong>
                    </div>
                  )) : (
                    <p style={{ margin: 0, color: 'var(--muted)' }}>Detailed item payload unavailable.</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid var(--border)', fontWeight: 900 }}>
                    <span>Total Order Amount</span>
                    <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>${Number(selectedOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Update Order Fulfillment Status:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((st) => (
                    <Button
                      key={st}
                      variant={selectedOrder.status === st ? 'primary' : 'ghost'}
                      disabled={updatingOrderStatus}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                    >
                      Set {st}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setOrderDetailsModalOpen(false)}>
              Close Inspection
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}