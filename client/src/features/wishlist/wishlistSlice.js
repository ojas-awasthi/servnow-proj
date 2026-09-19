import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/wishlist");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to load your wishlist."
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.post("/wishlist", {
        serviceId,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to add this service to your wishlist."
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/wishlist/${serviceId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to remove this service from your wishlist."
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.services || [];
        state.error = null;
      })

      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.services || [];
        state.error = null;
      })

      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.services || [];
        state.error = null;
      })

      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearWishlistError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;