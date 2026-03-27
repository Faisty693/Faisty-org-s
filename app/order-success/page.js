'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const ref = params.get('ref')
  return (
    <div style={{maxWidth:480,margin:'80px auto',textAlign:'center',padding:'0 16px'}}>
      <div style={{fontSize:60}}>✓</div>
      <h2 style={{marginTop:16,fontWeight:700,color:'#22c55e'}}>Order placed!</h2>
      <p style={{marginTop:8,color:'#64748b'}}>Reference: <strong>{ref}</strong></p>
      <p style={{marginTop:16,lineHeight:1.7,color:'#475569'}}>
        Please complete your M-Pesa payment now.<br/>
        Your supplier will be notified once payment is confirmed.<br/>
        You will receive updates on your order shortly.
      </p>
      <a href="/"><button className="btn-primary" style={{marginTop:24,padding:'12px 32px'}}>Continue shopping</button></a>
    </div>
  )
}

export default function OrderSuccess() {
  return <Suspense><SuccessContent/></Suspense>
}
