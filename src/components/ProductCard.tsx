// src/components/ProductCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, ToggleLeft, ToggleRight, Calendar } from "lucide-react";
import { Product } from "@/types/products";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onToggleStatus: (id: number) => void;
}

export function ProductCard({
  product,
  onEdit,
  onToggleStatus,
}: ProductCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight break-words">
              {product.nome}
            </CardTitle>
            {/* CORREÇÃO: Remover CardDescription e usar div normal */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={product.active ? "default" : "secondary"}>
                {product.active ? "Ativo" : "Inativo"}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(product.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Descrição */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Descrição</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncateText(product.descricao_detalhada, 120)}
          </p>
        </div>

        {/* Prompt Consultivo */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Prompt Consultivo</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncateText(product.prompt_consultivo, 100)}
          </p>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="h-8 w-8 p-0"
              title="Editar produto"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(product.id)}
              className="h-8 w-8 p-0"
              title={product.active ? "Desativar produto" : "Ativar produto"}
            >
              {product.active ? (
                <ToggleRight className="h-4 w-4 text-green-600" />
              ) : (
                <ToggleLeft className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {product.descricao_detalhada.length} chars •{" "}
            {product.prompt_consultivo.length} chars
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
