import '../styles/globals.css'
import { fontClassNames } from '@/lib/fonts'

export const metadata = {
  title: 'Remora - DeFi Super App',
  description: 'Payroll streams, remittance, copy-trading on Aptos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${fontClassNames} min-h-screen flex flex-col antialiased`}>{children}</body>
    </html>
  )
}