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
  vida: {
    name: "Combinaqui Vida",
    price: 16.00,
    category: "proteção",
    economy: "81%",
    services: [
      { name: "Assistência Residencial Clássica", included: true, marketPrice: 45.00 },
      { name: "Assistência de Saúde", included: true, marketPrice: 40.00 }
    ],
    availability: "Disponível para clientes Itaú",
    description: "Assistência residencial clássica e assistência de saúde, com 81% de economia."
  },
  tranquilidade: {
    name: "Combinaqui Tranquilidade",
    price: 26.00,
    category: "proteção",
    economy: "81%",
    services: [
      { name: "Assistência de Saúde", included: true, marketPrice: 40.00 },
      { name: "Assistência Residencial Clássica", included: true, marketPrice: 45.00 },
      { name: "Assistência Auto", included: true, marketPrice: 52.00 }
    ],
    availability: "Disponível para clientes Itaú e Itaú Uniclass",
    description: "Assistências de saúde, residencial clássica e auto, com 81% de economia."
  },
  protecao: {
    name: "Combinaqui Proteção",
    price: 37.00,
    category: "proteção",
    economy: "82%",
    services: [
      { name: "Assistência de Saúde", included: true, marketPrice: 40.00 },
      { name: "Assistência Residencial Clássica", included: true, marketPrice: 45.00 },
      { name: "Assistência Auto Premium", included: true, marketPrice: 65.00 },
      { name: "10 dias sem juros no cheque especial", included: true, marketPrice: 15.00 }
    ],
    availability: "Disponível para clientes Itaú",
    description: "Assistências de saúde, residencial clássica, auto premium e 10 dias sem juros no cheque especial."
  },
  protecao2: {
    name: "Combinaqui Proteção II",
    price: 37.00,
    category: "proteção",
    economy: "82%",
    services: [
      { name: "Assistência de Saúde", included: true, marketPrice: 40.00 },
      { name: "Assistência Residencial Clássica", included: true, marketPrice: 45.00 },
      { name: "Assistência Auto Premium", included: true, marketPrice: 65.00 },
      { name: "Seguro Celular", included: true, marketPrice: 25.00 }
    ],
    availability: "Disponível para clientes Itaú e Itaú Uniclass",
    description: "Assistências de saúde, residencial clássica, auto premium e seguro celular, com 82% de economia."
  },
  protecao3: {
    name: "Combinaqui Proteção III",
    price: 47.00,
    category: "proteção",
    economy: "75%",
    services: [
      { name: "Assistência de Saúde", included: true, marketPrice: 40.00 },
      { name: "Assistência Residencial Clássica", included: true, marketPrice: 45.00 },
      { name: "Assistência Auto Premium", included: true, marketPrice: 65.00 },
      { name: "Seguro Celular", included: true, marketPrice: 25.00 },
      { name: "10 dias sem juros no cheque especial", included: true, marketPrice: 15.00 }
    ],
    availability: "Disponível para clientes Itaú",
    description: "Assistências de saúde, residencial clássica, auto premium, seguro celular e 10 dias sem juros no cheque especial."
  },
  conexao1: {
    name: "Combinaqui Conexão I",
    price: 16.00,
    category: "conexão",
    economy: "50%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "500MB de Internet Extra", included: true, marketPrice: 12.00 }
    ],
    availability: "Disponível para clientes Itaú",
    description: "Deezer Premium e 500MB de internet, com 50% de economia em relação ao valor original."
  },
  conexao2: {
    name: "Combinaqui Conexão II",
    price: 37.00,
    category: "conexão",
    economy: "22%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "1GB de Internet Extra", included: true, marketPrice: 27.00 }
    ],
    availability: "Disponível para clientes Itaú",
    description: "Deezer Premium e 1GB de internet, com 22% de economia."
  },
  conexao3: {
    name: "Combinaqui Conexão III",
    price: 47.00,
    category: "conexão",
    economy: "57%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "1GB de Internet Extra", included: true, marketPrice: 27.00 },
      { name: "Seguro Celular", included: true, marketPrice: 25.00 }
    ],
    availability: "Disponível para clientes Itaú e Itaú Uniclass",
    description: "Deezer Premium, 1GB de internet e seguro celular, com 57% de economia."
  },
  recompensa1: {
    name: "Combinaqui Recompensa I",
    price: 37.00,
    category: "recompensa",
    economy: "43%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "5% de Cashback nas contas de consumo", included: true, marketPrice: 45.00 }
    ],
    availability: "Disponível para clientes Itaú e Itaú Uniclass",
    description: "Deezer Premium e 5% de cashback nas contas de consumo em débito automático."
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
  const savingsPercentage = plan.economy;

  const generatePDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
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
              <p className="text-muted-foreground">{plan.description}</p>
              <p className="text-sm text-muted-foreground mt-1">{plan.availability}</p>
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
                    <div className="text-2xl font-bold text-green-600">R$ {savings.toFixed(2)}</div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {savingsPercentage} de desconto
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
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Categoria:</strong> {plan.category.charAt(0).toUpperCase() + plan.category.slice(1)} • 
                <strong> Economia:</strong> {plan.economy}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinaquiComparison;