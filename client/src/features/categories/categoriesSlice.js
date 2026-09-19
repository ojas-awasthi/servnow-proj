import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Unable to load categories."
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to load categories.";
      });
  },
});

export const { clearCategoriesError } = categoriesSlice.actions;

export default categoriesSlice.reducer;