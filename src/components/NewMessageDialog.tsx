// src/components/NewMessageDialog.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Send } from "lucide-react";
import { toast } from "sonner";
import { messagesService } from "@/services/messagesService";

interface NewMessageDialogProps {
  leadId: string | null;
  leadName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageAdded?: () => void;
}

interface MessageFormData {
  mensagem_primeiro_contato: string;
  meio_de_contato: string;
  tipo_mensagem: string;
  identifica: string;
}

const MEIO_CONTATO_OPTIONS = [
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "pessoalmente", label: "Pessoalmente" },
  { value: "email", label: "E-mail" },
];

const TIPO_MENSAGEM_OPTIONS = [
  { value: "primeiro contato", label: "Primeiro contato" },
  { value: "followup", label: "Followup" },
];

const IDENTIFICA_OPTIONS = [
  { value: "Enviada", label: "Enviada" },
  { value: "Recebida", label: "Recebida" },
];

export function NewMessageDialog({
  leadId,
  leadName,
  open,
  onOpenChange,
  onMessageAdded,
}: NewMessageDialogProps) {
  const [formData, setFormData] = useState<MessageFormData>({
    mensagem_primeiro_contato: "",
    meio_de_contato: "",
    tipo_mensagem: "",
    identifica: "Enviada",
  });

  const [errors, setErrors] = useState<Partial<MessageFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<MessageFormData> = {};

    if (!formData.mensagem_primeiro_contato.trim()) {
      newErrors.mensagem_primeiro_contato = "Mensagem é obrigatória";
    }

    if (!formData.meio_de_contato) {
      newErrors.meio_de_contato = "Meio de contato é obrigatório";
    }

    // Campo "Retorno Imediato" agora é opcional - validação removida

    if (!formData.tipo_mensagem) {
      newErrors.tipo_mensagem = "Tipo de mensagem é obrigatório";
    }

    if (!formData.identifica) {
      newErrors.identifica = "Identificação é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !leadId) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para envio ao Supabase
      const messageData = {
        id_lead: parseInt(leadId),
        mensagem_primeiro_contato: formData.mensagem_primeiro_contato,
        meio_de_contato: formData.meio_de_contato,
        tipo_mensagem: formData.tipo_mensagem as
          | "primeiro contato"
          | "followup",
        identifica: formData.identifica as "Enviada" | "Recebida",
      };

      console.log("Enviando dados para o Supabase:", messageData);

      // Chamar o serviço para criar a mensagem no Supabase
      const { data, error } = await messagesService.createMessage(messageData);

      if (error) {
        throw new Error(error);
      }

      console.log("Mensagem criada com sucesso:", data);

      // Resetar formulário
      setFormData({
        mensagem_primeiro_contato: "",
        meio_de_contato: "",
        tipo_mensagem: "",
        identifica: "Enviada",
      });

      setErrors({});

      toast.success("Mensagem cadastrada com sucesso no banco de dados!");

      // Chamar callback se fornecido
      if (onMessageAdded) {
        onMessageAdded();
      }

      // Fechar dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao cadastrar mensagem:", error);
      toast.error(
        `Erro ao cadastrar mensagem: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MessageFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        mensagem_primeiro_contato: "",
        meio_de_contato: "",
        tipo_mensagem: "",
        identifica: "Enviada",
      });
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Adicionar Nova Mensagem
          </DialogTitle>
          <DialogDescription>
            Cadastre uma nova mensagem para o lead: <strong>{leadName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Campo Mensagem */}
            <div className="space-y-2">
              <Label htmlFor="mensagem" className="text-sm font-medium">
                Mensagem <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="mensagem"
                placeholder="Digite a mensagem de primeiro contato..."
                value={formData.mensagem_primeiro_contato}
                onChange={(e) =>
                  handleInputChange("mensagem_primeiro_contato", e.target.value)
                }
                className={`min-h-[100px] ${
                  errors.mensagem_primeiro_contato ? "border-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.mensagem_primeiro_contato && (
                <p className="text-sm text-red-500">
                  {errors.mensagem_primeiro_contato}
                </p>
              )}
            </div>

            {/* Campo Meio de Contato */}
            <div className="space-y-2">
              <Label htmlFor="meio-contato" className="text-sm font-medium">
                Meio de Contato <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.meio_de_contato}
                onValueChange={(value) =>
                  handleInputChange("meio_de_contato", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={errors.meio_de_contato ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione o meio de contato" />
                </SelectTrigger>
                <SelectContent>
                  {MEIO_CONTATO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.meio_de_contato && (
                <p className="text-sm text-red-500">{errors.meio_de_contato}</p>
              )}
            </div>

            {/* Campo Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo-mensagem" className="text-sm font-medium">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipo_mensagem}
                onValueChange={(value) =>
                  handleInputChange("tipo_mensagem", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={errors.tipo_mensagem ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione o tipo de mensagem" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_MENSAGEM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_mensagem && (
                <p className="text-sm text-red-500">{errors.tipo_mensagem}</p>
              )}
            </div>

            {/* Campo Identifica */}
            <div className="space-y-2">
              <Label htmlFor="identifica" className="text-sm font-medium">
                Identifica <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.identifica}
                onValueChange={(value) =>
                  handleInputChange("identifica", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={errors.identifica ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione se foi enviada ou recebida" />
                </SelectTrigger>
                <SelectContent>
                  {IDENTIFICA_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.identifica && (
                <p className="text-sm text-red-500">{errors.identifica}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Salvar Mensagem
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
