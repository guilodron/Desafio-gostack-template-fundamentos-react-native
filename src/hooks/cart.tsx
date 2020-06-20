import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productList = await AsyncStorage.getItem('@GoMarket:products');
      if (productList) setProducts([...JSON.parse(productList)]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productAlreadyAdded = products.find(
        produto => produto.id === product.id,
      );
      if (productAlreadyAdded) {
        const newList = products.map(produto => {
          if (produto.id === product.id) {
            return { ...produto, quantity: produto.quantity + 1 };
          }
          return produto;
        });
        setProducts(newList);
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(newList),
        );
      } else {
        const newProduct = product;
        newProduct.quantity = 1;
        const newList = [...products, newProduct];
        setProducts(newList);
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(newList),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newList = products.map(produto => {
        if (produto.id === id) {
          return { ...produto, quantity: produto.quantity + 1 };
        }
        return produto;
      });
      setProducts(newList);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newList = products.map(produto => {
        if (produto.id === id) {
          return { ...produto, quantity: produto.quantity - 1 };
        }
        return produto;
        return produto;
      });
      setProducts(newList);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
