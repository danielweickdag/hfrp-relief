"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Script from "next/script";

interface ConnectedAccount {
  id: string;
  email: string;
  business_profile?: {
    name?: string;
    url?: string;
  };
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  created: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  default_price?: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring?: {
      interval: string;
    };
  };
  images: string[];
}

export default function ConnectDashboard() {
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  // Product form state
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState(1000);

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/connect/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setAccount(data.account);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/connect/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account.id,
          name: productName,
          description: productDescription,
          price: productPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setProducts([...products, data.product]);
      setProductName("");
      setProductDescription("");
      setProductPrice(1000);
      setShowProductForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/stripe/connect/products?accountId=${account.id}`,
      );
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (priceId: string) => {
    if (!account) return;

    try {
      const response = await fetch("/api/stripe/connect/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          accountId: account.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        setError(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    if (account && showProducts) {
      loadProducts();
    }
  }, [account, showProducts]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          HFRP Relief | Connect Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage Stripe Connect accounts and products for your relief
          organization
        </p>
      </div>

      {/* Quick Access Links */}
      <div id="quick-access" className="mb-8"></div>

      {/* Products Container */}
      <div id="products-container" className="space-y-4">
        <p className="text-muted-foreground">Products will appear here...</p>
      </div>

      {/* Enhanced Products List with Template */}
      <div id="products-list" className="space-y-4 mt-6">
        {/* Hidden template for product cloning */}
        <div className="product hidden border rounded-lg p-4 bg-card">
          <h4 className="product-name font-semibold text-lg mb-2"></h4>
          <p className="product-price text-xl font-bold text-primary mb-2"></p>
          <p className="product-description text-muted-foreground mb-4"></p>
          <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
            <input type="hidden" name="priceId" />
            <input type="hidden" name="accountId" />
            <Button type="submit" className="w-full">
              Buy Now
            </Button>
          </form>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!account ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Connected Account</CardTitle>
            <CardDescription>
              Create a new Stripe Connect account for a partner organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAccount} className="space-y-4">
              <div>
                <Label htmlFor="email">Email for Connected Account</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@organization.org"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Connect Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Connected account: {account.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Charges:</span>
                  <Badge
                    variant={
                      account.charges_enabled ? "default" : "destructive"
                    }
                  >
                    {account.charges_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Payouts:</span>
                  <Badge
                    variant={
                      account.payouts_enabled ? "default" : "destructive"
                    }
                  >
                    {account.payouts_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Details:</span>
                  <Badge
                    variant={
                      account.details_submitted ? "default" : "secondary"
                    }
                  >
                    {account.details_submitted ? "Submitted" : "Pending"}
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Email: {account.email} | Created:{" "}
                  {formatDate(account.created)}
                </p>
                {account.business_profile?.name && (
                  <p className="text-sm text-muted-foreground">
                    Business: {account.business_profile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Management */}
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Create and manage products for this connected account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowProductForm(!showProductForm)}
                  variant="outline"
                >
                  {showProductForm ? "Cancel" : "Add New Product"}
                </Button>

                {showProductForm && (
                  <Card>
                    <CardContent className="pt-6">
                      <form onSubmit={createProduct} className="space-y-4">
                        <div>
                          <Label htmlFor="productName">Product Name</Label>
                          <Input
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Relief Package"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="productDescription">
                            Description
                          </Label>
                          <Input
                            id="productDescription"
                            value={productDescription}
                            onChange={(e) =>
                              setProductDescription(e.target.value)
                            }
                            placeholder="Emergency relief package for families"
                          />
                        </div>
                        <div>
                          <Label htmlFor="productPrice">Price (in cents)</Label>
                          <Input
                            id="productPrice"
                            type="number"
                            value={productPrice}
                            onChange={(e) =>
                              setProductPrice(Number(e.target.value))
                            }
                            min="100"
                            required
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Current price: {formatPrice(productPrice, "usd")}
                          </p>
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Creating..." : "Create Product"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={() => {
                    setShowProducts(!showProducts);
                    if (!showProducts) loadProducts();
                  }}
                  variant="outline"
                >
                  {showProducts ? "Hide Products" : "Show Products"}
                </Button>

                {showProducts && (
                  <div className="space-y-4">
                    {products.length === 0 ? (
                      <p className="text-muted-foreground">
                        No products found.
                      </p>
                    ) : (
                      products.map((product) => (
                        <Card key={product.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex space-x-4">
                                <img
                                  src={
                                    product.images[0] ||
                                    "https://i.imgur.com/6Mvijcm.png"
                                  }
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div>
                                  <h3 className="font-semibold">
                                    {product.name}
                                  </h3>
                                  {product.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {product.description}
                                    </p>
                                  )}
                                  {product.default_price && (
                                    <p className="text-lg font-medium">
                                      {formatPrice(
                                        product.default_price.unit_amount,
                                        product.default_price.currency,
                                      )}
                                      {product.default_price.recurring && (
                                        <span className="text-sm text-muted-foreground">
                                          {" "}
                                          /{" "}
                                          {
                                            product.default_price.recurring
                                              .interval
                                          }
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {product.default_price && (
                                <Button
                                  onClick={() =>
                                    createCheckoutSession(
                                      product.default_price!.id,
                                    )
                                  }
                                  size="sm"
                                >
                                  Checkout
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reset */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={() => {
                  setAccount(null);
                  setProducts([]);
                  setShowProducts(false);
                  setShowProductForm(false);
                }}
                variant="outline"
              >
                Create New Account
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
