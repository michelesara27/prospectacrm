// src/components/EditLeadDialog.tsx
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { leadFormSchema } from "@/lib/validations";
import { Lead, LeadUpdate } from "@/types/leads";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import {
  ESTADOS_BRASILEIROS,
  LEAD_STATUS,
  ACTIVE_OPTIONS,
} from "@/lib/validations";
import { productsService } from "@/services/productsService";
import { type Product } from "@/types/products";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof leadFormSchema>;

interface EditLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateLead: (id: number, lead: LeadUpdate) => Promise<boolean>;
  checkDuplicates: (
    email: string,
    instagram?: string,
    website?: string,
    excludeId?: number
  ) => Promise<{ isDuplicate: boolean; field?: string }>;
}

export function EditLeadDialog({
  lead,
  open,
  onOpenChange,
  onUpdateLead,
  checkDuplicates,
}: EditLeadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      instagram: "",
      decisor: "",
      endereco: "",
      cidade: "",
      estado: "",
      website: "",
      id_produto: 0,
      status: "SEM RETORNO",
      active: "yes",
      observacoes: "",
    },
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [productOpen, setProductOpen] = useState<boolean>(false);

  // Atualizar o formulário quando o lead mudar
  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.nome || "",
        email: lead.email || "",
        phone: lead.telefone || "",
        instagram: lead.instagram || "",
        decisor: lead.decisor || "",
        endereco: lead.endereco || "",
        cidade: lead.cidade || "",
        estado: lead.estado || "",
        website: lead.website || "",
        id_produto: (lead as any).id_product ?? lead.id_produto ?? 0,
        status: lead.status || "SEM RETORNO",
        active: lead.active || "yes",
        observacoes: lead.observacoes || "",
      });
    }
  }, [lead, form]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data, error } = await productsService.getProducts();
        if (error) {
          console.error("Erro ao carregar produtos:", error);
          return;
        }
        setProducts(data || []);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === form.getValues("id_produto")),
    [products, form.watch("id_produto")]
  );

  const onSubmit = async (data: FormData) => {
    if (!lead) return;

    setIsSubmitting(true);
    try {
      // Verificar duplicatas apenas se os campos foram alterados
      const emailChanged = data.email !== lead.email;
      const instagramChanged = data.instagram !== lead.instagram;
      const websiteChanged = data.website !== lead.website;

      if (emailChanged || instagramChanged || websiteChanged) {
        const duplicateCheck = await checkDuplicates(
          data.email,
          data.instagram || undefined,
          data.website || undefined,
          lead.id
        );

        if (duplicateCheck.isDuplicate) {
          form.setError(duplicateCheck.field as keyof FormData, {
            type: "manual",
            message: `Este ${
              duplicateCheck.field === "email"
                ? "e-mail"
                : duplicateCheck.field === "instagram"
                ? "Instagram"
                : "website"
            } já está cadastrado.`,
          });
          return;
        }
      }

      const updatePayload: LeadUpdate = {
        nome: data.name || undefined,
        email: data.email || undefined,
        telefone: data.phone || undefined,
        instagram: data.instagram || undefined,
        decisor: data.decisor || undefined,
        endereco: data.endereco || undefined,
        cidade: data.cidade || undefined,
        estado: data.estado || undefined,
        website: data.website || undefined,
        // Enviar id_product somente se alterado em relação ao valor atual (id_product ou id_produto)
        ...(() => {
          const currentLeadProductId = (lead as any).id_product ?? lead.id_produto ?? 0;
          return data.id_produto !== currentLeadProductId
            ? { id_product: data.id_produto }
            : {};
        })(),
        status: data.status || undefined,
        active: data.active || undefined,
        observacoes: data.observacoes || undefined,
      };

      const success = await onUpdateLead(lead.id, updatePayload);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>
            Atualize as informações do lead conforme necessário.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo"
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
                name="decisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decisor *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do decisor"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="id_produto"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Produto/Serviço *</FormLabel>
                  <Popover open={productOpen} onOpenChange={setProductOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productOpen}
                        className="w-full justify-between"
                        disabled={isSubmitting || loadingProducts}
                      >
                        {selectedProduct ? selectedProduct.nome : loadingProducts ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando produtos...
                          </span>
                        ) : (
                          "Selecione um produto/serviço"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar produto/serviço..." />
                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.nome}
                                onSelect={() => {
                                  field.onChange(product.id);
                                  form.setValue("id_produto", product.id, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                  setProductOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    product.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {product.nome}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@usuario"
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://exemplo.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rua, número, bairro"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome da cidade"
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
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESTADOS_BRASILEIROS.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEAD_STATUS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ativo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione se está ativo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre o lead..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Atualizar Lead
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
