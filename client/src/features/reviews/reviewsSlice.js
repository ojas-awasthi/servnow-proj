import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchServiceReviews = createAsyncThunk(
  "reviews/fetchServiceReviews",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/reviews/service/${serviceId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to load reviews."
      );
    }
  }
);

export const createReview = createAsyncThunk(
  "reviews/createReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/reviews",
        reviewData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to submit your review."
      );
    }
  }
);

export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async (
    { reviewId, rating, comment },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(
        `/reviews/${reviewId}`,
        {
          rating,
          comment,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to update your review."
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/reviews/${reviewId}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to delete your review."
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  submitting: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,

  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchServiceReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.error = null;
      })

      .addCase(fetchServiceReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })

      .addCase(createReview.fulfilled, (state, action) => {
        state.submitting = false;

        if (action.payload.data) {
          state.items = [
            action.payload.data,
            ...state.items,
          ];
        }

        state.error = null;
      })

      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      .addCase(updateReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })

      .addCase(updateReview.fulfilled, (state, action) => {
        state.submitting = false;

        const updatedReview = action.payload.data;

        state.items = state.items.map((review) =>
          review._id === updatedReview._id
            ? updatedReview
            : review
        );

        state.error = null;
      })

      .addCase(updateReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      .addCase(deleteReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })

      .addCase(deleteReview.fulfilled, (state, action) => {
        state.submitting = false;

        const deletedId = action.payload.data?.id;

        state.items = state.items.filter(
          (review) => review._id !== deletedId
        );

        state.error = null;
      })

      .addCase(deleteReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearReviewError,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;