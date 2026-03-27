import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata = {
  title: 'My Marketplace',
  description: 'Shop quality products',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}
