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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { messagesService } from "@/services/messagesService";
import {
  MessageSquare,
  Send,
  Facebook,
  MessageCircle,
  Instagram,
  User,
  Mail,
  Phone,
} from "lucide-react";

interface NewMessageDialogProps {
  leadId: string | null;
  leadName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEIO_CONTATO_OPTIONS = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "pessoalmente", label: "Pessoalmente", icon: User },
  { value: "email", label: "E-mail", icon: Mail },
  { value: "ligacao", label: "Ligação", icon: Phone },
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
}: NewMessageDialogProps) {
  const [addingMessage, setAddingMessage] = useState(false);
  const [formData, setFormData] = useState({
    mensagem_primeiro_contato: "",
    meio_de_contato: "",
    tipo_mensagem: "",
    identifica: "Enviada",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddMessage = async () => {
    if (!formData.mensagem_primeiro_contato.trim() || !leadId) return;

    if (
      !formData.meio_de_contato ||
      !formData.tipo_mensagem ||
      !formData.identifica
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setAddingMessage(true);
    try {
      const messageData = {
        id_lead: parseInt(leadId),
        mensagem_primeiro_contato: formData.mensagem_primeiro_contato,
        meio_de_contato: formData.meio_de_contato,
        tipo_mensagem: formData.tipo_mensagem as
          | "primeiro contato"
          | "followup",
        identifica: formData.identifica as "Enviada" | "Recebida",
      };

      const { data, error } = await messagesService.createMessage(messageData);

      if (error) {
        throw new Error(error);
      }

      toast.success("Mensagem adicionada com sucesso!");

      setFormData({
        mensagem_primeiro_contato: "",
        meio_de_contato: "",
        tipo_mensagem: "",
        identifica: "Enviada",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao adicionar mensagem:", error);
      toast.error(
        `Erro ao adicionar mensagem: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    } finally {
      setAddingMessage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Nova mensagem - {leadName}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para adicionar uma nova mensagem.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Meio de contato */}
          <div className="space-y-2">
            <Label htmlFor="meio-contato" className="text-sm font-medium">
              Meio de Contato <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.meio_de_contato}
              onValueChange={(value) => handleInputChange("meio_de_contato", value)}
              disabled={addingMessage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {MEIO_CONTATO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo-mensagem" className="text-sm font-medium">
              Tipo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.tipo_mensagem}
              onValueChange={(value) => handleInputChange("tipo_mensagem", value)}
              disabled={addingMessage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {TIPO_MENSAGEM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Identifica */}
          <div className="space-y-2">
            <Label htmlFor="identifica" className="text-sm font-medium">
              Identifica <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.identifica}
              onValueChange={(value) => handleInputChange("identifica", value)}
              disabled={addingMessage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {IDENTIFICA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campo de mensagem */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="mensagem" className="text-sm font-medium">
            Mensagem <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Textarea
              id="mensagem"
              placeholder="Digite o conteúdo da mensagem..."
              value={formData.mensagem_primeiro_contato}
              onChange={(e) => handleInputChange("mensagem_primeiro_contato", e.target.value)}
              className="flex-1 min-h-[80px] resize-none"
              disabled={addingMessage}
            />
            <Button
              onClick={handleAddMessage}
              disabled={
                !formData.mensagem_primeiro_contato.trim() ||
                !formData.meio_de_contato ||
                !formData.tipo_mensagem ||
                !formData.identifica ||
                addingMessage
              }
              className="self-end"
              size="sm"
            >
              {addingMessage ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
