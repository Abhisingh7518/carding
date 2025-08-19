import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { Edit, Trash2, Plus, X, Image as ImageIcon, Save } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:4001';

interface AdminProductsProps {
  onBack: () => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Card[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Helper: check if an id is a Mongo ObjectId
  const isMongoId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    inStock: true,
    imageUrl: '',
    description: '',
    promoActive: false,
    promoBuyQty: '0',
    promoGetQty: '0',
    promoGetAmount: '0',
    price: '0',
  });

  // Load products from API with localStorage fallback
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        await loadProducts();
      } catch (e) {
        console.error('Failed to load products on mount:', e);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // Note: We no longer auto-fill promoGetAmount. Admin input is the source of truth.

  const loadProducts = async () => {
    // Try API first
    try {
      const res = await fetch(`${API}/api/cards`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const apiMapped: Card[] = (data || []).map((d: any) => ({
        id: d._id,
        name: d.name,
        category: d.category,
        price: Number(d.price ?? 0),
        rarity: d.rarity || 'Common',
        rating: Number(d.rating ?? 0),
        inStock: Boolean(d.inStock),
        stock: Number(d.stock ?? 0),
        imageUrl: d.imageUrl || '',
        description: d.description || '',
        promoActive: Boolean(d.promoActive),
        promoBuyQty: typeof d.promoBuyQty === 'number' ? d.promoBuyQty : 0,
        promoGetQty: typeof d.promoGetQty === 'number' ? d.promoGetQty : 0,
        promoGetAmount: Number(d.promoGetAmount ?? 0),
      }));

      // Merge with any local-only products
      const savedProductsStr = localStorage.getItem('products');
      let merged: Card[] = apiMapped;
      if (savedProductsStr) {
        try {
          const saved: Card[] = JSON.parse(savedProductsStr);
          const apiIds = new Set(apiMapped.map(p => p.id));
          const localOnly = (saved || []).filter((p: any) => !apiIds.has(p.id as any));
          // If API item missing promoGetAmount but local has a positive one, carry it over
          const apiById = new Map(apiMapped.map(p => [p.id, { ...p }]));
          (saved || []).forEach((lp: any) => {
            if (apiById.has(lp.id) && (typeof lp.promoGetAmount === 'number') && lp.promoGetAmount > 0) {
              const cur = apiById.get(lp.id)!;
              if (!(typeof (cur as any).promoGetAmount === 'number') || (cur as any).promoGetAmount <= 0) {
                (cur as any).promoGetAmount = Number(lp.promoGetAmount) || 0;
              }
            }
          });
          merged = [...apiById.values(), ...localOnly];
        } catch {}
      }

      // Save mirror to localStorage for offline fallback
      saveProducts(merged);
      return merged;
    } catch (apiErr) {
      console.warn('API load failed, falling back to localStorage:', apiErr);
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        try {
          const parsedProducts = JSON.parse(savedProducts);
          const validatedProducts = parsedProducts.map((p: any) => ({
            ...p,
            id: p.id || Math.random().toString(36).substr(2, 9),
            stock: Number(p.stock) || 0,
            inStock: p.inStock !== undefined ? p.inStock : (Number(p.stock) || 0) > 0,
            rarity: p.rarity || 'Common',
            rating: Number(p.rating) || 0,
            price: Number(p.price) || 0,
            imageUrl: p.imageUrl || '',
            description: p.description || '',
            promoActive: Boolean(p.promoActive),
            promoBuyQty: Number(p.promoBuyQty) || 0,
            promoGetQty: Number(p.promoGetQty) || 0,
            promoGetAmount: Number(p.promoGetAmount) || 0,
          }));
          setProducts(validatedProducts);
          return validatedProducts;
        } catch (e) {
          console.error('Error parsing products from localStorage:', e);
          setProducts([]);
          return [];
        }
      } else {
        setProducts([]);
        return [];
      }
    }
  };

  // Save products to localStorage when they change
  const saveProducts = (updatedProducts: Card[]) => {
    try {
      console.log('Starting to save products:', updatedProducts);
      
      // Ensure all products have required fields
      const productsToSave = updatedProducts.map(p => ({
        id: p.id || Math.random().toString(36).substr(2, 9),
        name: p.name || 'Unnamed Product',
        category: p.category || 'Uncategorized',
        price: Number(p.price) || 0,
        stock: Number((p as any).stock) || 0,
        inStock: Boolean(p.inStock),
        rarity: p.rarity || 'Common',
        rating: Number(p.rating) || 0,
        imageUrl: p.imageUrl || '',
        description: p.description || '',
        promoActive: Boolean((p as any).promoActive),
        promoBuyQty: Number((p as any).promoBuyQty) || 0,
        promoGetQty: Number((p as any).promoGetQty) || 0,
        promoGetAmount: Number((p as any).promoGetAmount) || 0,
      }));
      
      console.log('Processed products for saving:', productsToSave);
      
      // Convert to string and save
      const productsString = JSON.stringify(productsToSave);
      console.log('Stringified products:', productsString);
      
      // Save to localStorage
      localStorage.setItem('products', productsString);
      
      // Update state
      setProducts(productsToSave);
      
      // Verify the save was successful
      const verify = localStorage.getItem('products');
      console.log('Verify saved products:', verify);
      
      // Force a re-render of the marketplace to show updated products
      console.log('Dispatching productsUpdated event');
      const event = new Event('productsUpdated');
      window.dispatchEvent(event);
      
      return productsToSave;
    } catch (e) {
      console.error('Error in saveProducts:', e);
      throw e;
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const el = e.target as any;
    const { name } = el;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const promoBuy = Number(formData.promoBuyQty) || 0;
    const promoGet = Number(formData.promoGetQty) || 0;
    const promoAmt = Number(formData.promoGetAmount) || 0;
    const payload = {
      name: formData.name,
      category: formData.category,
      // Price now editable in form
      price: Number(formData.price) || 0,
      stock: 0,
      inStock: Boolean(formData.inStock),
      imageUrl: formData.imageUrl,
      description: formData.description,
      rarity: 'Common',
      rating: 0,
      promoActive: promoBuy > 0 && promoGet > 0,
      promoBuyQty: promoBuy,
      promoGetQty: promoGet,
      promoGetAmount: promoAmt,
    };

    try {
      let updatedList: Card[] = [];
      let usedApi = false;
      let expectedId: string | null = null;
      if (editingProduct) {
        if (isMongoId(editingProduct.id)) {
          // Update via API with local fallback on failure
          try {
            const res = await fetch(`${API}/api/cards/${editingProduct.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`Update failed (${res.status})`);
            const updated = await res.json();
            const mapped: Card = {
              id: updated._id,
              name: updated.name,
              category: updated.category,
              price: Number(updated.price ?? 0),
              rarity: updated.rarity || 'Common',
              rating: Number(updated.rating ?? 0),
              inStock: Boolean(updated.inStock),
              stock: Number(updated.stock ?? 0),
              imageUrl: updated.imageUrl || '',
              description: updated.description || '',
              promoActive: Boolean(updated.promoActive),
              promoBuyQty: typeof updated.promoBuyQty === 'number' ? updated.promoBuyQty : 0,
              promoGetQty: typeof updated.promoGetQty === 'number' ? updated.promoGetQty : 0,
              promoGetAmount: typeof updated.promoGetAmount === 'number' ? updated.promoGetAmount : (Number(formData.promoGetAmount) || 0),
            };
            updatedList = products.map(p => (p.id === editingProduct.id ? mapped : p));
            usedApi = true;
            expectedId = editingProduct.id as string;
          } catch (apiErr) {
            // Local fallback
            const mappedLocal: Card = {
              id: editingProduct.id,
              name: payload.name,
              category: payload.category,
              price: payload.price,
              rarity: 'Common',
              rating: 0,
              inStock: payload.inStock,
              stock: 0,
              imageUrl: payload.imageUrl || '',
              description: payload.description || '',
              promoActive: payload.promoActive,
              promoBuyQty: payload.promoBuyQty,
              promoGetQty: payload.promoGetQty,
              promoGetAmount: payload.promoGetAmount,
            } as any;
            updatedList = products.map(p => (p.id === editingProduct.id ? mappedLocal : p));
          }
        } else {
          // Local-only update (no API id)
          const mappedLocal: Card = {
            id: editingProduct.id,
            name: payload.name,
            category: payload.category,
            price: payload.price,
            rarity: 'Common',
            rating: 0,
            inStock: payload.inStock,
            stock: 0,
            imageUrl: payload.imageUrl || '',
            description: payload.description || '',
            promoActive: payload.promoActive,
            promoBuyQty: payload.promoBuyQty,
            promoGetQty: payload.promoGetQty,
            promoGetAmount: payload.promoGetAmount,
          } as any;
          updatedList = products.map(p => (p.id === editingProduct.id ? mappedLocal : p));
        }
      } else {
        // Create via API with local fallback on failure
        try {
          const res = await fetch(`${API}/api/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Create failed (${res.status})`);
          const created = await res.json();
          const mapped: Card = {
            id: created._id,
            name: created.name,
            category: created.category,
            price: Number(created.price ?? 0),
            rarity: created.rarity || 'Common',
            rating: Number(created.rating ?? 0),
            inStock: Boolean(created.inStock),
            stock: Number(created.stock ?? 0),
            imageUrl: created.imageUrl || '',
            description: created.description || '',
            promoActive: Boolean(created.promoActive),
            promoBuyQty: typeof created.promoBuyQty === 'number' ? created.promoBuyQty : 0,
            promoGetQty: typeof created.promoGetQty === 'number' ? created.promoGetQty : 0,
            promoGetAmount: typeof created.promoGetAmount === 'number' ? created.promoGetAmount : (Number(formData.promoGetAmount) || 0),
          };
          updatedList = [...products, mapped];
          usedApi = true;
          expectedId = String(created._id || '');
        } catch (apiErr) {
          // Local create
          const localItem: Card = {
            id: Math.random().toString(36).substr(2, 9),
            name: payload.name,
            category: payload.category,
            price: payload.price,
            rarity: 'Common',
            rating: 0,
            inStock: payload.inStock,
            stock: 0,
            imageUrl: payload.imageUrl || '',
            description: payload.description || '',
            promoActive: payload.promoActive,
            promoBuyQty: payload.promoBuyQty,
            promoGetQty: payload.promoGetQty,
            promoGetAmount: payload.promoGetAmount,
          } as any;
          updatedList = [...products, localItem];
        }
      }

      // If we used the API, reload to reflect DB truth
      if (usedApi) {
        updatedList = await loadProducts();
        // Enforce the submitted Get Amount for the specific product to reflect immediately
        if (expectedId) {
          const enforcedAmt = Number(formData.promoGetAmount) || 0;
          if (enforcedAmt > 0) {
            updatedList = updatedList.map(p =>
              String(p.id) === String(expectedId)
                ? ({ ...p, promoGetAmount: enforcedAmt } as Card)
                : p
            );
          }
        }
      }
      saveProducts(updatedList);
      resetForm();
    } catch (err: any) {
      console.error('Save product error:', err);
      alert(err?.message || 'Failed to save product');
    }
  };

  // Edit product
  const handleEdit = (product: Card) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      inStock: Boolean(product.inStock),
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      promoActive: Boolean((product as any).promoActive),
      promoBuyQty: ((product as any).promoBuyQty ?? 0).toString(),
      promoGetQty: ((product as any).promoGetQty ?? 0).toString(),
      promoGetAmount: (((product as any).promoGetAmount ?? 0) as number).toString(),
      price: (product.price ?? 0).toString(),
    });
    setShowForm(true);
  };

  // Delete product
  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      if (isMongoId(id)) {
        const res = await fetch(`${API}/api/cards/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      }
      const updatedProducts = products.filter(p => p.id !== id);
      saveProducts(updatedProducts);
    } catch (err: any) {
      console.error('Delete product error:', err);
      alert(err?.message || 'Failed to delete product');
    }
  };

  // Toggle product availability (inStock)
  const handleToggleStock = async (product: Card) => {
    try {
      const updated: Card = { ...product, inStock: !product.inStock };
      if (isMongoId(product.id)) {
        const payload = {
          name: updated.name,
          category: updated.category,
          price: Number(updated.price ?? 0),
          stock: Number((updated as any).stock ?? 0),
          inStock: Boolean(updated.inStock),
          imageUrl: updated.imageUrl || '',
          description: updated.description || '',
          rarity: updated.rarity || 'Common',
          rating: Number(updated.rating ?? 0),
          promoActive: Boolean((updated as any).promoActive),
          promoBuyQty: Number((updated as any).promoBuyQty) || 0,
          promoGetQty: Number((updated as any).promoGetQty) || 0,
          promoGetAmount: Number((updated as any).promoGetAmount) || 0,
        };
        const res = await fetch(`${API}/api/cards/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Update failed (${res.status})`);
      }
      const updatedList = products.map(p => (p.id === product.id ? updated : p));
      saveProducts(updatedList);
    } catch (e: any) {
      console.error('Toggle stock failed:', e);
      alert(e?.message || 'Failed to toggle availability');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      inStock: true,
      imageUrl: '',
      description: '',
      promoActive: false,
      promoBuyQty: '0',
      promoGetQty: '0',
      promoGetAmount: '0',
      price: '0',
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-4">Loading products...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Quantity (X)
                </label>
                <input
                  type="number"
                  name="promoBuyQty"
                  min="0"
                  value={formData.promoBuyQty}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Quantity (Y)
                </label>
                <input
                  type="number"
                  name="promoGetQty"
                  min="0"
                  value={formData.promoGetQty}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. 10"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Set the selling price (e.g., 10).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Amount ($)
                </label>
                <input
                  type="number"
                  name="promoGetAmount"
                  min="0"
                  step="0.01"
                  value={formData.promoGetAmount}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g. 20"
                />
                <p className="text-xs text-gray-500 mt-1">Shown next to price on cards as “Get $amount”.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={!!formData.inStock}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <span>{formData.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to ~2MB. Stored inline (base64).</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={18} />
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Get Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offer
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No products found. Add your first product to get started.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {(() => {
                      const amt = Number((product as any).promoGetAmount ?? 0);
                      return amt > 0 ? (
                        <span className="text-green-600">${amt.toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(product)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        product.inStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {product.promoActive && (product.promoBuyQty || 0) > 0 && (product.promoGetQty || 0) > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
                        Buy {product.promoBuyQty} Get {product.promoGetQty}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
