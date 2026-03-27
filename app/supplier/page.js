'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function SupplierPortal() {
  const [orders, setOrders] = useState([])
  const [code, setCode] = useState('')
  const [auth, setAuth] = useState(false)
  const [supplier, setSupplier] = useState(null)

  const login = async () => {
    const { data } = await supabase.from('suppliers').select('*').eq('phone', code).single()
    if (data) { setSupplier(data); setAuth(true); loadOrders(data.id) }
    else toast.error('Phone number not found')
  }

  const loadOrders = async (sid) => {
    const { data } = await supabase.from('orders')
      .select('order_number, delivery_area, delivery_notes, items, status, payment_status, created_at')
      .eq('supplier_id', sid)
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  if (!auth) return (
    <div style={{maxWidth:360,margin:'120px auto',padding:'0 16px'}}>
      <div className="card" style={{textAlign:'center'}}>
        <h2 style={{marginBottom:8,fontWeight:700}}>Supplier Login</h2>
        <p style={{color:'#64748b',fontSize:14,marginBottom:20}}>Enter your registered phone number</p>
        <input placeholder="Phone number" value={code} onChange={e=>setCode(e.target.value)} style={{marginBottom:14}}/>
        <button className="btn-primary" style={{width:'100%',padding:12}} onClick={login}>Login</button>
      </div>
    </div>
  )

  return (
    <div style={{maxWidth:760,margin:'0 auto',padding:'24px 16px'}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontWeight:700,fontSize:20}}>Supplier Orders</h1>
        <p style={{color:'#64748b',fontSize:14}}>Welcome, {supplier?.name}. Customer details are private.</p>
      </div>

      {orders.length === 0 && <div className="card" style={{textAlign:'center',color:'#94a3b8'}}>No orders yet</div>}

      {orders.map(o => (
        <div key={o.order_number} className="card" style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
            <span style={{fontWeight:700,color:'#6366f1'}}>{o.order_number}</span>
            <span style={{
              background: o.payment_status==='paid' ? '#dcfce7' : '#fef3c7',
              color: o.payment_status==='paid' ? '#166534' : '#92400e',
              padding:'2px 10px', borderRadius:20, fontSize:13
            }}>
              {o.payment_status==='paid' ? 'Payment received — prepare order' : 'Awaiting payment confirmation'}
            </span>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,fontSize:14}}>
            <div>
              <div style={{color:'#94a3b8',fontSize:12,marginBottom:2}}>DELIVERY AREA</div>
              <div style={{fontWeight:600}}>{o.delivery_area}</div>
            </div>
            <div>
              <div style={{color:'#94a3b8',fontSize:12,marginBottom:2}}>NOTES</div>
              <div>{o.delivery_notes || '—'}</div>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <div style={{color:'#94a3b8',fontSize:12,marginBottom:4}}>ITEMS TO PREPARE</div>
              {(o.items||[]).map((item,i) => (
                <div key={i} style={{padding:'5px 0',borderBottom:'1px solid #f1f5f9'}}>
                  {item.name} — qty: <strong>{item.qty}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:10,fontSize:12,color:'#94a3b8'}}>
            Note: Customer name and contact are not shown. Deliver to the area above only.
          </div>
        </div>
      ))}
    </div>
  )
}
