import '../styles/globals.css'
import { fontClassNames } from '@/lib/fonts'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { ErrorBoundary } from '@/components/providers/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

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
      <body className={`${fontClassNames} min-h-screen flex flex-col antialiased`}>
        <ErrorBoundary>
          <WalletProvider>
            {children}
            <Toaster position="top-right" />
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}