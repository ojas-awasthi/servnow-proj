import { configureStore } from "@reduxjs/toolkit";
import servicesReducer from "../features/services/servicesSlice";
import authReducer from "../features/auth/authSlice";
import categoriesReducer from "../features/categories/categoriesSlice";
import bookingsReducer from "../features/bookings/bookingsSlice";
import wishlistReducer from "../features/wishlist/wishlistSlice";
import reviewsReducer from "../features/reviews/reviewsSlice";

const store = configureStore({
  reducer: {
    services: servicesReducer,
    categories: categoriesReducer,
    auth: authReducer,
    bookings: bookingsReducer,
    wishlist: wishlistReducer,
    reviews: reviewsReducer,
  },
});

export default store;