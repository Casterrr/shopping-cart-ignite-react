import { createContext, ReactNode, useContext, useState } from 'react';
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
      const updatedCart = [...cart];

      const productExistsInCart = updatedCart.find(product => product.id === productId);
      
      const productStock = await api.get<Stock>(`/stock/${productId}`);
      const productStockAmount = productStock.data.amount;

      const currentAmountInCart = productExistsInCart ? productExistsInCart.amount : 0;

      const desiredAmount = currentAmountInCart + 1;

      if (desiredAmount > productStockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (productExistsInCart) {
        productExistsInCart.amount = desiredAmount;
      } else {
        const product = (await api.get<Product>(`/products/${productId}`)).data;

        const productWithAmount = {
          ...product,
          amount: 1
        };

        updatedCart.push(productWithAmount);
        
      }
      setCart(updatedCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const currentCart = [...cart]

      const productExists = currentCart.find(product => product.id === productId)

      if (!productExists) {
        throw Error();
      }

      const updatedCart = currentCart.filter(product => product.id !== productId)

      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) { return }

      const currentCart = [...cart];

      const product = currentCart.find(product => product.id === productId)
      // currentCart.find(product => product.id === productId ? product.amount = amount : null)

      const productStock = await api.get<Stock>(`/stock/${productId}`);
      const productStockAmount = productStock.data.amount;

      if (!product) {
        return
      }

      if (amount > productStockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }


      const updatedCart = currentCart.map(product => {
          if (product.id === productId) { 
            product.amount = amount 
            return product
          } else {
            return product
          }
        }
      )
      
      setCart(updatedCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));

      return
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }

    return
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
