// src/pages/Index.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLeads } from "@/hooks/useLeads";
import { NewLeadDialog } from "@/components/NewLeadDialog";
import {
  Users,
  Phone,
  CheckCircle,
  TrendingUp,
  XCircle,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  MessageSquare,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Dashboard = () => {
  const {
    leads,
    loading,
    error,
    addLead,
    checkDuplicates,
    refreshLeads,
    getStats,
  } = useLeads();

  const [refreshing, setRefreshing] = useState(false);

  const stats = getStats();
  const totalInteressados = stats.medioInteresse + stats.muitoInteressado;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLeads();
    setRefreshing(false);
  };

  const statCards = [
    {
      title: "Total de Leads",
      value: stats.total,
      description: "Leads ativos no sistema",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "total",
    },
    {
      title: "Sem Retorno",
      value: stats.semRetorno,
      description: "Aguardando primeiro contato",
      icon: HelpCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      trend: "pending",
    },
    {
      title: "Em Análise",
      value: stats.talvez,
      description: "Avaliando proposta",
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "analyzing",
    },
    {
      title: "Interessados",
      value: totalInteressados,
      description: "Médio + Muito Interessado",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "interested",
    },
    {
      title: "Sem Interesse",
      value: stats.semInteresse,
      description: "Não interessados",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "notInterested",
    },
    {
      title: "Taxa de Conversão",
      value:
        stats.total > 0
          ? `${((totalInteressados / stats.total) * 100).toFixed(1)}%`
          : "0%",
      description: "Leads interessados",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "conversion",
    },
  ];

  const statusDistribution = [
    { status: "SEM RETORNO", count: stats.semRetorno, color: "bg-gray-500" },
    { status: "SEM INTERESSE", count: stats.semInteresse, color: "bg-red-500" },
    { status: "TALVEZ", count: stats.talvez, color: "bg-yellow-500" },
    {
      status: "MEDIO INTERESSE",
      count: stats.medioInteresse,
      color: "bg-orange-500",
    },
    {
      status: "MUITO INTERESSADO",
      count: stats.muitoInteressado,
      color: "bg-green-500",
    },
  ].filter((item) => item.count > 0);

  const recentLeads = leads.slice(0, 5); // Últimos 5 leads

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral da sua pipeline de prospecção
            </p>
          </div>
        </div>

        <Card className="border-destructive">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Erro ao Carregar Dados</CardTitle>
            <CardDescription className="max-w-md mx-auto mb-4">
              {error}
            </CardDescription>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Tentar Novamente
            </Button>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral da sua pipeline de prospecção
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <NewLeadDialog
            onAddLead={addLead}
            checkDuplicates={checkDuplicates}
          />
        </div>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full ${stat.bgColor} opacity-20`}
            ></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>
              Como seus leads estão distribuídos no funil de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum lead cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {statusDistribution.map((item) => {
                  const percentage =
                    stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  return (
                    <div key={item.status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {item.status.toLowerCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
            <CardDescription>
              Últimos leads adicionados ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum lead cadastrado ainda</p>
                <p className="text-sm mt-2">
                  Adicione seu primeiro lead para começar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {lead.nome}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lead.email || "Sem email"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${
                        lead.status === "MUITO INTERESSADO"
                          ? "bg-green-500 text-white"
                          : lead.status === "MEDIO INTERESSE"
                          ? "bg-orange-500 text-white"
                          : lead.status === "TALVEZ"
                          ? "bg-yellow-500 text-white"
                          : lead.status === "SEM INTERESSE"
                          ? "bg-red-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {lead.status.split(" ")[0]}
                    </Badge>
                  </div>
                ))}
                {leads.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" asChild>
                      <a href="/leads">Ver todos os {leads.length} leads</a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guia Rápido */}
      <Card>
        <CardHeader>
          <CardTitle>Início Rápido</CardTitle>
          <CardDescription>
            Comece a gerenciar seus contatos de prospecção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              1
            </div>
            <div>
              <p className="font-medium">Adicione seus primeiros leads</p>
              <p className="text-sm text-muted-foreground">
                Clique em "Novo Lead" para começar a construir sua lista de
                contatos. Preencha informações como nome, email, telefone e
                Instagram.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              2
            </div>
            <div>
              <p className="font-medium">Organize por status</p>
              <p className="text-sm text-muted-foreground">
                Gerencie o fluxo de prospecção movendo leads entre os status:
                Sem Retorno, Talvez, Médio Interesse e Muito Interessado.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              3
            </div>
            <div>
              <p className="font-medium">Acompanhe mensagens</p>
              <p className="text-sm text-muted-foreground">
                Mantenha histórico de todas as interações com seus contatos.
                Registre primeiro contato e follow-ups para melhor
                acompanhamento.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              4
            </div>
            <div>
              <p className="font-medium">Analise resultados</p>
              <p className="text-sm text-muted-foreground">
                Acompanhe métricas de conversão e distribuição de status para
                otimizar sua estratégia de prospecção.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dicas de Produtividade */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Dicas para Melhorar sua Prospecção
          </CardTitle>
          <CardDescription>
            Boas práticas para aumentar sua taxa de conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Contato Personalizado</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sempre personalize sua mensagem de primeiro contato baseado no
                perfil do lead.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                <span className="font-medium">Follow-up Consistente</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Faça follow-ups regulares, mas não insistentes. Mantenha um
                intervalo de 3-5 dias.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Classificação Correta</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Mantenha os status atualizados para ter uma visão real do seu
                funil de vendas.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Análise Contínua</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revise regularmente as métricas do dashboard para identificar
                oportunidades de melhoria.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
