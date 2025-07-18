import { useState, useEffect } from 'react';
import { db, Product } from '../utils/db';

// Sample product data
const sampleProducts: Product[] = [
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Premium wireless headphones with noise cancellation and 30-hour battery life.',
    category: 'Electronics',
    stock: 15
  },
  {
    id: 2,
    name: 'Smart Fitness Watch',
    price: 199.99,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Track your fitness goals with this advanced smartwatch featuring GPS and heart rate monitoring.',
    category: 'Electronics',
    stock: 8
  },
  {
    id: 3,
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: 'https://images.pexels.com/photos/1020370/pexels-photo-1020370.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Comfortable and sustainable organic cotton t-shirt in various colors.',
    category: 'Clothing',
    stock: 25
  },
  {
    id: 4,
    name: 'Portable Coffee Maker',
    price: 89.99,
    image: 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Brew perfect coffee anywhere with this compact and efficient portable coffee maker.',
    category: 'Kitchen',
    stock: 12
  },
  {
    id: 5,
    name: 'Yoga Mat Premium',
    price: 49.99,
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Non-slip premium yoga mat with extra cushioning for comfort during workouts.',
    category: 'Sports',
    stock: 18
  },
  {
    id: 6,
    name: 'Wireless Charging Pad',
    price: 34.99,
    image: 'https://images.pexels.com/photos/4195342/pexels-photo-4195342.jpeg?auto=compress&cs=tinysrgb&w=500',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    category: 'Electronics',
    stock: 22
  }
];

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let dbProducts = await db.getProducts();
      
      // If no products in IndexedDB, add sample products
      if (dbProducts.length === 0) {
        await db.addProducts(sampleProducts);
        dbProducts = await db.getProducts();
      }
      
      setProducts(dbProducts);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: number): Promise<Product | undefined> => {
    try {
      return await db.getProduct(id);
    } catch (err) {
      console.error('Error getting product:', err);
      return undefined;
    }
  };

  const searchProducts = (query: string): Product[] => {
    if (!query.trim()) return products;
    
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product => product.category === category);
  };

  const getCategories = (): string[] => {
    return [...new Set(products.map(product => product.category))];
  };

  return {
    products,
    loading,
    error,
    getProduct,
    searchProducts,
    getProductsByCategory,
    getCategories
  };
};