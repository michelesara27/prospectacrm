// src/hooks/useProducts.tsx
import { useState, useEffect } from "react";
import { productsService } from "@/services/productsService";
import {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductStats,
} from "@/types/products";

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  stats: ProductStats;

  addProduct: (product: ProductCreate) => Promise<boolean>;
  updateProduct: (id: number, product: ProductUpdate) => Promise<boolean>;
  toggleProductStatus: (id: number) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
  clearError: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    ativos: 0,
    inativos: 0,
  });

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsResponse, statsResponse] = await Promise.all([
        productsService.getProducts(),
        productsService.getProductsStats(),
      ]);

      if (productsResponse.error) {
        throw new Error(productsResponse.error);
      }

      if (statsResponse.error) {
        console.error("Erro ao carregar estatísticas:", statsResponse.error);
      }

      setProducts(productsResponse.data || []);
      setStats({
        total: statsResponse.total,
        ativos: statsResponse.ativos,
        inativos: statsResponse.inativos,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar produtos";

      setError(errorMessage);
      console.error("Erro ao carregar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = async (productData: ProductCreate): Promise<boolean> => {
    try {
      setError(null);

      const { data, error } = await productsService.createProduct(productData);

      if (error) {
        throw new Error(error);
      }

      if (data) {
        await refreshProducts(); // Recarregar a lista
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar produto";

      setError(errorMessage);
      console.error("Erro ao criar produto:", err);
      return false;
    }
  };

  const updateProduct = async (
    id: number,
    productData: ProductUpdate
  ): Promise<boolean> => {
    try {
      setError(null);

      const { data, error } = await productsService.updateProduct(
        id,
        productData
      );

      if (error) {
        throw new Error(error);
      }

      if (data) {
        setProducts((prev) =>
          prev.map((product) => (product.id === id ? data : product))
        );
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar produto";

      setError(errorMessage);
      console.error("Erro ao atualizar produto:", err);
      return false;
    }
  };

  const toggleProductStatus = async (id: number): Promise<boolean> => {
    try {
      setError(null);

      const { data, error } = await productsService.toggleProductStatus(id);

      if (error) {
        throw new Error(error);
      }

      if (data) {
        setProducts((prev) =>
          prev.map((product) => (product.id === id ? data : product))
        );

        // Atualizar estatísticas
        const statsResponse = await productsService.getProductsStats();
        if (!statsResponse.error) {
          setStats({
            total: statsResponse.total,
            ativos: statsResponse.ativos,
            inativos: statsResponse.inativos,
          });
        }

        return true;
      }

      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro ao alternar status do produto";

      setError(errorMessage);
      console.error("Erro ao alternar status do produto:", err);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    products,
    loading,
    error,
    stats,
    addProduct,
    updateProduct,
    toggleProductStatus,
    refreshProducts,
    clearError,
  };
};
