import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Shield, Heart, AlertTriangle, Car, Phone, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import itauLogo from "@/assets/itau-logo.png";

interface Coverage {
  id: string;
  name: string;
  description: string;
  basePrice: number; // Price per R$ 1,000 of coverage per month
  icon: any;
  required?: boolean;
  defaultAmount: number; // Default coverage amount
  minAmount: number;
  maxAmount: number;
}

const coverages: Coverage[] = [
  {
    id: "morte-acidental",
    name: "Morte Acidental",
    description: "Garante ao beneficiário o pagamento no caso de morte por acidente.",
    basePrice: 0.12, // R$ 0.12 per R$ 1,000 - ajustado conforme pesquisa de mercado
    icon: AlertTriangle,
    defaultAmount: 50000,
    minAmount: 5000,
    maxAmount: 300000
  },
  {
    id: "invalidez-acidente",
    name: "Invalidez Permanente por Acidente", 
    description: "Garante pagamento no caso de invalidez funcional definitiva causada por acidente pessoal.",
    basePrice: 0.18,
    icon: AlertTriangle,
    defaultAmount: 30000,
    minAmount: 5000,
    maxAmount: 150000
  },
  {
    id: "morte-qualquer-causa",
    name: "Morte por Qualquer Causa",
    description: "Garante ao beneficiário o pagamento no caso de morte por doença, velhice ou acidente.",
    basePrice: 0.35, // R$ 0.35 per R$ 1,000 - ajustado conforme pesquisa
    icon: Shield,
    defaultAmount: 50000,
    minAmount: 5000,
    maxAmount: 300000
  },
  {
    id: "diaria-acidente",
    name: "Diária de Internação por Acidente",
    description: "Pagamento de diária durante internação hospitalar decorrente de acidente.",
    basePrice: 0.25, // R$ 0.25 por R$ 1 de diária - muito mais baixo conforme mercado
    icon: Home,
    defaultAmount: 100, // R$ 100/dia
    minAmount: 25,
    maxAmount: 300
  },
  {
    id: "diaria-doenca",
    name: "Diária de Internação por Doença",
    description: "Pagamento de diária durante internação hospitalar decorrente de doença.",
    basePrice: 0.35, // R$ 0.35 por R$ 1 de diária - ajustado para baixo
    icon: Home,
    defaultAmount: 100, // R$ 100/dia
    minAmount: 25,
    maxAmount: 300
  },
  {
    id: "quebra-ossos",
    name: "Quebra de Ossos",
    description: "Indenização em caso de fratura óssea decorrente de acidente pessoal.",
    basePrice: 0.28,
    icon: Heart,
    defaultAmount: 2000,
    minAmount: 500,
    maxAmount: 5000
  },
  {
    id: "doencas-graves",
    name: "Doenças Graves",
    description: "Indenização em caso de primeiro diagnóstico de câncer, infarto, AVC, insuficiência renal ou transplante de órgãos.",
    basePrice: 0.65,
    icon: Heart,
    defaultAmount: 30000,
    minAmount: 5000,
    maxAmount: 150000
  },
  {
    id: "funeral-segurado",
    name: "Auxílio Funeral do Segurado",
    description: "Auxílio para despesas de funeral do segurado - Valor fixo de R$ 5.000.",
    basePrice: 4.50, // Valor fixo mensal - ajustado para baixo
    icon: Shield,
    defaultAmount: 5000,
    minAmount: 5000,
    maxAmount: 5000
  },
  {
    id: "funeral-conjuge-filhos",
    name: "Auxílio Funeral Cônjuge e Filhos",
    description: "Auxílio para despesas de funeral do cônjuge e filhos - Valor fixo de R$ 5.000.",
    basePrice: 3.20, // Valor fixo mensal - ajustado para baixo
    icon: Shield,
    defaultAmount: 5000,
    minAmount: 5000,
    maxAmount: 5000
  },
  {
    id: "funeral-pais",
    name: "Auxílio Funeral dos Pais",
    description: "Auxílio para despesas de funeral dos pais do segurado - Valor fixo de R$ 5.000.",
    basePrice: 8.90, // Valor fixo mensal - o mais caro conforme solicitado
    icon: Shield,
    defaultAmount: 5000,
    minAmount: 5000,
    maxAmount: 5000
  }
];

