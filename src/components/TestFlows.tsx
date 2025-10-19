// src/components/TestFlows.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { testCRUDFlows } from "@/utils/testFlows";

export function TestFlows() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const runTests = async () => {
    setTesting(true);
    setResult(null);

    try {
      const success = await testCRUDFlows();
      setResult({
        success,
        message: success
          ? "Todos os fluxos CRUD funcionam corretamente!"
          : "Alguns fluxos apresentaram erros. Verifique o console.",
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Erro durante os testes: ${error}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testes de Sistema</CardTitle>
        <CardDescription>
          Verifique se todos os fluxos CRUD estão funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={testing} variant="outline">
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Executar Testes CRUD
        </Button>

        {result && (
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              result.success
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
