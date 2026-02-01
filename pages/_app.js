import '../styles/globals.css'
import { AuthProvider } from '../lib/authContext'
import { ThemeProvider } from '../lib/themeContext'
import AppLayout from '../components/layout/AppLayout'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </AuthProvider>
    </ThemeProvider>
  )
}
