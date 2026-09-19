import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post("/bookings", bookingData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to create your booking."
      );
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "bookings/fetchMyBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/bookings", {
        params,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to load your bookings."
      );
    }
  }
);

const initialState = {
  items: [],
  currentBooking: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loading: false,
  error: null,
};

const bookingsSlice = createSlice({
  name: "bookings",

  initialState,

  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },

    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE BOOKING
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;

        state.currentBooking =
          action.payload.data || null;

        state.error = null;
      })

      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH BOOKINGS
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;

        state.items = action.payload.data || [];

        state.pagination =
          action.payload.pagination ||
          state.pagination;

        state.error = null;
      })

      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearBookingError,
  clearCurrentBooking,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;