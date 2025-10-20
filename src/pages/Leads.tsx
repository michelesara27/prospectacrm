// src/pages/Leads.tsx
import { useMemo, useState, useEffect } from "react";
import { useLeads } from "@/hooks/useLeads";
import { useProducts } from "@/hooks/useProducts";
import { MessagesDialog } from "@/components/MessagesDialog";
import { NewMessageDialog } from "@/components/NewMessageDialog";
import { NewLeadDialog } from "@/components/NewLeadDialog";
import { EditLeadDialog } from "@/components/EditLeadDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  Instagram,
  Globe,
  RefreshCw,
  AlertCircle,
  Edit,
  Eye,
  MessageSquarePlus,
  MapPin,
  User,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { STATUS_CONFIG, CONTACT_CHANNEL_OPTIONS } from "@/types/leads";
import { messagesService } from "@/services/messagesService";

const Leads = () => {
  const {
    leads,
    loading,
    error,
    addLead,
    updateLead,
    deleteLead,
    checkDuplicates,
    refreshLeads,
  } = useLeads();

  // Produtos para exibir o nome vinculado ao lead
  const { products } = useProducts();
  const productNameById = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((p) => map.set(p.id, p.nome));
    return map;
  }, [products]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [contactMediumFilter, setContactMediumFilter] = useState<string>("all");
  const [latestChannelByLead, setLatestChannelByLead] = useState<Map<number, string>>(new Map());
  const [refreshing, setRefreshing] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [messagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [selectedLeadForMessages, setSelectedLeadForMessages] =
    useState<any>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLeads();
    setRefreshing(false);
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
    setEditDialogOpen(true);
  };

  const handleViewMessages = (lead: any) => {
    setSelectedLeadForMessages(lead);
    setMessagesDialogOpen(true);
  };

  const handleAddMessage = (lead: any) => {
    setSelectedLeadForMessages(lead);
    setNewMessageDialogOpen(true);
  };

  const handleDeleteLead = async (id: number) => {
    if (window.confirm("Tem certeza que deseja inativar este lead?")) {
      const success = await deleteLead(id);
      if (success) {
        console.log("Lead inativado com sucesso");
      }
    }
  };

  // Carregar último meio de contato por lead (agrupado)
  const loadLatestChannels = async () => {
    const { data, error } = await messagesService.getMessagesGroupedByLead();
    if (error || !data) return;
    const map = new Map<number, string>();
    data.forEach((group) => {
      const latest = group.messages?.[0];
      if (latest) {
        const normalized = latest.meio_de_contato === "e-mail" ? "email" : latest.meio_de_contato;
        map.set(group.lead.id, normalized);
      }
    });
    setLatestChannelByLead(map);
  };
  useEffect(() => {
    loadLatestChannels();
  }, []);

  // Filtrar leads baseado na busca e status
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.instagram && lead.instagram.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.decisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const leadLatestChannel = latestChannelByLead.get(lead.id);
    const matchesChannel = contactMediumFilter === "all" || leadLatestChannel === contactMediumFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  // Estatísticas para exibição
  const stats = {
    total: leads.length,
    filtered: filteredLeads.length,
    showing: filteredLeads.length,
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Leads
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua lista de contatos para prospecção
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <NewLeadDialog
            onAddLead={addLead}
            checkDuplicates={checkDuplicates}
          />
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Leads
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Filtrados
                </p>
                <p className="text-2xl font-bold">{stats.filtered}</p>
              </div>
              <Search className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Exibindo
                </p>
                <p className="text-2xl font-bold">{stats.showing}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleRefresh}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, Instagram, telefone, decisor ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            disabled={loading}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          disabled={loading}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="NENHUM">Nenhum</SelectItem>
            <SelectItem value="SEM RETORNO">Sem Retorno</SelectItem>
            <SelectItem value="SEM INTERESSE">Sem Interesse</SelectItem>
            <SelectItem value="TALVEZ">Talvez</SelectItem>
            <SelectItem value="MEDIO INTERESSE">Médio Interesse</SelectItem>
            <SelectItem value="MUITO INTERESSADO">Muito Interessado</SelectItem>
            <SelectItem value="OCUPADO">Ocupado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={contactMediumFilter}
          onValueChange={setContactMediumFilter}
          disabled={loading}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Filtrar por meio de contato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meios</SelectItem>
            {/* Opções de meio de contato */}
            {CONTACT_CHANNEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select
        >
      </div>

      {/* Lista de Leads */}
      {loading ? (
        // Loading State
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.length === 0 ? (
            // Estado Vazio
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm || statusFilter !== "all"
                      ? "Nenhum lead encontrado"
                      : "Nenhum lead cadastrado"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Tente ajustar os filtros de busca ou status"
                      : "Comece adicionando seu primeiro lead usando o botão acima"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Lista de Leads
            filteredLeads.map((lead) => (
              <Card
                key={lead.id}
                className="transition-all hover:shadow-md border"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* Cabeçalho do Lead */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{lead.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            <User className="h-3 w-3 inline mr-1" />
                            Decisor: {lead.decisor}
                          </p>
                          <Badge
                            variant="secondary"
                            className={`${
                              STATUS_CONFIG[lead.status].color
                            } text-white`}
                          >
                            {STATUS_CONFIG[lead.status].label}
                          </Badge>
                        </div>
                      </div>

                      {/* Informações de Contato */}
                      <div className="grid gap-3 text-sm">
                        {(() => {
                          const productId = (lead as any).id_product ?? lead.id_produto;
                          const productName = productId ? productNameById.get(productId) : undefined;
                          return productId && productName;
                        })() && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4 flex-shrink-0" />
                            {(() => {
                              const productId = (lead as any).id_product ?? lead.id_produto;
                              const productName = productId ? productNameById.get(productId) : undefined;
                              return (
                                <span className="truncate" title={productName || undefined}>
                                  Produto/Serviço: {productName}
                                </span>
                              );
                            })()}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:text-foreground transition-colors truncate"
                              title={lead.email}
                            >
                              {lead.email}
                            </a>
                          </div>
                        )}

                        {lead.telefone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={`tel:${lead.telefone}`}
                              className="hover:text-foreground transition-colors"
                            >
                              {lead.telefone}
                            </a>
                          </div>
                        )}

                        {lead.instagram && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Instagram className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={`https://instagram.com/${lead.instagram.replace(
                                "@",
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground transition-colors"
                            >
                              {lead.instagram}
                            </a>
                          </div>
                        )}

                        {lead.website && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4 flex-shrink-0" />
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground transition-colors truncate"
                              title={lead.website}
                            >
                              {lead.website}
                            </a>
                          </div>
                        )}

                        {(lead.endereco || lead.cidade) && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {lead.endereco && `${lead.endereco}, `}
                              {lead.cidade} - {lead.estado}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Observações */}
                      {lead.observacoes && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">
                            <strong>Observações:</strong> {lead.observacoes}
                          </p>
                        </div>
                      )}

                      {/* Metadados */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-3 border-t">
                        <span>
                          Criado:{" "}
                          {new Date(lead.created_at).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        {lead.updated_at &&
                          lead.updated_at !== lead.created_at && (
                            <span>
                              Atualizado:{" "}
                              {new Date(lead.updated_at).toLocaleDateString(
                                "pt-BR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLead(lead)}
                        className="h-8 w-8 p-0"
                        title="Editar lead"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewMessages(lead)}
                        className="h-8 w-8 p-0"
                        title="Ver mensagens"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddMessage(lead)}
                        className="h-8 w-8 p-0"
                        title="Adicionar mensagem"
                      >
                        <MessageSquarePlus className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-red-600"
                          >
                            Inativar Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Diálogos */}
      <EditLeadDialog
        lead={editingLead}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateLead={updateLead}
        checkDuplicates={checkDuplicates}
      />

      <MessagesDialog
        leadId={selectedLeadForMessages?.id?.toString()}
        leadName={selectedLeadForMessages?.nome || "Lead"}
        open={messagesDialogOpen}
        onOpenChange={setMessagesDialogOpen}
      />

      <NewMessageDialog
        leadId={selectedLeadForMessages?.id?.toString()}
        leadName={selectedLeadForMessages?.nome || "Lead"}
        open={newMessageDialogOpen}
        onOpenChange={setNewMessageDialogOpen}
        onMessageAdded={() => {
          console.log(
            "Nova mensagem adicionada para o lead:",
            selectedLeadForMessages?.nome
          );
          // Poderia atualizar o cache ou recarregar dados se necessário
        }}
      />
    </div>
  );
};

export default Leads;
