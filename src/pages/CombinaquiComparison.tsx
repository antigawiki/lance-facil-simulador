import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import itauLogo from "@/assets/itau-logo.png";

const combinaquiData = {
  essencial: {
    name: "Combinaqui Essencial",
    price: 49.90,
    services: [
      { name: "Conta Corrente", included: true, marketPrice: 25.00 },
      { name: "Cartão de Crédito", included: true, marketPrice: 15.90 },
      { name: "Pix Ilimitado", included: true, marketPrice: 0 },
      { name: "TED/DOC (5 grátis)", included: true, marketPrice: 12.50 },
      { name: "Cartão de Débito", included: true, marketPrice: 8.00 }
    ]
  },
  completo: {
    name: "Combinaqui Completo", 
    price: 89.90,
    services: [
      { name: "Conta Corrente", included: true, marketPrice: 25.00 },
      { name: "Cartão de Crédito Premium", included: true, marketPrice: 29.90 },
      { name: "Pix Ilimitado", included: true, marketPrice: 0 },
      { name: "TED/DOC Ilimitado", included: true, marketPrice: 25.00 },
      { name: "Cartão de Débito", included: true, marketPrice: 8.00 },
      { name: "Seguro Vida", included: true, marketPrice: 35.00 },
      { name: "Capitalização", included: true, marketPrice: 20.00 },
      { name: "Investimentos sem Taxa", included: true, marketPrice: 15.00 }
    ]
  },
  premium: {
    name: "Combinaqui Premium",
    price: 149.90,
    services: [
      { name: "Conta Corrente Premium", included: true, marketPrice: 45.00 },
      { name: "Cartão de Crédito Black", included: true, marketPrice: 49.90 },
      { name: "Pix Ilimitado", included: true, marketPrice: 0 },
      { name: "TED/DOC Ilimitado", included: true, marketPrice: 25.00 },
      { name: "Cartão de Débito Premium", included: true, marketPrice: 15.00 },
      { name: "Seguro Vida Premium", included: true, marketPrice: 55.00 },
      { name: "Capitalização Premium", included: true, marketPrice: 35.00 },
      { name: "Investimentos Premium", included: true, marketPrice: 25.00 },
      { name: "Assessoria Financeira", included: true, marketPrice: 80.00 },
      { name: "Sala VIP Aeroporto", included: true, marketPrice: 30.00 }
    ]
  }
};

const CombinaquiComparison = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const plan = combinaquiData[id as keyof typeof combinaquiData];

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Plano não encontrado</h2>
            <Button onClick={() => navigate("/combinaqui")}>
              Voltar para Combinaqui
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const marketTotal = plan.services.reduce((sum, service) => sum + service.marketPrice, 0);
  const savings = marketTotal - plan.price;
  const savingsPercentage = ((savings / marketTotal) * 100).toFixed(1);

  const generatePDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`comparativo-${plan.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O comparativo foi baixado em formato PDF.",
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/combinaqui")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Gerar PDF
          </Button>
        </div>

        <div ref={printRef} className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <img src={itauLogo} alt="Itaú" className="h-12" />
            <div className="text-right">
              <h1 className="text-3xl font-bold text-primary mb-2">{plan.name}</h1>
              <p className="text-muted-foreground">Comparativo de Serviços</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Serviços Inclusos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Preço avulso</div>
                        <div className="font-semibold">
                          {service.marketPrice > 0 ? `R$ ${service.marketPrice.toFixed(2)}` : 'Grátis'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-lg">
                    <span className="font-medium">Total dos serviços avulsos:</span>
                    <span className="text-xl font-bold">R$ {marketTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                    <span className="font-medium">Preço do {plan.name}:</span>
                    <span className="text-xl font-bold text-primary">R$ {plan.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="font-medium text-green-700">Sua economia:</span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">R$ {savings.toFixed(2)}</div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {savingsPercentage}% de desconto
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Economia anual</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {(savings * 12).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/5 p-6 rounded-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">💡 Vantagem do Combinaqui</h3>
              <p className="text-muted-foreground">
                Com o {plan.name}, você tem acesso a todos esses serviços por apenas{' '}
                <span className="font-bold text-primary">R$ {plan.price.toFixed(2)}/mês</span>,
                economizando <span className="font-bold text-green-600">R$ {savings.toFixed(2)} por mês</span> comparado 
                aos preços individuais do mercado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinaquiComparison;