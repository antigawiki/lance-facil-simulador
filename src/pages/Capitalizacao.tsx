import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, DollarSign, Gift, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import itauLogo from "@/assets/itau-logo.png";

interface PICPlan {
  value: number;
  name: string;
  monthlyPayment: number;
  maxPrize: number;
  description: string;
  category: "varejo" | "uniclass";
}

const picPlans: PICPlan[] = [
  {
    value: 30,
    name: "PIC 30",
    monthlyPayment: 30,
    maxPrize: 1500000,
    description: "Prêmios até R$ 1,5 milhão, mais de 83 mil chances de ganhar",
    category: "varejo"
  },
  {
    value: 60,
    name: "PIC 60",
    monthlyPayment: 60,
    maxPrize: 3000000,
    description: "Prêmios até R$ 3 milhões, mais de 83 mil chances de ganhar",
    category: "varejo"
  },
  {
    value: 90,
    name: "PIC 90",
    monthlyPayment: 90,
    maxPrize: 4500000,
    description: "Prêmios até R$ 4,5 milhões, mais de 83 mil chances de ganhar",
    category: "varejo"
  },
  {
    value: 120,
    name: "PIC 120",
    monthlyPayment: 120,
    maxPrize: 6000000,
    description: "Prêmios até R$ 6 milhões, mais de 83 mil chances de ganhar",
    category: "varejo"
  },
  {
    value: 150,
    name: "PIC 150 Uniclass",
    monthlyPayment: 150,
    maxPrize: 7500000,
    description: "Exclusivo Uniclass - Prêmios até R$ 7,5 milhões",
    category: "uniclass"
  },
  {
    value: 200,
    name: "PIC 200 Uniclass",
    monthlyPayment: 200,
    maxPrize: 10000000,
    description: "Exclusivo Uniclass - Prêmios até R$ 10 milhões",
    category: "uniclass"
  }
];

