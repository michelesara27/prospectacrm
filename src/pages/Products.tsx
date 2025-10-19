// src/pages/Products.tsx
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { NewProductDialog } from "@/components/NewProductDialog";
import { ProductCard } from "@/components/ProductCard";
import { EditProductDialog } from "@/components/EditProductDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Product } from "@/types/products";

const Products = () => {
  const {
    products,
    loading,
    error,
    stats,
    addProduct,
    updateProduct,
    toggleProductStatus,
    refreshProducts,
    clearError,
  } = useProducts();

  const [refreshing, setRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleToggleStatus = async (id: number) => {
    const success = await toggleProductStatus(id);
    if (success) {
      console.log("Status do produto alterado com sucesso");
    }
  };

  const statCards = [
    {
      title: "Total de Produtos",
      value: stats.total,
      description: "Produtos cadastrados",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Produtos Ativos",
      value: stats.ativos,
      description: "Disponíveis para uso",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Produtos Inativos",
      value: stats.inativos,
      description: "Fora de circulação",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Taxa de Ativos",
      value:
        stats.total > 0
          ? `${((stats.ativos / stats.total) * 100).toFixed(1)}%`
          : "0%",
      description: "Percentual ativo",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Produtos & Serviços
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seu catálogo de produtos e serviços
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <NewProductDialog onAddProduct={addProduct} />
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => {
                clearError();
                handleRefresh();
              }}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full ${stat.bgColor} opacity-20`}
            ></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos/Serviços</CardTitle>
          <CardDescription>
            {products.length === 0
              ? "Nenhum produto cadastrado"
              : `${products.length} produto(s) encontrado(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading State
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Comece adicionando seu primeiro produto ou serviço ao catálogo.
              </p>
              <NewProductDialog onAddProduct={addProduct} />
            </div>
          ) : (
            // Grid de Produtos
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Edição */}
      <EditProductDialog
        open={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={updateProduct}
      />

      {/* Guia Rápido */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Dicas para um Catálogo Eficiente
          </CardTitle>
          <CardDescription>
            Boas práticas para gerenciar seus produtos e serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Descrições Detalhadas</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Inclua benefícios claros, casos de uso e diferenciais
                competitivos.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Prompts Estratégicos</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Oriente sua equipe com argumentos de venda e respostas a
                objeções.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Status Atualizados</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Mantenha apenas produtos ativos no catálogo para evitar
                confusão.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Organização</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Categorize produtos de forma lógica para fácil navegação e
                busca.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
