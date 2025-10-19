// src/utils/testFlows.ts
import { leadsService } from "@/services/leadsService";
import { messagesService } from "@/services/messagesService";

export const testCRUDFlows = async () => {
  console.log("🧪 Iniciando testes de fluxos CRUD...");

  try {
    // TESTE 1: CRUD de Leads
    console.log("1. Testando CRUD de Leads...");

    // Create
    const newLead = {
      nome: "Lead Teste CRUD",
      email: "teste.crud@exemplo.com",
      telefone: "(11) 99999-9999",
      instagram: "@testecrud",
      decisor: "Decisor Teste",
      endereco: "Rua Teste, 123",
      cidade: "São Paulo",
      estado: "SP",
      website: "https://testecrud.com",
      status: "SEM RETORNO" as const,
      active: "yes" as const,
      observacoes: "Lead criado para teste CRUD",
    };

    const { data: createdLead, error: createError } =
      await leadsService.createLead(newLead);

    if (createError) {
      throw new Error(`Erro ao criar lead: ${createError}`);
    }

    console.log("✅ Lead criado:", createdLead?.id);

    // Read
    const { data: readLead, error: readError } = await leadsService.getLeadById(
      createdLead!.id
    );

    if (readError) {
      throw new Error(`Erro ao ler lead: ${readError}`);
    }

    console.log("✅ Lead lido:", readLead?.nome);

    // Update
    const updateData = {
      status: "MUITO INTERESSADO" as const,
      observacoes: "Lead atualizado durante teste CRUD",
    };

    const { data: updatedLead, error: updateError } =
      await leadsService.updateLead(createdLead!.id, updateData);

    if (updateError) {
      throw new Error(`Erro ao atualizar lead: ${updateError}`);
    }

    console.log("✅ Lead atualizado:", updatedLead?.status);

    // TESTE 2: CRUD de Mensagens
    console.log("2. Testando CRUD de Mensagens...");

    const newMessage = {
      id_lead: createdLead!.id,
      mensagem_primeiro_contato: "Mensagem de teste do fluxo CRUD",
      meio_de_contato: "whatsapp",
      tipo_mensagem: "primeiro contato" as const,
      identifica: "Enviada" as const,
    };

    const { data: createdMessage, error: messageError } =
      await messagesService.createMessage(newMessage);

    if (messageError) {
      throw new Error(`Erro ao criar mensagem: ${messageError}`);
    }

    console.log("✅ Mensagem criada:", createdMessage?.id);

    // Read messages by lead
    const { data: leadMessages, error: messagesError } =
      await messagesService.getMessagesByLead(createdLead!.id);

    if (messagesError) {
      throw new Error(`Erro ao buscar mensagens: ${messagesError}`);
    }

    console.log("✅ Mensagens do lead:", leadMessages?.length);

    // Delete (inativação)
    const { error: deleteError } = await leadsService.deleteLead(
      createdLead!.id
    );

    if (deleteError) {
      throw new Error(`Erro ao deletar lead: ${deleteError}`);
    }

    console.log("✅ Lead inativado com sucesso");

    console.log("🎉 Todos os testes CRUD passaram!");
    return true;
  } catch (error) {
    console.error("❌ Erro nos testes CRUD:", error);
    return false;
  }
};
