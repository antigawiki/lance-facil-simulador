import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import itauLogo from "@/assets/itau-logo.png";

interface InvestmentOption {
  name: string;
  type: string;
  annualRate: number;
  minRate?: number;
  maxRate?: number;
  hasIOF: boolean;
  hasIR: boolean;
  riskLevel: "Baixo" | "Moderado" | "Bom" | "Conservador";
  color: string;
  description: string;
}

// Função para calcular CDI baseado na SELIC (sempre 0,10% abaixo)
const getCDIRate = (selicRate: number) => selicRate - 0.10;

const getInvestmentOptions = (selicRate: number): InvestmentOption[] => {
  const cdiRate = getCDIRate(selicRate);
  
  return [
    {
      name: "Tesouro Selic",
      type: "Renda Fixa",
      annualRate: selicRate,
      hasIOF: true,
      hasIR: true,
      riskLevel: "Conservador",
      color: "#8884d8",
      description: `Títulos do governo com rentabilidade atrelada à Selic (${selicRate.toFixed(2)}%)`
    },
    {
      name: "CDB",
      type: "Renda Fixa",
      annualRate: cdiRate, // 100% CDI
      hasIOF: true,
      hasIR: true,
      riskLevel: "Bom",
      color: "#82ca9d",
      description: `Certificado de Depósito Bancário - 100% CDI (${cdiRate.toFixed(2)}%)`
    },
    {
      name: "LCI/LCA",
      type: "Renda Fixa",
      annualRate: cdiRate * 0.9, // 90% CDI
      hasIOF: false,
      hasIR: false,
      riskLevel: "Moderado",
      color: "#ffc658",
      description: `Letras de Crédito com isenção de IR - 90% CDI (${(cdiRate * 0.9).toFixed(2)}%)`
    },
    {
      name: "Poupança",
      type: "Renda Fixa",
      annualRate: selicRate > 8.5 ? selicRate * 0.7 + 1.5 : 6.17, // Regra da poupança
      hasIOF: false,
      hasIR: false,
      riskLevel: "Baixo",
      color: "#ff7300",
      description: "Tradicional caderneta de poupança"
    },
    {
      name: "Fundos DI",
      type: "Fundos",
      annualRate: cdiRate * 0.85, // 85% CDI
      hasIOF: true,
      hasIR: true,
      riskLevel: "Bom",
      color: "#8dd1e1",
      description: `Fundos de investimento DI - 85% CDI (${(cdiRate * 0.85).toFixed(2)}%)`
    }
  ];
};

