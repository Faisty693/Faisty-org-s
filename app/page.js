'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('products')
      .select('id,name,description,your_price,category,image_url')
      .eq('in_stock', true)
      .then(({ data }) => setProducts(data || []))
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? {...i, qty: i.qty+1} : i)
      return [...prev, {...product, qty: 1}]
    })
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const total = cart.reduce((s, i) => s + i.your_price * i.qty, 0)

  return (
    <div style={{maxWidth:900,margin:'0 auto',padding:'20px 16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:26,fontWeight:700,color:'#6366f1'}}>My Marketplace</h1>
        <Link href="/checkout" style={{position:'relative'}}>
          <button className="btn-primary" style={{padding:'10px 20px'}}>
            Cart ({cart.reduce((s,i)=>s+i.qty,0)}) · KSh {total.toLocaleString()}
          </button>
        </Link>
      </div>

      <input
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{marginBottom:24}}
      />

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
        {filtered.map(p => (
          <div key={p.id} className="card" style={{display:'flex',flexDirection:'column',gap:10}}>
            {p.image_url && <img src={p.image_url} alt={p.name} style={{width:'100%',height:160,objectFit:'cover',borderRadius:8}}/>}
            <div style={{fontWeight:600,fontSize:16}}>{p.name}</div>
            <div style={{fontSize:13,color:'#64748b'}}>{p.description}</div>
            <div style={{fontWeight:700,color:'#6366f1',fontSize:18}}>KSh {p.your_price?.toLocaleString()}</div>
            <button className="btn-primary" style={{padding:'10px'}} onClick={() => addToCart(p)}>
              Add to cart
            </button>
          </div>
        ))}
      </div>

      {/* Store cart in sessionStorage so checkout page can read it */}
      <script dangerouslySetInnerHTML={{__html:`
        window.__cart = ${JSON.stringify(cart)};
        sessionStorage.setItem('cart', JSON.stringify(${JSON.stringify(cart)}));
      `}}/>
    </div>
  )
}
