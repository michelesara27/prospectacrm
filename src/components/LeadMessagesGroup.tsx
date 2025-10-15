// src/components/LeadMessageGroup.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Instagram, MessageSquare } from "lucide-react";
import { MessageCard } from "./MessageCard";

interface Message {
  id: number;
  id_lead: number;
  mensagem_primeiro_contato: string;
  meio_de_contato: string;
  tipo_mensagem: "primeiro contato" | "followup";
  identifica: "Enviada" | "Recebida";
  data_hora: string;
}

interface Lead {
  id: number;
  nome: string;
  instagram?: string;
  telefone?: string;
  email?: string;
}

interface LeadMessagesGroupProps {
  lead: Lead;
  messages: Message[];
}

export function LeadMessagesGroup({ lead, messages }: LeadMessagesGroupProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {lead.nome}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {lead.instagram && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Instagram className="h-3 w-3" />
                    <span>@{lead.instagram}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {messages.length} {messages.length === 1 ? "mensagem" : "mensagens"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem encontrada para este lead.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
