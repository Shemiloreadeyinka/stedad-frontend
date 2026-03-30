import { createContext, useContext, useReducer, useCallback } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const productId = action.product._id ?? action.product.id
      if (!productId) return state
      const existing = state.items.find(i => i.productId === productId)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === productId
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            productId,
            name:      action.product.name,
            price:     action.product.price,
            stock:     action.product.quantityLeft,
            quantity:  1,
          },
        ],
      }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.productId !== action.productId) }
    case 'SET_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.productId
            ? { ...i, quantity: Math.max(1, Math.min(action.qty, i.stock)) }
            : i
        ),
      }
    case 'CLEAR':
      return { ...state, items: [] }
    case 'SET_CUSTOMER':
      return { ...state, customerName: action.name }
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.method }
    case 'SET_STATUS':
      return { ...state, status: action.status }
    default:
      return state
  }
}

const initialState = {
  items:         [],
  customerName:  '',
  paymentMethod: 'Cash',
  status:        true,
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState)

  const addItem      = useCallback((product) => dispatch({ type: 'ADD', product }), [])
  const removeItem   = useCallback((productId) => dispatch({ type: 'REMOVE', productId }), [])
  const setQty       = useCallback((productId, qty) => dispatch({ type: 'SET_QTY', productId, qty }), [])
  const clearCart    = useCallback(() => dispatch({ type: 'CLEAR' }), [])
  const setCustomer  = useCallback((name) => dispatch({ type: 'SET_CUSTOMER', name }), [])
  const setPayment   = useCallback((method) => dispatch({ type: 'SET_PAYMENT', method }), [])
  const setStatus    = useCallback((status) => dispatch({ type: 'SET_STATUS', status }), [])

  const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, total, count, addItem, removeItem, setQty, clearCart, setCustomer, setPayment, setStatus }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
