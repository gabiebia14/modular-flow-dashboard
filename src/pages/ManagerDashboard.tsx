
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui-custom/Card";
import { QuoteList } from "@/components/ui-custom/QuoteList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertCircle, ArrowLeftCircle, CheckCircle, FileText, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pendentes");
  
  // Stats para demonstração
  const stats = [
    {
      title: "Orçamentos Totais",
      value: "12",
      icon: FileText,
      description: "3 novos esta semana",
      color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Aguardando Análise",
      value: "5",
      icon: AlertCircle,
      description: "2 urgentes",
      color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "Aprovados",
      value: "6",
      icon: CheckCircle,
      description: "1 novo hoje",
      color: "text-green-500 bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Clientes Ativos",
      value: "24",
      icon: Users,
      description: "3 novos este mês",
      color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20",
    },
  ];
  
  return (
    <MainLayout title="Gerenciamento de Orçamentos" subtitle="Visualize, revise e aprove orçamentos">
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          className="w-fit flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Voltar para o início
        </Button>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border shadow-subtle" hover>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`rounded-full p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Orçamentos</CardTitle>
                <CardDescription>Gerencie todos os orçamentos em um só lugar</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Relatório
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pendentes" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
                <TabsTrigger value="em-processamento">Em Processamento</TabsTrigger>
                <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
                <TabsTrigger value="todos">Todos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pendentes">
                <QuoteList status="pending" />
              </TabsContent>
              
              <TabsContent value="em-processamento">
                <QuoteList status="processing" />
              </TabsContent>
              
              <TabsContent value="concluidos">
                <QuoteList status="completed" />
              </TabsContent>
              
              <TabsContent value="todos">
                <QuoteList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ManagerDashboard;
