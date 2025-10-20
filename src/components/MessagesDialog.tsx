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
  Phone,
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

      // Ordenar por data (mais recentes primeiro)
      const sortedMessages = (data || [])
        .sort(
          (a, b) =>
            new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
        );

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
          <DialogTitle>Mensagens do Lead</DialogTitle>
          <DialogDescription>
            Visualize e adicione mensagens para <strong>{leadName}</strong>.
          </DialogDescription>
        </DialogHeader>
        {/* Lista de mensagens */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Carregando mensagens...
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[50vh] pr-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma mensagem encontrada para este lead.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <Card
                      key={message.id}
                      className="border hover:shadow-sm transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {(() => {
                              const Icon = getMeioContatoIcon(message.meio_de_contato);
                              return <Icon className="h-4 w-4 flex-shrink-0" />;
                            })()}
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
                              {new Date(message.data_hora).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm leading-relaxed break-words border rounded-md p-3 ${getMessageTypeColor(message.identifica)}`}>
                          {message.mensagem_primeiro_contato}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Formulário para nova mensagem */}
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Meio de Contato</Label>
              <Select
                value={formData.meio_de_contato}
                onValueChange={(v) => handleInputChange("meio_de_contato", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {MEIO_CONTATO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={formData.tipo_mensagem}
                onValueChange={(v) => handleInputChange("tipo_mensagem", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_MENSAGEM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Identificação</Label>
              <Select
                value={formData.identifica}
                onValueChange={(v) => handleInputChange("identifica", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {IDENTIFICA_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Digite a mensagem"
              value={formData.mensagem_primeiro_contato}
              onChange={(e) => handleInputChange("mensagem_primeiro_contato", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAddMessage} disabled={addingMessage || !leadId}>
            <Send className="h-4 w-4 mr-2" /> Adicionar mensagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
