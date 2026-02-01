import '../styles/globals.css'
import { AuthProvider } from '../lib/authContext'
import { ThemeProvider } from '../lib/themeContext'

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  )
}
