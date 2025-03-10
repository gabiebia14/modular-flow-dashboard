
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-custom/Card";

export const AgentModelTab = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modelo de Linguagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provedor</label>
              <select className="w-full border border-input bg-background rounded-md p-2">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Google</option>
                <option>Perplexity</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Modelo</label>
              <select className="w-full border border-input bg-background rounded-md p-2">
                <option>gpt-4o</option>
                <option>gpt-4o-mini</option>
                <option>claude-3-opus</option>
                <option>claude-3-sonnet</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parâmetros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Temperatura</label>
              <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Determinístico</span>
                <span>Criativo</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maximum Length</label>
              <input type="number" defaultValue="2048" className="w-full border border-input bg-background rounded-md p-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
