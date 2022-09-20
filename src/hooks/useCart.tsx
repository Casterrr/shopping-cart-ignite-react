import { error } from 'console';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productExistsInCart = cart.find(product => product.id === productId)
      
      const productStock = await api.get(`/stock/${productId}`)
      const productStockAmount = productStock.data.amount

      const currentAmountInStock = productExistsInCart ? productExistsInCart.amount : 0

      const desiredAmount = currentAmountInStock + 1

      if (productStockAmount > desiredAmount) {
        if (productExistsInCart) {
          productExistsInCart.amount = desiredAmount
        } else {
          const product = (await api.get(`/products/${productId}`)).data

          const productWithAmount = {
            ...product,
            amount: 1
          }

          setCart([...cart, productWithAmount])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
        }
      } else {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
