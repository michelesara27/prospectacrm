// src/components/NewProductDialog.tsx
import { useState } from "react";
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
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const productFormSchema = z.object({
  nome: z.string().min(1, "Nome do produto é obrigatório"),
  descricao_detalhada: z
    .string()
    .min(100, "Descrição deve ter pelo menos 100 caracteres"),
  prompt_consultivo: z
    .string()
    .min(100, "Prompt consultivo deve ter pelo menos 100 caracteres"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface NewProductDialogProps {
  onAddProduct: (product: ProductFormData) => Promise<boolean>;
}

export function NewProductDialog({ onAddProduct }: NewProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nome: "",
      descricao_detalhada: "",
      prompt_consultivo: "",
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);

      const success = await onAddProduct(data);

      if (success) {
        form.reset();
        setOpen(false);
        toast.success("Produto cadastrado com sucesso!", {
          description: "O novo produto/serviço foi adicionado ao catálogo.",
          duration: 3000,
        });
      } else {
        toast.error("Erro ao cadastrar produto", {
          description: "Ocorreu um erro inesperado. Tente novamente.",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao cadastrar produto", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto/Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto/Serviço</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo produto ou serviço para adicionar ao
            catálogo.
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Produto"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
