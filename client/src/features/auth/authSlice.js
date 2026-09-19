import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

const storedToken = localStorage.getItem("servnow_token");

const initialState = {
  user: null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
  loading: Boolean(storedToken),
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Your session has expired."
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("servnow_token");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
  const { token, user } = action.payload.data;

  state.loading = false;
  state.token = token;
  state.user = user;
  state.isAuthenticated = true;

  localStorage.setItem("servnow_token", token);
})

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
  const { token, user } = action.payload.data;

  state.loading = false;
  state.token = token;
  state.user = user;
  state.isAuthenticated = true;

  localStorage.setItem("servnow_token", token);
})

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // CURRENT USER
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(fetchCurrentUser.rejected, (state) => {
  state.loading = false;
  state.user = null;
  state.token = null;
  state.isAuthenticated = false;
  state.error = null;

  localStorage.removeItem("servnow_token");
});
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;