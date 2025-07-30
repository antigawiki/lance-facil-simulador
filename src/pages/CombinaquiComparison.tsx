import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef, useState } from "react";
import ServiceInfoModal from "@/components/ServiceInfoModal";
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
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const pdfElement = document.createElement('div');
    pdfElement.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 794px;
      padding: 40px;
      background: white;
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Buscar informações dos serviços
    const servicesInfo: Record<string, any> = {
      "Assistência de Saúde": {
        description: "Serviços de saúde preventiva com possibilidade de incluir até 3 beneficiários.",
        contact: "4000-1640 (capitais) ou 0800-836-8836"
      },
      "Assistência Residencial Clássica": {
        description: "Serviços para reparos emergenciais elétricos, hidráulicos, desentupimento e chaveiro.",
        contact: "0800 704 3837"
      },
      "Assistência Residencial Premium": {
        description: "Serviços completos incluindo conserto de eletrodomésticos e assistência à informática.",
        contact: "0800 704 3837"
      },
      "Assistência Auto": {
        description: "Mecânico emergencial e guincho para situações de pane ou acidente.",
        contact: "3003-3951 (capitais) ou 0800-703-3451"
      },
      "Assistência Auto Premium": {
        description: "Serviços completos incluindo guincho, chaveiro, leva e traz e translado.",
        contact: "3003-3951 (capitais) ou 0800-703-3451"
      },
      "Seguro Celular": {
        description: "Proteção contra roubo ou furto qualificado oferecido pela Chubb Seguros.",
        contact: "0800 000 0671"
      },
      "10 dias sem juros no cheque especial": {
        description: "Benefício que permite usar o limite da conta sem juros por 10 dias corridos.",
        contact: "4004-4828 (capitais) ou 0800-970-4828"
      },
      "Deezer Premium": {
        description: "Mais de 56 milhões de músicas, playlists, podcasts e download offline sem anúncios.",
        contact: "Acesso via app Deezer"
      },
      "500MB de Internet Extra": {
        description: "500MB de dados móveis para operadoras Vivo, Claro e Tim com validade de 30 dias.",
        contact: "Sua operadora"
      },
      "1GB de Internet Extra": {
        description: "1GB de dados móveis para operadoras Vivo, Claro e Tim com validade de 30 dias.",
        contact: "Sua operadora"
      },
      "5% de Cashback nas contas de consumo": {
        description: "5% de retorno em contas de luz, água, gás, internet e TV a cabo em débito automático.",
        contact: "Crédito automático na conta"
      }
    };
    
    pdfElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ff6600; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
          <img src="${itauLogo}" alt="Itaú" style="height: 60px;" />
        </div>
        <h1 style="color: #ff6600; font-size: 28px; margin: 0; font-weight: bold;">${plan.name}</h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Comparativo Detalhado</p>
        <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h2 style="color: #ff6600; font-size: 20px; margin: 0 0 15px 0;">Informações do Combo</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0;"><strong>Nome:</strong> ${plan.name}</p>
            <p style="margin: 8px 0;"><strong>Categoria:</strong> ${plan.category.charAt(0).toUpperCase() + plan.category.slice(1)}</p>
            <p style="margin: 8px 0;"><strong>Preço Mensal:</strong> R$ ${plan.price.toFixed(2)}</p>
            <p style="margin: 8px 0;"><strong>Disponibilidade:</strong> ${plan.availability}</p>
            <p style="margin: 8px 0;"><strong>Economia:</strong> ${plan.economy}</p>
          </div>
        </div>

        <div>
          <h2 style="color: #0066cc; font-size: 20px; margin: 0 0 15px 0;">Resumo Financeiro</h2>
          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0;"><strong>Total avulso:</strong> R$ ${marketTotal.toFixed(2)}</p>
            <p style="margin: 8px 0;"><strong>Preço Combinaqui:</strong> R$ ${plan.price.toFixed(2)}</p>
            <p style="margin: 8px 0; color: #22c55e;"><strong>Economia mensal:</strong> R$ ${savings.toFixed(2)}</p>
            <p style="margin: 8px 0; color: #22c55e;"><strong>Economia anual:</strong> R$ ${(savings * 12).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #ff6600; font-size: 22px; margin: 0 0 20px 0;">Serviços Inclusos</h2>
        ${plan.services.map((service, index) => `
          <div style="background: #f8f9fa; margin-bottom: 15px; padding: 20px; border-radius: 8px; border-left: 5px solid #22c55e;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="color: #22c55e; margin: 0; font-size: 18px;">${service.name}</h3>
              <div style="text-align: right;">
                <p style="margin: 0; font-size: 14px; color: #666;">Preço avulso</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">R$ ${service.marketPrice.toFixed(2)}</p>
              </div>
            </div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; line-height: 1.4;">
              ${servicesInfo[service.name]?.description || 'Serviço premium com benefícios exclusivos.'}
            </p>
            ${servicesInfo[service.name]?.contact ? `
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">
                <strong>Contato:</strong> ${servicesInfo[service.name].contact}
              </p>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div style="background: #fff5f0; padding: 20px; border-radius: 8px; border: 2px solid #ff6600; margin-bottom: 20px;">
        <h3 style="color: #ff6600; font-size: 18px; margin: 0 0 10px 0;">💡 Vantagem do Combinaqui</h3>
        <p style="margin: 0; color: #666; line-height: 1.4;">
          ${plan.description} Com economia de <strong style="color: #22c55e;">R$ ${savings.toFixed(2)} por mês</strong> 
          comparado aos preços individuais do mercado. Isso representa uma economia anual de 
          <strong style="color: #22c55e;">R$ ${(savings * 12).toFixed(2)}</strong>.
        </p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 12px; text-align: center;">
        <p style="margin: 0;">Comparativo gerado pelo Combinaqui Itaú em ${new Date().toLocaleString('pt-BR')}</p>
        <p style="margin: 5px 0 0 0;"><strong>Importante:</strong> Este comparativo é apenas orientativo. Consulte as condições específicas de cada serviço.</p>
      </div>
    `;

    document.body.appendChild(pdfElement);

    try {
      const canvas = await html2canvas(pdfElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: pdfElement.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (imgHeight > pageHeight) {
        const scaleFactor = pageHeight / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = pageHeight;
        const xOffset = (210 - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
      } else {
        const yOffset = (pageHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
      }

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
    } finally {
      document.body.removeChild(pdfElement);
    }
  };

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
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
                        <button 
                          onClick={() => handleServiceClick(service.name)}
                          className="font-medium text-left hover:text-primary transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
                        >
                          {service.name}
                        </button>
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
        
        <ServiceInfoModal 
          serviceName={selectedService}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default CombinaquiComparison;