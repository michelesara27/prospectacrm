// src/components/MessageCard.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Facebook,
  MessageCircle,
  Instagram,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: number;
  id_lead: number;
  mensagem_primeiro_contato: string;
  meio_de_contato: string;
  tipo_mensagem: "primeiro contato" | "followup";
  identifica: "Enviada" | "Recebida";
  data_hora: string;
}

interface MessageCardProps {
  message: Message;
}

const MEIO_CONTATO_ICONS = {
  facebook: Facebook,
  whatsapp: MessageCircle,
  instagram: Instagram,
  pessoalmente: User,
  email: Mail,
  "e-mail": Mail,
};

export function MessageCard({ message }: MessageCardProps) {
  // Função para obter o ícone do meio de contato
  const getMeioContatoIcon = (meioContato: string) => {
    const IconComponent =
      MEIO_CONTATO_ICONS[meioContato as keyof typeof MEIO_CONTATO_ICONS];
    return IconComponent || MessageSquare;
  };

  // Função para obter as cores baseadas no status
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

  // Função para formatar data e hora
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const IconComponent = getMeioContatoIcon(message.meio_de_contato);

  return (
    <Card
      className={`${getMessageTypeColor(
        message.identifica
      )} border transition-all hover:shadow-sm mb-3`}
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
              {formatDateTime(message.data_hora)}
            </span>
          </div>
        </div>
        <p className="text-sm leading-relaxed line-clamp-3 break-words">
          {message.mensagem_primeiro_contato}
        </p>
      </CardContent>
    </Card>
  );
}
