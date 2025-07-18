import React, { useState, useEffect } from 'react';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ProductGrid } from './components/Products/ProductGrid';
import { ProductDetail } from './components/Products/ProductDetail';
import { CartPage } from './components/Cart/CartPage';
import { CheckoutPage } from './components/Checkout/CheckoutPage';
import { InstallPrompt } from './components/InstallPrompt';
import { NotificationPermission } from './components/NotificationPermission';
import { useProducts } from './hooks/useProducts';
import { useCart } from './hooks/useCart';
import { db, Product } from './utils/db';
import { notificationManager } from './utils/notifications';

type Page = 'home' | 'products' | 'cart' | 'checkout';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { products, loading, searchProducts } = useProducts();
  const { addToCart } = useCart();

  useEffect(() => {
    // Initialize database and notifications
    const initializeApp = async () => {
      await db.init();
      await notificationManager.init();
    };

    initializeApp();
  }, []);

  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    const cartItem = {
      id: Date.now(),
      productId: product.id,
      quantity,
      price: product.price,
      name: product.name,
      image: product.image
    };

    await addToCart(cartItem);
    
    // Show notification
    if (Notification.permission === 'granted') {
      await notificationManager.sendNotification('Added to Cart!', {
        body: `${product.name} has been added to your cart`,
        icon: product.image
      });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page as Page);
    setSelectedProduct(null);
  };

  const handleCartClick = () => {
    setCurrentPage('cart');
    setSidebarOpen(false);
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleBackToCart = () => {
    setCurrentPage('cart');
  };

  const filteredProducts = searchQuery ? searchProducts(searchQuery) : products;

  const renderContent = () => {
    if (selectedProduct) {
      return (
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackToProducts}
          onAddToCart={handleAddToCart}
        />
      );
    }

    switch (currentPage) {
      case 'cart':
        return <CartPage onCheckout={handleCheckout} />;
      case 'checkout':
        return <CheckoutPage onBack={handleBackToCart} />;
      case 'home':
      case 'products':
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {searchQuery ? 'Search Results' : 'Featured Products'}
              </h1>
              <p className="text-gray-600">
                {searchQuery 
                  ? `Found ${filteredProducts.length} products for "${searchQuery}"`
                  : 'Discover our latest collection of amazing products'
                }
              </p>
            </div>
            
            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
              loading={loading}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCartClick={handleCartClick}
        onMenuClick={() => setSidebarOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        
        <main className="flex-1 md:ml-64">
          {renderContent()}
        </main>
      </div>
      
      <InstallPrompt />
      <NotificationPermission />
    </div>
  );
}

export default App;