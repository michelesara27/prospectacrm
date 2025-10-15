// src/components/MessagesDialog.tsx
import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Calendar,
  Facebook,
  MessageCircle,
  Instagram,
  User,
  Mail,
} from "lucide-react";
import { messagesService } from "@/services/messagesService";
import { toast } from "sonner";

interface Message {
  id: number;
  id_lead: number;
  mensagem_primeiro_contato: string;
  meio_de_contato: string;
  tipo_mensagem: "primeiro contato" | "followup";
  identifica: "Enviada" | "Recebida";
  data_hora: string;
}

interface MessageFormData {
  mensagem_primeiro_contato: string;
  meio_de_contato: string;
  tipo_mensagem: string;
  identifica: string;
}

interface MessagesDialogProps {
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
];

const TIPO_MENSAGEM_OPTIONS = [
  { value: "primeiro contato", label: "Primeiro contato" },
  { value: "followup", label: "Followup" },
];

const IDENTIFICA_OPTIONS = [
  { value: "Enviada", label: "Enviada" },
  { value: "Recebida", label: "Recebida" },
];

export function MessagesDialog({
  leadId,
  leadName,
  open,
  onOpenChange,
}: MessagesDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingMessage, setAddingMessage] = useState(false);

  // Formulário para nova mensagem
  const [formData, setFormData] = useState<MessageFormData>({
    mensagem_primeiro_contato: "",
    meio_de_contato: "",
    tipo_mensagem: "",
    identifica: "Enviada",
  });

  // Carregar mensagens reais do Supabase
  useEffect(() => {
    if (leadId && open) {
      loadMessages();
    }
  }, [leadId, open]);

  const loadMessages = async () => {
    if (!leadId) return;

    setLoading(true);
    try {
      const { data, error } = await messagesService.getMessagesByLead(
        parseInt(leadId)
      );

      if (error) {
        console.error("Erro ao carregar mensagens:", error);
        toast.error("Erro ao carregar mensagens");
        return;
      }

      // Ordenar por data (mais recentes primeiro) e pegar apenas os últimos 3
      const sortedMessages = (data || [])
        .sort(
          (a, b) =>
            new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
        )
        .slice(0, 3);

      setMessages(sortedMessages);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof MessageFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddMessage = async () => {
    if (!formData.mensagem_primeiro_contato.trim() || !leadId) return;

    // Validar campos obrigatórios
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

      // Resetar formulário
      setFormData({
        mensagem_primeiro_contato: "",
        meio_de_contato: "",
        tipo_mensagem: "",
        identifica: "Enviada",
      });

      // Recarregar mensagens
      await loadMessages();
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

  const getMeioContatoIcon = (meioContato: string) => {
    const option = MEIO_CONTATO_OPTIONS.find(
      (opt) => opt.value === meioContato
    );
    return option ? option.icon : MessageSquare;
  };

  const getMessageTypeColor = (identifica: string) => {
    switch (identifica) {
      case "Enviada":
        return "bg-green-50 border-green-200 text-green-800 hover:bg-green-100";
      case "Recebida":
        return "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens - {leadName}
          </DialogTitle>
          <DialogDescription>
            Visualize os últimos 3 registros de mensagens e adicione novas
            mensagens para este lead.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Lista dos últimos 3 registros */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Últimas 3 mensagens
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  Carregando mensagens...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma mensagem encontrada para este lead.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione a primeira mensagem usando o formulário abaixo.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {messages.map((message) => {
                  const IconComponent = getMeioContatoIcon(
                    message.meio_de_contato
                  );
                  return (
                    <Card
                      key={message.id}
                      className={`${getMessageTypeColor(
                        message.identifica
                      )} border transition-all hover:shadow-sm`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <IconComponent className="h-4 w-4 flex-shrink-0" />
                            <Badge variant="secondary" className="text-xs">
                              {message.identifica}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {message.tipo_mensagem}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                            <Calendar className="h-3 w-3" />
                            <span className="whitespace-nowrap">
                              {new Date(message.data_hora).toLocaleString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed line-clamp-2 break-words">
                          {message.mensagem_primeiro_contato}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formulário para nova mensagem */}
          <div className="border-t pt-4 space-y-4 flex-shrink-0">
            <h3 className="text-sm font-medium text-muted-foreground">
              Adicionar nova mensagem
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Meio de contato */}
              <div className="space-y-2">
                <Label htmlFor="meio-contato" className="text-sm font-medium">
                  Meio de Contato <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.meio_de_contato}
                  onValueChange={(value) =>
                    handleInputChange("meio_de_contato", value)
                  }
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
                  onValueChange={(value) =>
                    handleInputChange("tipo_mensagem", value)
                  }
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
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="identifica" className="text-sm font-medium">
                  Identifica <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.identifica}
                  onValueChange={(value) =>
                    handleInputChange("identifica", value)
                  }
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
            <div className="space-y-2">
              <Label htmlFor="mensagem" className="text-sm font-medium">
                Mensagem <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Textarea
                  id="mensagem"
                  placeholder="Digite o conteúdo da mensagem..."
                  value={formData.mensagem_primeiro_contato}
                  onChange={(e) =>
                    handleInputChange(
                      "mensagem_primeiro_contato",
                      e.target.value
                    )
                  }
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
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
