import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../services/api";

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/services", {
        params,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to load services."
      );
    }
  }
);

const initialState = {
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: "services",

  initialState,

  reducers: {
    clearServicesError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;

        state.items = action.payload.data || [];

        state.pagination =
          action.payload.pagination || {
            page: 1,
            limit: 10,
            total: state.items.length,
            totalPages: 1,
          };
      })

      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to load services.";
      });
  },
});

export const { clearServicesError } = servicesSlice.actions;

export default servicesSlice.reducer;