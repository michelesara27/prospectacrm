// src/pages/Mensagens.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { messagesService } from "@/services/messagesService";
import { LeadMessagesGroup } from "@/components/LeadMessagesGroup";
import { MessagesSearch } from "@/components/MessagesSearch";
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

interface Lead {
  id: number;
  nome: string;
  instagram?: string;
  telefone?: string;
  email?: string;
}

interface GroupedMessages {
  lead: Lead;
  messages: Message[];
}

const Mensagens = () => {
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Carregar mensagens agrupadas
  useEffect(() => {
    loadGroupedMessages();
  }, []);

  const loadGroupedMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await messagesService.getMessagesGroupedByLead();

      if (error) {
        setError(error);
        toast.error("Erro ao carregar mensagens");
        return;
      }

      setGroupedMessages(data || []);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      setError("Erro inesperado ao carregar mensagens");
      toast.error("Erro inesperado ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar mensagens baseado no termo de busca
  const filteredGroupedMessages = useMemo(() => {
    if (!searchTerm.trim()) {
      return groupedMessages;
    }

    const searchLower = searchTerm.toLowerCase();

    return groupedMessages.filter((group) => {
      const lead = group.lead;

      // Buscar por nome do lead
      if (lead.nome.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Buscar por Instagram
      if (
        lead.instagram &&
        lead.instagram.toLowerCase().includes(searchLower)
      ) {
        return true;
      }

      // Buscar por telefone
      if (lead.telefone && lead.telefone.includes(searchTerm)) {
        return true;
      }

      // Buscar por email
      if (lead.email && lead.email.toLowerCase().includes(searchLower)) {
        return true;
      }

      return false;
    });
  }, [groupedMessages, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Mensagens
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico de comunicações com seus leads
          </p>
        </div>

        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            </div>
            <CardTitle>Carregando Mensagens</CardTitle>
            <CardDescription>
              Aguarde enquanto carregamos o histórico de mensagens...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Mensagens
          </h1>
          <p className="text-muted-foreground mt-1">
            Histórico de comunicações com seus leads
          </p>
        </div>

        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Erro ao Carregar Mensagens</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Mensagens
        </h1>
        <p className="text-muted-foreground mt-1">
          Histórico de comunicações com seus leads
        </p>
      </div>

      {groupedMessages.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Nenhuma Mensagem Encontrada</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Ainda não há mensagens registradas no sistema. As mensagens
              aparecerão aqui conforme forem sendo adicionadas aos leads.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <MessagesSearch onSearch={handleSearch} />

          {filteredGroupedMessages.length === 0 ? (
            <Card>
              <CardHeader className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>Nenhum Resultado Encontrado</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  Não foram encontradas mensagens que correspondam aos critérios
                  de busca. Tente usar termos diferentes.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredGroupedMessages.map((group) => (
                <LeadMessagesGroup
                  key={group.lead.id}
                  lead={group.lead}
                  messages={group.messages}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Mensagens;
