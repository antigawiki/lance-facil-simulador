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
  basePrice: number;
  icon: any;
  required?: boolean;
}

const coverages: Coverage[] = [
  {
    id: "morte",
    name: "Morte Qualquer Causa",
    description: "Garante ao beneficiário o pagamento do valor contratado no caso de morte por doença, velhice ou acidente.",
    basePrice: 3.50,
    icon: Shield,
    required: true
  },
  {
    id: "invalidez",
    name: "Invalidez Permanente por Acidente", 
    description: "Garante pagamento no caso de invalidez funcional definitiva causada por acidente pessoal.",
    basePrice: 1.80,
    icon: AlertTriangle
  },
  {
    id: "doencas",
    name: "Doenças Graves",
    description: "Indenização em caso de primeiro diagnóstico de câncer, infarto, AVC, insuficiência renal ou transplante de órgãos.",
    basePrice: 2.90,
    icon: Heart
  },
  {
    id: "avaliacao",
    name: "Avaliação Clínica Preventiva",
    description: "Consulta médica com clínico geral e exames laboratoriais (2 acionamentos por vigência).",
    basePrice: 4.50,
    icon: Heart
  },
  {
    id: "funeral",
    name: "Assistência Funeral Familiar",
    description: "Conjunto de serviços para o segurado, cônjuge e filhos com até 21 anos em todo território nacional.",
    basePrice: 6.80,
    icon: Shield
  },
  {
    id: "assistencia24h",
    name: "Assistência 24h",
    description: "Serviço telefônico para orientações e auxílio no cancelamento de cartões, documentos, etc.",
    basePrice: 3.20,
    icon: Phone
  }
];

const Seguros = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [age, setAge] = useState("");
  const [months, setMonths] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("50000");
  const [selectedCoverages, setSelectedCoverages] = useState<string[]>(["morte"]);
  const [showSimulation, setShowSimulation] = useState(false);

  const calculatePrice = (basePrice: number, ageValue: number, coverageAmount: number = 50000) => {
    // Fator de idade baseado em faixas etárias reais de seguros Itaú
    let ageFactor = 1;
    if (ageValue >= 18 && ageValue <= 30) ageFactor = 0.8;
    else if (ageValue >= 31 && ageValue <= 40) ageFactor = 1.0;
    else if (ageValue >= 41 && ageValue <= 50) ageFactor = 1.4;
    else if (ageValue >= 51 && ageValue <= 60) ageFactor = 2.2;
    else if (ageValue >= 61 && ageValue <= 70) ageFactor = 3.5;
    else if (ageValue > 70) ageFactor = 5.2;

    // Calcular preço por mil de cobertura
    const pricePerThousand = (basePrice * ageFactor) / 1000;
    return pricePerThousand * coverageAmount;
  };

  const handleCoverageToggle = (coverageId: string) => {
    if (coverageId === "morte") return; // Morte é obrigatória
    
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

    if (!months || parseInt(months) < 0 || parseInt(months) > 11) {
      toast({
        title: "Meses inválidos",
        description: "Os meses devem estar entre 0 e 11.",
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
            <p style="margin: 8px 0; color: #333;"><strong>Valor da Cobertura:</strong> R$ ${parseInt(coverageAmount).toLocaleString('pt-BR')}</p>
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
            
            const price = calculatePrice(coverage.basePrice, ageValue, parseInt(coverageAmount));
            
            return `
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6600;">
                <div style="display: flex; justify-content: between; align-items: center;">
                  <div style="flex: 1;">
                    <h3 style="color: #ff6600; font-size: 16px; margin: 0 0 8px 0;">${coverage.name}</h3>
                    <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.4;">${coverage.description}</p>
                  </div>
                  <div style="text-align: right; margin-left: 20px;">
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
  const coverageAmountValue = parseInt(coverageAmount) || 50000;
  const totalMonthlyPrice = selectedCoverages.reduce((sum, coverageId) => {
    const coverage = coverages.find(c => c.id === coverageId);
    return sum + (coverage ? calculatePrice(coverage.basePrice, ageValue, coverageAmountValue) : 0);
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

                <div>
                  <Label htmlFor="coverageAmount">Valor da Cobertura (R$)</Label>
                  <Input
                    id="coverageAmount"
                    type="number"
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(e.target.value)}
                    placeholder="50000"
                    min="10000"
                    max="1000000"
                    step="1000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor mínimo: R$ 10.000 | Valor máximo: R$ 1.000.000
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Coberturas Disponíveis</Label>
                  <div className="space-y-4">
                    {coverages.map((coverage) => {
                      const Icon = coverage.icon;
                      const isSelected = selectedCoverages.includes(coverage.id);
                      const price = calculatePrice(coverage.basePrice, ageValue, coverageAmountValue);
                      
                      return (
                        <div key={coverage.id} className="flex items-start space-x-3 p-3 border rounded-lg">
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
                              {coverage.required && (
                                <Badge variant="secondary" className="text-xs">Obrigatória</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{coverage.description}</p>
                            <p className="text-sm font-semibold text-primary">
                              R$ {price.toFixed(2)}/mês
                            </p>
                          </div>
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
                              const price = calculatePrice(coverage.basePrice, ageValue, coverageAmountValue);
                              
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