const Seguros = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [age, setAge] = useState("");
  const [months, setMonths] = useState("");
  const [selectedCoverages, setSelectedCoverages] = useState<string[]>([]);
  const [coverageAmounts, setCoverageAmounts] = useState<{[key: string]: number}>({});
  const [showSimulation, setShowSimulation] = useState(false);

  const calculatePrice = (coverage: Coverage, ageValue: number, coverageAmount: number) => {
    // Para coberturas de valor fixo (auxílios funeral)
    if (coverage.id.includes("funeral")) {
      return coverage.basePrice;
    }

    // Fator de idade baseado em pesquisa de mercado brasileiro
    let ageFactor = 1;
    if (ageValue >= 18 && ageValue <= 25) ageFactor = 0.6;
    else if (ageValue >= 26 && ageValue <= 35) ageFactor = 0.8;
    else if (ageValue >= 36 && ageValue <= 45) ageFactor = 1.2;
    else if (ageValue >= 46 && ageValue <= 55) ageFactor = 1.8;
    else if (ageValue >= 56 && ageValue <= 65) ageFactor = 2.8;
    else if (ageValue > 65) ageFactor = 4.2;

    // Para diárias, calcular por valor da diária
    if (coverage.id.includes("diaria")) {
      return coverage.basePrice * ageFactor * coverageAmount;
    }

    // Calcular preço por mil de cobertura para outros tipos
    const pricePerThousand = coverage.basePrice * ageFactor;
    return (pricePerThousand * coverageAmount) / 1000;
  };

  const handleCoverageToggle = (coverageId: string) => {
    setSelectedCoverages(prev =>
      prev.includes(coverageId)
        ? prev.filter(id => id !== coverageId)
        : [...prev, coverageId]
    );
  };

  const handleSimulate = () => {
    if (!age || parseInt(age) < 18 || parseInt(age) > 75) {
      toast({
        title: "Idade inválida",
        description: "A idade deve estar entre 18 e 75 anos.",
        variant: "destructive",
      });
      return;
    }

    if (months && (parseInt(months) < 0 || parseInt(months) > 11)) {
      toast({
        title: "Meses inválidos",
        description: "Os meses devem estar entre 0 e 11.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCoverages.length === 0) {
      toast({
        title: "Selecione pelo menos uma cobertura",
        description: "É necessário selecionar ao menos uma cobertura para simular.",
        variant: "destructive",
      });
      return;
    }

    setShowSimulation(true);
  };

  const generatePDF = async () => {
    if (!ageValue || !selectedCoverages.length) return;

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
    
    pdfElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ff6600; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
          <img src="${itauLogo}" alt="Itaú" style="height: 60px;" />
        </div>
        <h1 style="color: #ff6600; font-size: 28px; margin: 0; font-weight: bold;">Simulação Seguro Itaú Vida</h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Relatório detalhado da simulação</p>
        <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h2 style="color: #ff6600; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #ff6600; padding-bottom: 5px;">Dados do Cliente</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0; color: #333;"><strong>Idade:</strong> ${age} anos e ${months} meses</p>
            <p style="margin: 8px 0; color: #333;"><strong>Quantidade de Coberturas:</strong> ${selectedCoverages.length}</p>
          </div>
        </div>

        <div>
          <h2 style="color: #0066cc; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #0066cc; padding-bottom: 5px;">Resumo dos Valores</h2>
          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0; color: #333;"><strong>Valor Total Mensal:</strong> R$ ${totalMonthlyPrice.toFixed(2)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Valor Total Anual:</strong> R$ ${(totalMonthlyPrice * 12).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #ff6600; font-size: 22px; margin: 0 0 20px 0; text-align: center; border-bottom: 3px solid #ff6600; padding-bottom: 10px;">Coberturas Contratadas</h2>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
          ${selectedCoverages.map((coverageId) => {
            const coverage = coverages.find(c => c.id === coverageId);
            if (!coverage) return '';
            
            const amount = coverageAmounts[coverageId] || coverage.defaultAmount;
            const price = calculatePrice(coverage, ageValue, amount);
            
            return `
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6600;">
                <div style="display: flex; justify-content: between; align-items: center;">
                  <div style="flex: 1;">
                    <h3 style="color: #ff6600; font-size: 16px; margin: 0 0 8px 0;">${coverage.name}</h3>
                    <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.4;">${coverage.description}</p>
                  </div>
                  <div style="text-align: right; margin-left: 20px;">
                    <p style="color: #666; font-size: 12px; margin: 0;">Valor: R$ ${amount.toLocaleString('pt-BR')}</p>
                    <p style="color: #ff6600; font-size: 18px; font-weight: bold; margin: 0;">R$ ${price.toFixed(2)}/mês</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #0066cc; font-size: 18px; margin: 0 0 15px 0;">💡 Informações Importantes</h3>
        <ul style="color: #666; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Os valores podem variar de acordo com a análise de perfil de risco</li>
          <li>Carência de acordo com cada cobertura contratada</li>
          <li>Consulte as condições gerais do produto</li>
          <li>Valores válidos para contratação até ${new Date().toLocaleDateString('pt-BR')}</li>
        </ul>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 12px; text-align: center;">
        <p style="margin: 0;">Este documento foi gerado pelo Simulador de Seguro de Vida em ${new Date().toLocaleString('pt-BR')}</p>
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

      pdf.save(`simulacao-seguro-vida-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      
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

  const ageValue = parseInt(age) || 0;
  const totalMonthlyPrice = selectedCoverages.reduce((sum, coverageId) => {
    const coverage = coverages.find(c => c.id === coverageId);
    const amount = coverageAmounts[coverageId] || coverage?.defaultAmount || 0;
    return sum + (coverage ? calculatePrice(coverage, ageValue, amount) : 0);
  }, 0);

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
          <h1 className="text-4xl font-bold text-primary mb-4">Seguro Itaú Vida</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A proteção para o seu presente e o cuidado com o futuro de quem você ama. 
            Do seu jeito e sem qualquer burocracia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Simulação */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Dados para Simulação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Ex: 35"
                      min="18"
                      max="75"
                    />
                  </div>
                  <div>
                    <Label htmlFor="months">Meses</Label>
                    <Input
                      id="months"
                      type="number"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      placeholder="Ex: 6"
                      min="0"
                      max="11"
                    />
                  </div>
                </div>

                 {/* Individual coverage amounts will be shown with each coverage */}

                <div>
                  <Label className="text-base font-semibold mb-4 block">Coberturas Disponíveis</Label>
                  <div className="space-y-4">
                     {coverages.map((coverage) => {
                       const Icon = coverage.icon;
                       const isSelected = selectedCoverages.includes(coverage.id);
                        const currentAmount = coverageAmounts[coverage.id] || coverage.defaultAmount;
                       const price = calculatePrice(coverage, ageValue, currentAmount);
                       
                       return (
                         <div key={coverage.id} className="space-y-3 p-3 border rounded-lg">
                           <div className="flex items-start space-x-3">
                             <Checkbox
                               id={coverage.id}
                               checked={isSelected}
                               onCheckedChange={() => handleCoverageToggle(coverage.id)}
                               disabled={coverage.required}
                             />
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-1">
                                 <Icon className="w-4 h-4 text-primary" />
                                 <Label htmlFor={coverage.id} className="font-medium cursor-pointer">
                                   {coverage.name}
                                 </Label>
                               </div>
                               <p className="text-sm text-muted-foreground mb-2">{coverage.description}</p>
                               <p className="text-sm font-semibold text-primary">
                                 R$ {price.toFixed(2)}/mês
                               </p>
                             </div>
                           </div>
                            {!coverage.id.includes("funeral") && (
                              <div className="ml-7">
                                <Label htmlFor={`amount-${coverage.id}`} className="text-xs">
                                  {coverage.id.includes("diaria") ? "Valor da Diária (R$)" : "Valor da Cobertura (R$)"}
                                </Label>
                                 <Input
                                   id={`amount-${coverage.id}`}
                                   type="number"
                                   value={coverageAmounts[coverage.id] || ""}
                                   onChange={(e) => setCoverageAmounts(prev => ({
                                     ...prev,
                                     [coverage.id]: parseInt(e.target.value) || 0
                                   }))}
                                   placeholder={`Ex: ${coverage.defaultAmount.toLocaleString('pt-BR')}`}
                                   min={coverage.minAmount}
                                   max={coverage.maxAmount}
                                   step={coverage.id.includes("diaria") ? "25" : "1000"}
                                   className="mt-1"
                                 />
                               <p className="text-xs text-muted-foreground mt-1">
                                 Min: R$ {coverage.minAmount.toLocaleString('pt-BR')} | 
                                 Max: R$ {coverage.maxAmount.toLocaleString('pt-BR')}
                               </p>
                             </div>
                           )}
                         </div>
                       );
                     })}
                  </div>
                </div>

                <Button onClick={handleSimulate} className="w-full" size="lg">
                  Simular Seguro
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resultado da Simulação */}
          <div className="lg:col-span-2">
            {showSimulation && (
              <div ref={printRef}>
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-between mb-4">
                      <img src={itauLogo} alt="Itaú" className="h-12" />
                      <div>
                        <CardTitle className="text-2xl text-primary">Simulação Seguro Itaú Vida</CardTitle>
                        <p className="text-muted-foreground">Idade: {age} anos e {months} meses</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Coberturas Selecionadas</h3>
                          <div className="space-y-3">
                            {selectedCoverages.map((coverageId) => {
                              const coverage = coverages.find(c => c.id === coverageId);
                              if (!coverage) return null;
                              
                              const Icon = coverage.icon;
                               const amount = coverageAmounts[coverageId] || coverage.defaultAmount;
                               const price = calculatePrice(coverage, ageValue, amount);
                              
                              return (
                                <div key={coverageId} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{coverage.name}</span>
                                  </div>
                                  <span className="font-semibold">R$ {price.toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Resumo dos Valores</h3>
                          <div className="space-y-4">
                            <div className="p-4 bg-primary/10 rounded-lg">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Valor Total Mensal</p>
                                <p className="text-3xl font-bold text-primary">R$ {totalMonthlyPrice.toFixed(2)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="text-center p-3 bg-secondary/20 rounded">
                                <p className="text-muted-foreground">Anual</p>
                                <p className="font-bold">R$ {(totalMonthlyPrice * 12).toFixed(2)}</p>
                              </div>
                              <div className="text-center p-3 bg-secondary/20 rounded">
                                <p className="text-muted-foreground">Quantidade de Coberturas</p>
                                <p className="font-bold">{selectedCoverages.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">💡 Informações Importantes</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Os valores podem variar de acordo com a análise de perfil de risco</li>
                          <li>• Carência de acordo com cada cobertura contratada</li>
                          <li>• Consulte as condições gerais do produto</li>
                          <li>• Valores válidos para contratação até {new Date().toLocaleDateString()}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!showSimulation && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Pronto para Simular?</h3>
                  <p className="text-muted-foreground">
                    Preencha seus dados ao lado e selecione as coberturas desejadas para ver sua simulação personalizada.
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

export default Seguros;