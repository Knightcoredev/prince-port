import '../styles/globals.css';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MyApp({ Component, pageProps, router }) {
  // Pages that don't need Navbar/Footer
  const noLayoutPages = ['/admin'];
  const showLayout = !noLayoutPages.some(page => router.pathname.startsWith(page));

  return (
    <CartProvider>
      {showLayout ? (
        <>
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </>
      ) : (
        <Component {...pageProps} />
      )}
    </CartProvider>
  );
}

export default MyApp;