const Capitalizacao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [selectedPICs, setSelectedPICs] = useState<{[key: number]: number}>({});
  const [showSimulation, setShowSimulation] = useState(false);

  // Função para calcular valor de resgate com base no período
  const calculateRescueValue = (monthlyValue: number, months: number) => {
    const totalPaid = monthlyValue * months;
    
    // Percentuais de resgate baseados nas condições reais do PIC
    let rescuePercentage = 0;
    if (months >= 8 && months < 12) rescuePercentage = 0.55; // 55% após carência
    else if (months >= 12 && months < 24) rescuePercentage = 0.72; // 72% após 12 meses
    else if (months >= 24 && months < 36) rescuePercentage = 0.84; // 84% após 24 meses
    else if (months >= 36 && months < 48) rescuePercentage = 0.92; // 92% após 36 meses
    else if (months >= 48 && months < 60) rescuePercentage = 0.96; // 96% após 48 meses
    else if (months >= 60) rescuePercentage = 1.0; // 100% ao final (60 meses)
    
    return totalPaid * rescuePercentage;
  };

  // Função para calcular número de sorteios
  const calculateDraws = (months: number) => {
    const biweeklyDraws = months * 2; // 2 sorteios quinzenais por mês
    const monthlyDraws = months; // 1 sorteio mensal
    const annualDraws = Math.floor(months / 12); // 1 sorteio especial por ano
    
    return {
      biweekly: biweeklyDraws,
      monthly: monthlyDraws,
      annual: annualDraws,
      total: biweeklyDraws + monthlyDraws + annualDraws
    };
  };

  const handlePICChange = (picValue: number, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    if (qty === 0) {
      const newSelected = { ...selectedPICs };
      delete newSelected[picValue];
      setSelectedPICs(newSelected);
    } else {
      setSelectedPICs(prev => ({
        ...prev,
        [picValue]: qty
      }));
    }
  };

  const handleSimulate = () => {
    if (Object.keys(selectedPICs).length === 0) {
      toast({
        title: "Nenhum PIC selecionado",
        description: "Selecione pelo menos um PIC para simular.",
        variant: "destructive",
      });
      return;
    }

    setShowSimulation(true);
  };

  const generatePDF = async () => {
    if (!showSimulation || Object.keys(selectedPICs).length === 0) return;

    // Criar elemento temporário para o PDF com fundo branco
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
    
    const picEntries = Object.entries(selectedPICs);
    
    pdfElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ff6600; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
          <img src="${itauLogo}" alt="Itaú" style="height: 60px;" />
        </div>
        <h1 style="color: #ff6600; font-size: 28px; margin: 0; font-weight: bold;">Simulação PIC Itaú Capitalização</h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Relatório detalhado da simulação</p>
        <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h2 style="color: #ff6600; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #ff6600; padding-bottom: 5px;">PICs Selecionados</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            ${picEntries.map(([value, quantity]) => 
              `<p style="margin: 8px 0; color: #333;"><strong>PIC R$ ${value}:</strong> ${quantity} unidade${quantity > 1 ? 's' : ''}</p>`
            ).join('')}
          </div>
        </div>

        <div>
          <h2 style="color: #0066cc; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #0066cc; padding-bottom: 5px;">Resumo dos Valores</h2>
          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0; color: #333;"><strong>Valor Total Mensal:</strong> R$ ${totalMonthlyPayment.toFixed(2)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Total Investido (60 meses):</strong> R$ ${(totalMonthlyPayment * 60).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #ff6600; font-size: 22px; margin: 0 0 20px 0; text-align: center; border-bottom: 3px solid #ff6600; padding-bottom: 10px;">Valores de Resgate</h2>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #ff6600; text-align: center;">
            <h3 style="color: #ff6600; font-size: 16px; margin: 0 0 10px 0;">12 meses</h3>
            <p style="color: #333; font-size: 20px; font-weight: bold; margin: 0;">R$ ${calculateRescueValue(totalMonthlyPayment, 12).toFixed(2)}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #0066cc; text-align: center;">
            <h3 style="color: #0066cc; font-size: 16px; margin: 0 0 10px 0;">24 meses</h3>
            <p style="color: #333; font-size: 20px; font-weight: bold; margin: 0;">R$ ${calculateRescueValue(totalMonthlyPayment, 24).toFixed(2)}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #28a745; text-align: center;">
            <h3 style="color: #28a745; font-size: 16px; margin: 0 0 10px 0;">36 meses</h3>
            <p style="color: #333; font-size: 20px; font-weight: bold; margin: 0;">R$ ${calculateRescueValue(totalMonthlyPayment, 36).toFixed(2)}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #6f42c1; text-align: center;">
            <h3 style="color: #6f42c1; font-size: 16px; margin: 0 0 10px 0;">48 meses</h3>
            <p style="color: #333; font-size: 20px; font-weight: bold; margin: 0;">R$ ${calculateRescueValue(totalMonthlyPayment, 48).toFixed(2)}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #e83e8c; text-align: center;">
            <h3 style="color: #e83e8c; font-size: 16px; margin: 0 0 10px 0;">60 meses</h3>
            <p style="color: #333; font-size: 20px; font-weight: bold; margin: 0;">R$ ${calculateRescueValue(totalMonthlyPayment, 60).toFixed(2)}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px solid #ff6600; text-align: center;">
            <h3 style="color: #ff6600; font-size: 16px; margin: 0 0 10px 0;">Total de Sorteios (60m)</h3>
            <p style="color: #333; font-size: 20px; font-weight: bold; margin: 0;">${calculateDraws(60).total}</p>
          </div>
        </div>
      </div>

      <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #0066cc; font-size: 18px; margin: 0 0 15px 0;">🎯 Informações sobre Sorteios</h3>
        <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Sorteios quinzenais, mensais e anuais durante todo o período</li>
          <li>Valores dos prêmios variam de R$ 10.000 a R$ 1.000.000</li>
          <li>Seus números ficam válidos durante todo o período do plano</li>
          <li>Valores de resgate garantidos independente dos sorteios</li>
          <li>Rendimento competitivo com a poupança</li>
        </ul>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 12px; text-align: center;">
        <p style="margin: 0;">Este documento foi gerado pelo Simulador PIC Itaú em ${new Date().toLocaleString('pt-BR')}</p>
        <p style="margin: 5px 0 0 0;"><strong>Importante:</strong> Esta simulação é apenas orientativa. Consulte sempre as condições específicas do produto.</p>
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
      
      // Se a imagem for maior que a página, redimensiona para caber
      if (imgHeight > pageHeight) {
        const scaleFactor = pageHeight / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = pageHeight;
        
        // Centraliza horizontalmente se necessário
        const xOffset = (210 - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
      } else {
        // Se cabe normalmente, adiciona centralizado verticalmente
        const yOffset = (pageHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
      }

      pdf.save(`simulacao-pic-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "A simulação foi baixada em formato PDF.",
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

  const totalMonthlyPayment = Object.entries(selectedPICs).reduce((sum, [picValue, quantity]) => {
    return sum + (parseInt(picValue) * quantity);
  }, 0);

  const rescuePeriods = [12, 24, 36, 48, 60];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          {showSimulation && (
            <Button onClick={generatePDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Gerar PDF
            </Button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">PIC - Capitalização Itaú</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Teste a sua sorte com o PIC! Você contrata por um valor mensal, concorre a sorteios 
            quinzenais, mensais e anuais e ainda recebe de volta o valor pago no fim do contrato.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Seleção de PICs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Escolha seus PICs</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione os PICs e as quantidades desejadas
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    PICs Varejo
                  </h3>
                  <div className="space-y-3">
                    {picPlans.filter(pic => pic.category === "varejo").map((pic) => (
                      <div key={pic.value} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{pic.name}</span>
                            <Badge variant="outline">R$ {pic.monthlyPayment}/mês</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{pic.description}</p>
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Qtd"
                            min="0"
                            max="10"
                            value={selectedPICs[pic.value] || ""}
                            onChange={(e) => handlePICChange(pic.value, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    PICs Uniclass
                  </h3>
                  <div className="space-y-3">
                    {picPlans.filter(pic => pic.category === "uniclass").map((pic) => (
                      <div key={pic.value} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-orange-50 to-orange-100">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{pic.name}</span>
                            <Badge variant="default" className="bg-orange-600">R$ {pic.monthlyPayment}/mês</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{pic.description}</p>
                        </div>
                        <div className="w-20">
                          <Input
                            type="number"
                            placeholder="Qtd"
                            min="0"
                            max="10"
                            value={selectedPICs[pic.value] || ""}
                            onChange={(e) => handlePICChange(pic.value, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total Mensal:</span>
                    <span className="text-xl font-bold text-primary">R$ {totalMonthlyPayment.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleSimulate} className="w-full" size="lg">
                    Simular PIC
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultado da Simulação */}
          <div>
            {showSimulation && (
              <div ref={printRef}>
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-between mb-4">
                      <img src={itauLogo} alt="Itaú" className="h-12" />
                      <div>
                        <CardTitle className="text-2xl text-primary">Simulação PIC Capitalização</CardTitle>
                        <p className="text-muted-foreground">Pagamento Total: R$ {totalMonthlyPayment}/mês</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* PICs Selecionados */}
                    <div>
                      <h3 className="font-semibold mb-3">PICs Selecionados</h3>
                      <div className="space-y-2">
                        {Object.entries(selectedPICs).map(([picValue, quantity]) => {
                          const pic = picPlans.find(p => p.value === parseInt(picValue));
                          if (!pic) return null;
                          
                          return (
                            <div key={picValue} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                              <span>{quantity}x {pic.name}</span>
                              <span className="font-semibold">R$ {(pic.monthlyPayment * quantity).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Valores de Resgate */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Valores de Resgate
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {rescuePeriods.map((months) => {
                          const totalPaid = totalMonthlyPayment * months;
                          const rescueValue = calculateRescueValue(totalMonthlyPayment, months);
                          
                          return (
                            <div key={months} className="p-3 border rounded-lg text-center">
                              <p className="text-sm text-muted-foreground">{months} meses</p>
                              <p className="font-bold text-green-600">R$ {rescueValue.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                Pago: R$ {totalPaid.toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sorteios */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Participação em Sorteios
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {rescuePeriods.map((months) => {
                          const draws = calculateDraws(months);
                          
                          return (
                            <div key={months} className="p-3 bg-blue-50 rounded-lg text-center">
                              <p className="text-sm font-medium text-blue-900">{months} meses</p>
                              <p className="text-lg font-bold text-blue-700">{draws.total}</p>
                              <p className="text-xs text-blue-600">sorteios totais</p>
                              <div className="text-xs text-blue-600 mt-1">
                                <p>{draws.biweekly} quinzenais</p>
                                <p>{draws.monthly} mensais</p>
                                <p>{draws.annual} anuais</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Informações Importantes */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">💡 Informações Importantes</h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Carência para resgate: 8 meses</li>
                        <li>• Ao final do contrato (60 meses) você recebe 100% do valor pago</li>
                        <li>• Sorteios baseados na Loteria Federal aos sábados</li>
                        <li>• Valores podem ser pausados por até 4 meses</li>
                        <li>• PICs Uniclass exclusivos para clientes Itaú Uniclass</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!showSimulation && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Milhares de Chances de Ganhar!</h3>
                  <p className="text-muted-foreground mb-4">
                    Selecione seus PICs ao lado para ver uma simulação completa com valores de resgate 
                    e quantidade de sorteios.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-secondary/20 rounded">
                      <p className="font-semibold">Sorteios Quinzenais</p>
                      <p className="text-muted-foreground">2x por mês</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <p className="font-semibold">Sorteios Mensais</p>
                      <p className="text-muted-foreground">1x por mês</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <p className="font-semibold">Sorteios Especiais</p>
                      <p className="text-muted-foreground">1x por ano</p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <p className="font-semibold">Prêmios</p>
                      <p className="text-muted-foreground">Até R$ 10 milhões</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Capitalizacao;