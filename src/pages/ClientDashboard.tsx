
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/ui-custom/ChatInterface";
import { MessageCircle, FileText, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"chat" | "quotations">("chat");

  return (
    <MainLayout 
      title="Portal do Cliente" 
      subtitle="Solicite orçamentos e acompanhe seus pedidos"
    >
      <div className="flex flex-col space-y-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Voltar para o início
        </Button>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
            <Card 
              className={`flex-1 cursor-pointer ${activeTab === "chat" ? "border-primary" : "border-border"}`}
              onClick={() => setActiveTab("chat")}
              hover
            >
              <CardHeader className="p-4">
                <div className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle className="text-sm">Atendimento</CardTitle>
                </div>
              </CardHeader>
            </Card>
            
            <Card 
              className={`flex-1 cursor-pointer ${activeTab === "quotations" ? "border-primary" : "border-border"}`}
              onClick={() => setActiveTab("quotations")}
              hover
            >
              <CardHeader className="p-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle className="text-sm">Meus Orçamentos</CardTitle>
                </div>
              </CardHeader>
            </Card>
          </div>
          
          <div className="flex-1">
            {activeTab === "chat" ? (
              <Card glassmorphism>
                <CardHeader>
                  <CardTitle>Assistente de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChatInterface 
                    welcomeMessage="Olá, sou o assistente de vendas da Modular Flow. Como posso te ajudar hoje?"
                    placeholder="Digite sua mensagem aqui..."
                  />
                </CardContent>
              </Card>
            ) : (
              <Card glassmorphism>
                <CardHeader>
                  <CardTitle>Meus Orçamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Você ainda não possui orçamentos.</p>
                    <p className="text-sm mt-2">Utilize nosso atendimento para solicitar um orçamento personalizado.</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setActiveTab("chat")}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Solicitar Orçamento
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientDashboard;
