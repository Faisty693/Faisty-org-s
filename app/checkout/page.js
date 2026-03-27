'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function Checkout() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [form, setForm] = useState({ name:'', phone:'', area:'', notes:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  const total = cart.reduce((s,i) => s + i.your_price * i.qty, 0)
  const supplierTotal = cart.reduce((s,i) => s + (i.supplier_cost||0) * i.qty, 0)

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.area) {
      toast.error('Please fill all required fields'); return
    }
    setLoading(true)
    const orderNumber = 'ORD-' + Date.now()

    // Simplified: single supplier per order (first product's supplier)
    const supplierId = cart[0]?.supplier_id || null

    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      customer_name: form.name,
      customer_phone: form.phone,
      delivery_area: form.area,
      delivery_notes: form.notes,
      items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.your_price })),
      total_paid: total,
      supplier_payout: supplierTotal,
      your_margin: total - supplierTotal,
      status: 'pending',
      payment_status: 'pending_payment',
      supplier_id: supplierId
    })

    if (error) { toast.error('Order failed. Try again.'); setLoading(false); return }

    sessionStorage.removeItem('cart')
    toast.success('Order placed! Pay via M-Pesa to confirm.')
    setTimeout(() => router.push('/order-success?ref=' + orderNumber), 1500)
  }

  return (
    <div style={{maxWidth:520,margin:'40px auto',padding:'0 16px'}}>
      <h2 style={{marginBottom:20,fontWeight:700,fontSize:22}}>Checkout</h2>

      <div className="card" style={{marginBottom:20}}>
        <h3 style={{marginBottom:12,fontWeight:600}}>Your order</h3>
        {cart.map((i,idx) => (
          <div key={idx} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f1f5f9'}}>
            <span>{i.name} x{i.qty}</span>
            <span style={{fontWeight:600}}>KSh {(i.your_price*i.qty).toLocaleString()}</span>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:12,fontWeight:700,fontSize:18}}>
          <span>Total</span><span style={{color:'#6366f1'}}>KSh {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="card" style={{display:'flex',flexDirection:'column',gap:14}}>
        <input placeholder="Your full name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Phone number *" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <input placeholder="Delivery area / estate *" value={form.area} onChange={e=>setForm({...form,area:e.target.value})}/>
        <textarea placeholder="Delivery notes (optional)" rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>

        <div style={{background:'#fef3c7',borderRadius:8,padding:14,fontSize:14,color:'#92400e'}}>
          After placing order, pay <strong>KSh {total.toLocaleString()}</strong> via M-Pesa to<br/>
          <strong style={{fontSize:16}}>Till/Paybill: [YOUR MPESA NUMBER]</strong><br/>
          Use your phone number as reference.
        </div>

        <button className="btn-primary" onClick={placeOrder} disabled={loading} style={{padding:14,fontSize:16}}>
          {loading ? 'Placing order...' : `Place Order · KSh ${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}
