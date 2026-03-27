'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const ADMIN_PIN = '1234' // Change this to your own PIN

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pin, setPin] = useState('')
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    if (auth) loadOrders()
  }, [auth])

  const loadOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', {ascending:false})
    setOrders(data || [])
  }

  const updateStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    toast.success('Order updated')
    loadOrders()
  }

  const markPaid = async (id) => {
    await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', id)
    toast.success('Marked as paid — supplier notified')
    loadOrders()
  }

  if (!auth) return (
    <div style={{maxWidth:360,margin:'120px auto',padding:'0 16px'}}>
      <div className="card" style={{textAlign:'center'}}>
        <h2 style={{marginBottom:20,fontWeight:700}}>Admin Login</h2>
        <input type="password" placeholder="Enter PIN" value={pin} onChange={e=>setPin(e.target.value)} style={{marginBottom:14}}/>
        <button className="btn-primary" style={{width:'100%',padding:12}} onClick={()=>{ pin===ADMIN_PIN ? setAuth(true) : toast.error('Wrong PIN') }}>
          Enter
        </button>
      </div>
    </div>
  )

  const stats = {
    total: orders.length,
    revenue: orders.reduce((s,o)=>s+o.your_margin,0),
    pending: orders.filter(o=>o.status==='pending').length
  }

  return (
    <div style={{maxWidth:960,margin:'0 auto',padding:'24px 16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontWeight:700,fontSize:22}}>Admin Dashboard</h1>
        <button onClick={loadOrders} className="btn-primary" style={{padding:'8px 16px',fontSize:13}}>Refresh</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
        {[
          ['Total orders', stats.total],
          ['Pending', stats.pending],
          ['Your margin (KSh)', stats.revenue.toLocaleString()]
        ].map(([label,val]) => (
          <div key={label} className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:28,fontWeight:700,color:'#6366f1'}}>{val}</div>
            <div style={{fontSize:13,color:'#64748b',marginTop:4}}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
          <thead>
            <tr style={{background:'#f8fafc'}}>
              {['Order','Customer','Area','Items','Paid','Margin','Status','Actions'].map(h=>(
                <th key={h} style={{padding:'10px 12px',textAlign:'left',borderBottom:'1px solid #e2e8f0',fontWeight:600}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                <td style={{padding:'10px 12px',fontWeight:600,color:'#6366f1'}}>{o.order_number}</td>
                <td style={{padding:'10px 12px'}}>{o.customer_name}<br/><span style={{fontSize:12,color:'#94a3b8'}}>{o.customer_phone}</span></td>
                <td style={{padding:'10px 12px'}}>{o.delivery_area}</td>
                <td style={{padding:'10px 12px'}}>{Array.isArray(o.items) ? o.items.map(i=>`${i.name} x${i.qty}`).join(', ') : '-'}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background: o.payment_status==='paid' ? '#dcfce7' : '#fef3c7', color: o.payment_status==='paid'?'#166534':'#92400e', padding:'2px 8px',borderRadius:20,fontSize:12}}>
                    {o.payment_status==='paid' ? 'Paid' : 'Pending'}
                  </span>
                </td>
                <td style={{padding:'10px 12px',fontWeight:600,color:'#22c55e'}}>KSh {o.your_margin?.toLocaleString()}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:'#e0e7ff',color:'#3730a3',padding:'2px 8px',borderRadius:20,fontSize:12}}>{o.status}</span>
                </td>
                <td style={{padding:'10px 12px',display:'flex',gap:6,flexWrap:'wrap'}}>
                  {o.payment_status!=='paid' && (
                    <button className="btn-success" style={{fontSize:12,padding:'5px 10px'}} onClick={()=>markPaid(o.id)}>Mark paid</button>
                  )}
                  {o.status==='pending' && (
                    <button className="btn-primary" style={{fontSize:12,padding:'5px 10px'}} onClick={()=>updateStatus(o.id,'processing')}>Process</button>
                  )}
                  {o.status==='processing' && (
                    <button className="btn-success" style={{fontSize:12,padding:'5px 10px'}} onClick={()=>updateStatus(o.id,'delivered')}>Delivered</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
