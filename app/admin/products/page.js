'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import toast from 'react-hot-toast'

export default function Products() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState({ name:'', description:'', your_price:'', supplier_cost:'', category:'', image_url:'', supplier_id:'' })

  useEffect(() => {
    supabase.from('products').select('*').then(({data})=>setProducts(data||[]))
    supabase.from('suppliers').select('*').then(({data})=>setSuppliers(data||[]))
  }, [])

  const save = async () => {
    const { error } = await supabase.from('products').insert({ ...form, your_price: +form.your_price, supplier_cost: +form.supplier_cost })
    if (error) { toast.error('Failed'); return }
    toast.success('Product added')
    setForm({ name:'', description:'', your_price:'', supplier_cost:'', category:'', image_url:'', supplier_id:'' })
    supabase.from('products').select('*').then(({data})=>setProducts(data||[]))
  }

  return (
    <div style={{maxWidth:800,margin:'0 auto',padding:'24px 16px'}}>
      <h2 style={{fontWeight:700,marginBottom:20}}>Add Product</h2>
      <div className="card" style={{display:'flex',flexDirection:'column',gap:12,marginBottom:30}}>
        <input placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <textarea placeholder="Description" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <input placeholder="Your listed price (KSh)" type="number" value={form.your_price} onChange={e=>setForm({...form,your_price:e.target.value})}/>
          <input placeholder="Supplier cost (KSh) — private" type="number" value={form.supplier_cost} onChange={e=>setForm({...form,supplier_cost:e.target.value})}/>
        </div>
        <input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/>
        <input placeholder="Image URL (optional)" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/>
        <select value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})}>
          <option value="">Select supplier</option>
          {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {form.your_price && form.supplier_cost && (
          <div style={{background:'#f0fdf4',padding:12,borderRadius:8,fontSize:14,color:'#166534'}}>
            Your margin per unit: <strong>KSh {(+form.your_price - +form.supplier_cost).toLocaleString()}</strong>
          </div>
        )}
        <button className="btn-primary" style={{padding:12}} onClick={save}>Add Product</button>
      </div>

      <h3 style={{fontWeight:600,marginBottom:14}}>All Products ({products.length})</h3>
      {products.map(p=>(
        <div key={p.id} className="card" style={{marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontWeight:600}}>{p.name}</div>
            <div style={{fontSize:13,color:'#64748b'}}>Listed: KSh {p.your_price?.toLocaleString()} | Cost: KSh {p.supplier_cost?.toLocaleString()} | Margin: KSh {(p.your_price-p.supplier_cost)?.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
