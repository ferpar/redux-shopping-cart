import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { checkout, CartItems } from "../../app/api";
import { RootState, AppDispatch } from "../../app/store";

type CheckoutState = "LOADING" | "READY" | "ERROR";
export interface CartState {
  items: { [productID: string]: number };
  checkoutState?: CheckoutState;
}

const initialState: CartState = {
  items: {},
  checkoutState: "READY",
};

export const checkoutCart = createAsyncThunk(
  "cart/checkout",
  async (items: CartItems) => {
    const response = await checkout(items);
    return response;
  }
);
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id]++;
        return;
      } else {
        state.items[id] = 1;
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    updateQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;
      state.items[id] = quantity;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkoutCart.pending, (state) => {
      state.checkoutState = "LOADING";
    });
    builder.addCase(checkoutCart.fulfilled, (state, action) => {
      state.checkoutState = "READY";
    });
    builder.addCase(checkoutCart.rejected, (state, action) => {
      state.checkoutState = "ERROR";
    });
  },
});

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;

export function getNumItems(state: RootState) {
  let numItems = 0;
  for (let id in state.cart.items) {
    numItems += state.cart.items[id];
  }
  return numItems;
}

export const getMemoizedNumItems = createSelector(
  (state: RootState) => state.cart.items,
  (items) => {
    let numItems = 0;
    for (let id in items) {
      numItems += items[id];
    }
    return numItems;
  }
);

export const getTotalPrice = createSelector(
  (state: RootState) => state.cart.items,
  (state: RootState) => state.products.products,
  (items, products) => {
    let total = 0;
    for (let id in items) {
      total += items[id] * products[id].price;
    }
    return total.toFixed(2);
  }
);
