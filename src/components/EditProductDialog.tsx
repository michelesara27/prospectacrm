// src/components/EditProductDialog.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Product, ProductUpdate } from "@/types/products";

const editProductFormSchema = z.object({
  nome: z.string().min(1, "Nome do produto é obrigatório"),
  descricao_detalhada: z
    .string()
    .min(100, "Descrição deve ter pelo menos 100 caracteres"),
  prompt_consultivo: z
    .string()
    .min(100, "Prompt consultivo deve ter pelo menos 100 caracteres"),
  active: z.boolean(),
});

type EditProductFormData = z.infer<typeof editProductFormSchema>;

interface EditProductDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onUpdateProduct: (id: number, product: ProductUpdate) => Promise<boolean>;
}

export function EditProductDialog({
  open,
  product,
  onClose,
  onUpdateProduct,
}: EditProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductFormSchema),
    defaultValues: {
      nome: product?.nome || "",
      descricao_detalhada: product?.descricao_detalhada || "",
      prompt_consultivo: product?.prompt_consultivo || "",
      active: product?.active ?? true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        nome: product.nome || "",
        descricao_detalhada: product.descricao_detalhada || "",
        prompt_consultivo: product.prompt_consultivo || "",
        active: product.active ?? true,
      });
    }
  }, [product]);

  const onSubmit = async (data: EditProductFormData) => {
    if (!product) return;
    try {
      setIsSubmitting(true);

      const success = await onUpdateProduct(product.id, {
        nome: data.nome,
        descricao_detalhada: data.descricao_detalhada,
        prompt_consultivo: data.prompt_consultivo,
        active: data.active,
      });

      if (success) {
        toast.success("Produto atualizado com sucesso!", {
          description: "As alterações foram salvas.",
          duration: 3000,
        });
        onClose();
      } else {
        toast.error("Erro ao atualizar produto", {
          description: "Ocorreu um erro inesperado. Tente novamente.",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao atualizar produto", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto/Serviço</DialogTitle>
          <DialogDescription>
            Atualize as informações do produto/serviço selecionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto/Serviço *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Consultoria em Transformação Digital"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao_detalhada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente o produto ou serviço, incluindo benefícios, funcionalidades e casos de uso..."
                      className="min-h-[150px] resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Mínimo 100 caracteres. Atualmente: {field.value.length}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt_consultivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt Consultivo *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Forneça orientações detalhadas sobre como apresentar e vender este produto/serviço, incluindo tom de voz, objeções comuns e argumentos de venda..."
                      className="min-h-[200px] resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Mínimo 100 caracteres. Atualmente: {field.value.length}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Status do Produto</FormLabel>
                    <DialogDescription>
                      Defina se o produto/serviço está ativo no catálogo.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !product}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
