import { useEffect } from "react";
import {
  ArrowRight,
  Heart,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Skeleton from "../../components/common/Skeleton";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../../features/wishlist/wishlistSlice";

function Wishlist() {
  const dispatch = useDispatch();

  const {
    items,
    loading,
    error,
  } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Customer dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Wishlist
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Services you've saved for later.
          </p>
        </div>

        {error && (
          <Card className="mt-6 rounded-2xl border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </Card>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
        ) : items.length === 0 ? (
          <Card className="mt-8 rounded-3xl p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Heart
                className="h-6 w-6 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Save services you're interested in and come back to
              them whenever you're ready.
            </p>

            <Link
              to="/services"
              className="mt-5 inline-block"
            >
              <Button>
                Explore services
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service) => (
              <Card
                key={service._id}
                className="group overflow-hidden rounded-3xl"
              >
                <div className="relative flex h-40 items-center justify-center bg-slate-100">
                  <Heart
                    className="h-10 w-10 text-slate-300"
                    aria-hidden="true"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        removeFromWishlist(service._id)
                      )
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-all duration-200 hover:text-red-600 active:scale-95"
                    aria-label={`Remove ${service.title} from wishlist`}
                    title="Remove from wishlist"
                  >
                    <Trash2
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-2 text-base font-semibold text-slate-950">
                      {service.title}
                    </h2>

                    {service.isFeatured && (
                      <Badge variant="success">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                    {service.description}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">
                        Starting from
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-950">
                        ₹
                        {Number(
                          service.price || 0
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <Link
                      to={`/services/${service._id}`}
                    >
                      <Button size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Wishlist;