const SimuladorInvestimentos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [valorInicial, setValorInicial] = useState<number>(10000);
  const [aporteMenusal, setAporteMenusal] = useState<number>(1000);
  const [prazoMeses, setPrazoMeses] = useState<number>(60);
  const [selicRate, setSelicRate] = useState<number>(15.0);
  const [showResults, setShowResults] = useState(false);
  
  // Opções de investimento dinâmicas baseadas na SELIC
  const investmentOptions = getInvestmentOptions(selicRate);

  // Função para calcular IR progressivo
  const calculateIR = (months: number, profit: number) => {
    if (months <= 6) return profit * 0.225; // 22.5%
    if (months <= 12) return profit * 0.20; // 20%
    if (months <= 24) return profit * 0.175; // 17.5%
    return profit * 0.15; // 15%
  };

  // Função para calcular IOF
  const calculateIOF = (months: number, profit: number) => {
    if (months >= 12) return 0; // IOF não se aplica após 1 ano
    const days = months * 30;
    if (days >= 30) return 0;
    
    // Tabela regressiva IOF (simplificada)
    const iofRate = Math.max(0, (30 - days) / 30 * 0.5 / 100);
    return profit * iofRate;
  };

  // Função para calcular rendimento com juros compostos
  const calculateInvestmentValue = (investment: InvestmentOption, months: number) => {
    const monthlyRate = investment.annualRate / 100 / 12;
    const totalInvested = valorInicial + (aporteMenusal * months);
    
    // Fórmula de juros compostos com aportes mensais
    const futureValueInitial = valorInicial * Math.pow(1 + monthlyRate, months);
    const futureValueContributions = aporteMenusal * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const grossValue = futureValueInitial + futureValueContributions;
    
    const profit = grossValue - totalInvested;
    
    // Calcular impostos
    let taxes = 0;
    if (investment.hasIR) {
      taxes += calculateIR(months, profit);
    }
    if (investment.hasIOF) {
      taxes += calculateIOF(months, profit);
    }
    
    const netValue = grossValue - taxes;
    const netProfit = netValue - totalInvested;
    const netProfitability = (netProfit / totalInvested) * 100;
    
    return {
      totalInvested,
      grossValue,
      taxes,
      netValue,
      netProfit,
      netProfitability
    };
  };

  // Gerar dados para o gráfico de evolução
  const generateChartData = () => {
    const data = [];
    for (let month = 0; month <= prazoMeses; month += 6) {
      const dataPoint: any = { month };
      investmentOptions.forEach(investment => {
        const result = calculateInvestmentValue(investment, month);
        dataPoint[investment.name] = result.netValue;
      });
      data.push(dataPoint);
    }
    return data;
  };

  // Gerar dados para comparação final
  const generateComparisonData = () => {
    return investmentOptions.map(investment => {
      const result = calculateInvestmentValue(investment, prazoMeses);
      return {
        name: investment.name,
        value: result.netValue,
        color: investment.color
      };
    });
  };

  const handleSimulate = () => {
    if (valorInicial <= 0 || aporteMenusal < 0 || prazoMeses <= 0) {
      toast({
        title: "Dados inválidos",
        description: "Verifique os valores inseridos.",
        variant: "destructive",
      });
      return;
    }
    setShowResults(true);
  };

  const updateSelicRate = () => {
    // Simular atualização da taxa Selic
    const rates = [13.5, 14.0, 14.5, 15.0, 15.5, 16.0];
    const newRate = rates[Math.floor(Math.random() * rates.length)];
    setSelicRate(newRate);
    
    toast({
      title: "Taxa Selic atualizada",
      description: `Nova taxa: ${newRate.toFixed(2)}% a.a. | CDI: ${getCDIRate(newRate).toFixed(2)}% a.a.`,
    });
    
    if (showResults) {
      // Forçar recálculo se já está simulando
      setShowResults(false);
      setTimeout(() => setShowResults(true), 100);
    }
  };

  const generatePDF = async () => {
    if (!showResults) return;

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
    
    const chartData = generateChartData();
    const finalMonth = chartData[chartData.length - 1];
    
    pdfElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ff6600; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
          <img src="${itauLogo}" alt="Itaú" style="height: 60px;" />
        </div>
        <h1 style="color: #ff6600; font-size: 28px; margin: 0; font-weight: bold;">Simulação de Investimentos Itaú</h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Comparação de Rendimentos</p>
        <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h2 style="color: #ff6600; font-size: 20px; margin: 0 0 15px 0;">Parâmetros da Simulação</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0;"><strong>Valor Inicial:</strong> R$ ${valorInicial.toLocaleString('pt-BR')}</p>
            <p style="margin: 8px 0;"><strong>Aporte Mensal:</strong> R$ ${aporteMenusal.toLocaleString('pt-BR')}</p>
            <p style="margin: 8px 0;"><strong>Prazo:</strong> ${prazoMeses} meses</p>
            <p style="margin: 8px 0;"><strong>Taxa Selic:</strong> ${selicRate.toFixed(2)}% a.a.</p>
          </div>
        </div>

        <div>
          <h2 style="color: #0066cc; font-size: 20px; margin: 0 0 15px 0;">Resumo</h2>
          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0;"><strong>Total Investido:</strong> R$ ${(valorInicial + aporteMenusal * prazoMeses).toLocaleString('pt-BR')}</p>
            <p style="margin: 8px 0;"><strong>Prazo:</strong> ${Math.floor(prazoMeses/12)} anos e ${prazoMeses%12} meses</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #ff6600; font-size: 22px; margin: 0 0 20px 0;">Resultados por Investimento</h2>
        ${investmentOptions.map(investment => {
          const result = calculateInvestmentValue(investment, prazoMeses);
          return `
            <div style="background: #f8f9fa; margin-bottom: 15px; padding: 20px; border-radius: 8px; border-left: 5px solid ${investment.color};">
              <h3 style="color: ${investment.color}; margin: 0 0 10px 0; font-size: 18px;">${investment.name}</h3>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div>
                  <p style="margin: 0; font-size: 14px; color: #666;">Valor Líquido</p>
                  <p style="margin: 0; font-size: 18px; font-weight: bold;">R$ ${result.netValue.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: #666;">Rendimento Líquido</p>
                  <p style="margin: 0; font-size: 18px; font-weight: bold;">R$ ${result.netProfit.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px; color: #666;">Rentabilidade</p>
                  <p style="margin: 0; font-size: 18px; font-weight: bold;">${result.netProfitability.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 12px; text-align: center;">
        <p style="margin: 0;">Relatório gerado pelo Simulador de Investimentos Itaú em ${new Date().toLocaleString('pt-BR')}</p>
        <p style="margin: 5px 0 0 0;"><strong>Importante:</strong> Esta simulação é apenas orientativa. Consulte sempre as condições específicas de cada produto.</p>
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

      pdf.save(`simulacao-investimentos-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
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

  const chartData = showResults ? generateChartData() : [];
  const comparisonData = showResults ? generateComparisonData() : [];

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
          
          <div className="flex gap-2">
            <Button 
              onClick={updateSelicRate} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar Selic
            </Button>
            
            {showResults && (
              <Button onClick={generatePDF} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Gerar PDF
              </Button>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Comparador de Investimentos</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare diferentes opções de investimento com rendimento líquido e impostos
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-semibold">Taxa Selic: {selicRate.toFixed(2)}% a.a.</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-semibold">CDI: {getCDIRate(selicRate).toFixed(2)}% a.a.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configurações */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros da Simulação</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure os valores para sua simulação de investimento
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="valorInicial">Valor Inicial (R$)</Label>
                  <Input
                    id="valorInicial"
                    type="number"
                    value={valorInicial}
                    onChange={(e) => setValorInicial(Number(e.target.value))}
                    min="0"
                    step="1000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="aporteMenusal">Aporte Mensal (R$)</Label>
                  <Input
                    id="aporteMenusal"
                    type="number"
                    value={aporteMenusal}
                    onChange={(e) => setAporteMenusal(Number(e.target.value))}
                    min="0"
                    step="100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="prazoMeses">Prazo (meses)</Label>
                  <Input
                    id="prazoMeses"
                    type="number"
                    value={prazoMeses}
                    onChange={(e) => setPrazoMeses(Number(e.target.value))}
                    min="1"
                    max="360"
                  />
                </div>

                <Button onClick={handleSimulate} className="w-full">
                  Simular Investimentos
                </Button>
              </CardContent>
            </Card>

            {/* Configurações dos Investimentos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Configurações dos Investimentos
                  <Badge variant="outline">Configurar</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {investmentOptions.map((investment) => (
                  <div key={investment.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{investment.name}</span>
                      <Badge 
                        variant={
                          investment.riskLevel === "Baixo" ? "destructive" :
                          investment.riskLevel === "Moderado" ? "secondary" :
                          investment.riskLevel === "Bom" ? "default" : "outline"
                        }
                      >
                        {investment.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{investment.annualRate.toFixed(2)}% a.a.</p>
                    <p className="text-xs text-muted-foreground">{investment.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2">
            {showResults && (
              <div className="space-y-6" ref={printRef}>
                {/* Cards de Resultado */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {investmentOptions.map((investment) => {
                    const result = calculateInvestmentValue(investment, prazoMeses);
                    return (
                      <Card key={investment.name} className="border-l-4" style={{ borderLeftColor: investment.color }}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{investment.name}</CardTitle>
                            <Badge variant={
                              investment.riskLevel === "Baixo" ? "destructive" :
                              investment.riskLevel === "Moderado" ? "secondary" :
                              investment.riskLevel === "Bom" ? "default" : "outline"
                            }>
                              {investment.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{investment.annualRate.toFixed(2)}% a.a.</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Valor Bruto:</p>
                            <p className="text-lg font-bold">R$ {result.grossValue.toLocaleString('pt-BR')}</p>
                          </div>
                          
                          {result.taxes > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Impostos:</p>
                              <p className="text-sm font-semibold text-red-600">-R$ {result.taxes.toLocaleString('pt-BR')}</p>
                            </div>
                          )}
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Valor Líquido:</p>
                            <p className="text-xl font-bold text-green-600">R$ {result.netValue.toLocaleString('pt-BR')}</p>
                          </div>
                          
                          <div className="pt-2 border-t space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Total Investido:</span> R$ {result.totalInvested.toLocaleString('pt-BR')}</p>
                            <p><span className="text-muted-foreground">Rendimento Líquido:</span> R$ {result.netProfit.toLocaleString('pt-BR')}</p>
                            <p><span className="text-muted-foreground">Rentabilidade Líquida:</span> {result.netProfitability.toFixed(1)}%</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Gráfico de Evolução */}
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução dos Investimentos (Valores Brutos)</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe como cada investimento cresce ao longo do tempo
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            label={{ value: 'Meses', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis 
                            label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                            labelFormatter={(label) => `Mês ${label}`}
                          />
                          {investmentOptions.map((investment) => (
                            <Line
                              key={investment.name}
                              type="monotone"
                              dataKey={investment.name}
                              stroke={investment.color}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de Comparação Final */}
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação Final (Valores Líquidos)</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Valor líquido final após impostos de cada investimento após {Math.floor(prazoMeses/12)} anos e {prazoMeses%12} meses
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis 
                            tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor Líquido']}
                          />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!showResults && (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Configure sua simulação</h3>
                  <p className="text-muted-foreground">
                    Preencha os parâmetros ao lado e clique em "Simular Investimentos" para ver os resultados
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimuladorInvestimentos;