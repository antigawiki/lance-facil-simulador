import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import itauLogo from "@/assets/itau-logo.png";

interface ConsortiumData {
  type: string;
  cardValue: number;
  term: number;
  adminFee: number;
  reserveFundFee: number;
  insuranceValue: number;
  installmentValue: number;
  isContracted: boolean;
  paidInstallments: number;
}

interface BidData {
  ownCardType: "percentage" | "amount";
  ownCardValue: number;
  ownResourcesValue: number;
}

interface CalculationResult {
  totalBidValue: number;
  bidPercentage: number;
  remainingCardValue: number;
  optionReduceInstallment: {
    newInstallmentValue: number;
    sameTerm: number;
  };
  optionReduceTerm: {
    newTerm: number;
    sameInstallmentValue: number;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

const ConsortiumSimulator = () => {
  const navigate = useNavigate();
  
  const [consortium, setConsortium] = useState<ConsortiumData>({
    type: "",
    cardValue: 0,
    term: 0,
    adminFee: 0,
    reserveFundFee: 0,
    insuranceValue: 0,
    installmentValue: 0,
    isContracted: true,
    paidInstallments: 0,
  });

  const [bid, setBid] = useState<BidData>({
    ownCardType: "percentage",
    ownCardValue: 0,
    ownResourcesValue: 0,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const consortiumTypes = [
    { value: "moto", label: "Moto" },
    { value: "light_vehicle", label: "Veículos Leves" },
    { value: "heavy_vehicle", label: "Veículos Pesados" },
    { value: "real_estate", label: "Imóveis" },
  ];

  const calculateResults = () => {
    if (!consortium.cardValue || !consortium.term || !consortium.installmentValue) {
      return;
    }

    // Calcular valor do lance da própria carta
    let ownCardBidValue = 0;
    if (bid.ownCardType === "percentage") {
      ownCardBidValue = (consortium.cardValue * bid.ownCardValue) / 100;
    } else {
      ownCardBidValue = bid.ownCardValue;
    }

    // Valor total do lance
    const totalBidValue = ownCardBidValue + bid.ownResourcesValue;

    // Percentual do lance em relação à carta
    const bidPercentage = (totalBidValue / consortium.cardValue) * 100;

    // Valor restante da carta
    const remainingCardValue = consortium.cardValue - ownCardBidValue;

    // Calcular saldo devedor (carta + taxas)
    const debtBalance = consortium.cardValue * (1 + consortium.adminFee/100 + consortium.reserveFundFee/100);
    
    // Saldo devedor após o lance
    let remainingDebt = debtBalance - totalBidValue;
    
    // Se já contratado, considerar parcelas pagas
    let remainingTerm = consortium.term;
    if (consortium.isContracted && consortium.paidInstallments > 0) {
      const installmentWithoutInsurance = consortium.installmentValue - consortium.insuranceValue;
      const paidAmount = consortium.paidInstallments * installmentWithoutInsurance;
      remainingDebt = remainingDebt - paidAmount;
      remainingTerm = consortium.term - consortium.paidInstallments;
    }

    // Opção 1: Reduzir valor da parcela (mesmo prazo)
    const newInstallmentValue = (remainingDebt / remainingTerm) + consortium.insuranceValue;

    // Opção 2: Reduzir prazo (mesma parcela)
    const installmentWithoutInsurance = consortium.installmentValue - consortium.insuranceValue;
    let newTerm = Math.ceil(remainingDebt / installmentWithoutInsurance);
    let finalInstallmentValue = consortium.installmentValue;
    
    // Se o novo prazo for maior que o prazo restante, ajustar
    if (newTerm > remainingTerm) {
      newTerm = remainingTerm;
      finalInstallmentValue = (remainingDebt / remainingTerm) + consortium.insuranceValue;
    }

    setResult({
      totalBidValue,
      bidPercentage,
      remainingCardValue,
      optionReduceInstallment: {
        newInstallmentValue,
        sameTerm: remainingTerm,
      },
      optionReduceTerm: {
        newTerm,
        sameInstallmentValue: finalInstallmentValue,
      },
    });
  };

  useEffect(() => {
    calculateResults();
  }, [consortium, bid]);

  const isValidBid = () => {
    // Verificar se o valor da própria carta não excede 30%
    let ownCardPercentage = 0;
    if (bid.ownCardType === "percentage") {
      ownCardPercentage = bid.ownCardValue;
    } else {
      ownCardPercentage = (bid.ownCardValue / consortium.cardValue) * 100;
    }

    // Verificar se recursos próprios não excedem 95% da carta
    const ownResourcesPercentage = (bid.ownResourcesValue / consortium.cardValue) * 100;

    return ownCardPercentage <= 30 && ownResourcesPercentage <= 95;
  };

  const generatePDF = async () => {
    if (!result || !consortium.cardValue) return;

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

    const consortiumTypeName = consortiumTypes.find(t => t.value === consortium.type)?.label || consortium.type;
    
    pdfElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ff6600; padding-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
          <img src="${itauLogo}" alt="Itaú" style="height: 60px;" />
        </div>
        <h1 style="color: #ff6600; font-size: 28px; margin: 0; font-weight: bold;">Simulação de Lance - Consórcio</h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Relatório detalhado da simulação</p>
        <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h2 style="color: #ff6600; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #ff6600; padding-bottom: 5px;">Dados do Consórcio</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0; color: #333;"><strong>Tipo:</strong> ${consortiumTypeName}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Valor da Carta:</strong> ${formatCurrency(consortium.cardValue)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Prazo:</strong> ${consortium.term} meses</p>
            <p style="margin: 8px 0; color: #333;"><strong>Valor da Prestação:</strong> ${formatCurrency(consortium.installmentValue)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Taxa de Administração:</strong> ${consortium.adminFee}%</p>
            <p style="margin: 8px 0; color: #333;"><strong>Taxa do Fundo Reserva:</strong> ${consortium.reserveFundFee}%</p>
            <p style="margin: 8px 0; color: #333;"><strong>Valor do Seguro:</strong> ${formatCurrency(consortium.insuranceValue)}</p>
          </div>
        </div>

        <div>
          <h2 style="color: #0066cc; font-size: 20px; margin: 0 0 15px 0; border-bottom: 2px solid #0066cc; padding-bottom: 5px;">Configuração do Lance</h2>
          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px;">
            <p style="margin: 8px 0; color: #333;"><strong>Valor da Própria Carta:</strong> ${bid.ownCardType === 'percentage' ? `${bid.ownCardValue}%` : formatCurrency(bid.ownCardValue)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Recursos Próprios:</strong> ${formatCurrency(bid.ownResourcesValue)}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #ff6600; font-size: 22px; margin: 0 0 20px 0; text-align: center; border-bottom: 3px solid #ff6600; padding-bottom: 10px;">Resultados da Simulação</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div style="text-align: center; background: #fff5f0; padding: 20px; border-radius: 8px; border: 2px solid #ff6600;">
            <h3 style="color: #ff6600; font-size: 16px; margin: 0 0 10px 0;">Valor Total do Lance</h3>
            <p style="color: #333; font-size: 24px; font-weight: bold; margin: 0;">${formatCurrency(result.totalBidValue)}</p>
          </div>
          <div style="text-align: center; background: #f0f7ff; padding: 20px; border-radius: 8px; border: 2px solid #0066cc;">
            <h3 style="color: #0066cc; font-size: 16px; margin: 0 0 10px 0;">Percentual do Lance</h3>
            <p style="color: #333; font-size: 24px; font-weight: bold; margin: 0;">${formatPercentage(result.bidPercentage)}</p>
          </div>
          <div style="text-align: center; background: #f0fff4; padding: 20px; border-radius: 8px; border: 2px solid #28a745;">
            <h3 style="color: #28a745; font-size: 16px; margin: 0 0 10px 0;">Carta Restante</h3>
            <p style="color: #333; font-size: 24px; font-weight: bold; margin: 0;">${formatCurrency(result.remainingCardValue)}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: #fff5f0; padding: 20px; border-radius: 8px; border: 2px solid #ff6600;">
            <h3 style="color: #ff6600; font-size: 18px; margin: 0 0 15px 0;">🔻 Opção 1: Reduzir Parcela</h3>
            <p style="margin: 8px 0; color: #333;"><strong>Nova parcela:</strong> ${formatCurrency(result.optionReduceInstallment.newInstallmentValue)}</p>
            <p style="margin: 8px 0; color: #333;"><strong>Prazo:</strong> ${result.optionReduceInstallment.sameTerm} meses</p>
            <p style="margin: 15px 0 0 0; padding: 10px; background: #ffebe6; border-radius: 4px; color: #666; font-size: 14px;">
              <strong>Economia:</strong> ${formatCurrency(consortium.installmentValue - result.optionReduceInstallment.newInstallmentValue)} por mês
            </p>
          </div>

          <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border: 2px solid #0066cc;">
            <h3 style="color: #0066cc; font-size: 18px; margin: 0 0 15px 0;">⏰ Opção 2: Reduzir Prazo</h3>
            <p style="margin: 8px 0; color: #333;"><strong>Novo prazo:</strong> ${result.optionReduceTerm.newTerm} meses</p>
            <p style="margin: 8px 0; color: #333;"><strong>Parcela:</strong> ${formatCurrency(result.optionReduceTerm.sameInstallmentValue)}</p>
            <p style="margin: 15px 0 0 0; padding: 10px; background: #e6f3ff; border-radius: 4px; color: #666; font-size: 14px;">
              <strong>Redução:</strong> ${consortium.term - result.optionReduceTerm.newTerm} meses
            </p>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 12px; text-align: center;">
        <p style="margin: 0;">Este documento foi gerado pelo Simulador de Consórcio em ${new Date().toLocaleString('pt-BR')}</p>
        <p style="margin: 5px 0 0 0;"><strong>Importante:</strong> Esta simulação é apenas orientativa. Consulte sempre as condições específicas do seu contrato.</p>
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

      pdf.save(`simulacao-consorcio-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
    } finally {
      document.body.removeChild(pdfElement);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={itauLogo} alt="Itaú" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            Simulador de Lances de Consórcio
          </h1>
          <p className="text-muted-foreground text-lg">
            Simule diferentes cenários de lance para seu consórcio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuração do Consórcio */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configuração do Consórcio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Consórcio</Label>
                <Select value={consortium.type} onValueChange={(value) => setConsortium({ ...consortium, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border">
                    {consortiumTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-foreground">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paidInstallments">Quantidade de Parcelas Pagas</Label>
                <Input
                  id="paidInstallments"
                  type="number"
                  placeholder="0"
                  min="0"
                  max={consortium.term}
                  value={consortium.paidInstallments || ""}
                  onChange={(e) => setConsortium({ ...consortium, paidInstallments: Number(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardValue">Valor da Carta (R$)</Label>
                  <Input
                    id="cardValue"
                    type="number"
                    placeholder="100000"
                    value={consortium.cardValue || ""}
                    onChange={(e) => setConsortium({ ...consortium, cardValue: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">Prazo (meses)</Label>
                  <Input
                    id="term"
                    type="number"
                    placeholder="60"
                    value={consortium.term || ""}
                    onChange={(e) => setConsortium({ ...consortium, term: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminFee">Taxa de Administração (%)</Label>
                  <Input
                    id="adminFee"
                    type="number"
                    step="0.01"
                    placeholder="15.50"
                    value={consortium.adminFee || ""}
                    onChange={(e) => setConsortium({ ...consortium, adminFee: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reserveFundFee">Taxa do Fundo Reserva (%)</Label>
                  <Input
                    id="reserveFundFee"
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    value={consortium.reserveFundFee || ""}
                    onChange={(e) => setConsortium({ ...consortium, reserveFundFee: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceValue">Valor do Seguro (R$)</Label>
                  <Input
                    id="insuranceValue"
                    type="number"
                    placeholder="0"
                    value={consortium.insuranceValue || ""}
                    onChange={(e) => setConsortium({ ...consortium, insuranceValue: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installmentValue">Valor da Prestação (R$)</Label>
                  <Input
                    id="installmentValue"
                    type="number"
                    placeholder="2000"
                    value={consortium.installmentValue || ""}
                    onChange={(e) => setConsortium({ ...consortium, installmentValue: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuração do Lance */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary to-accent-light text-secondary-foreground">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Configuração do Lance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Valor da Própria Carta (máx. 30%)</Label>
                  <div className="flex gap-2">
                    <Select value={bid.ownCardType} onValueChange={(value: "percentage" | "amount") => setBid({ ...bid, ownCardType: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border">
                        <SelectItem value="percentage" className="text-foreground">%</SelectItem>
                        <SelectItem value="amount" className="text-foreground">R$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step={bid.ownCardType === "percentage" ? "0.01" : "1"}
                      max={bid.ownCardType === "percentage" ? "30" : consortium.cardValue * 0.3}
                      placeholder={bid.ownCardType === "percentage" ? "20" : "20000"}
                      value={bid.ownCardValue || ""}
                      onChange={(e) => setBid({ ...bid, ownCardValue: Number(e.target.value) })}
                    />
                  </div>
                  {bid.ownCardType === "percentage" && bid.ownCardValue > 30 && (
                    <p className="text-destructive text-sm">Máximo permitido: 30%</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownResourcesValue">Recursos Próprios (máx. 95% da carta)</Label>
                  <Input
                    id="ownResourcesValue"
                    type="number"
                    placeholder="30000"
                    max={consortium.cardValue * 0.95}
                    value={bid.ownResourcesValue || ""}
                    onChange={(e) => setBid({ ...bid, ownResourcesValue: Number(e.target.value) })}
                  />
                  {bid.ownResourcesValue > consortium.cardValue * 0.95 && (
                    <p className="text-destructive text-sm">Máximo permitido: {formatCurrency(consortium.cardValue * 0.95)}</p>
                  )}
                </div>
              </div>

              {!isValidBid() && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-destructive text-sm font-medium">
                    Verifique os limites: própria carta máx. 30%, recursos próprios máx. 95%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        {result && consortium.cardValue > 0 && isValidBid() && (
          <Card className="shadow-lg" id="consortium-results">
            <CardHeader className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Resultados da Simulação
                </div>
                <Button 
                  onClick={generatePDF}
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Valor Total do Lance</h3>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(result.totalBidValue)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Percentual do Lance</h3>
                  <p className="text-2xl font-bold text-accent">{formatPercentage(result.bidPercentage)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Carta Restante</h3>
                  <p className="text-2xl font-bold text-financial-gain">{formatCurrency(result.remainingCardValue)}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <TrendingDown className="h-5 w-5" />
                      Opção 1: Reduzir Parcela
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nova parcela:</span>
                      <span className="font-semibold text-primary">{formatCurrency(result.optionReduceInstallment.newInstallmentValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="font-semibold">{result.optionReduceInstallment.sameTerm} meses</span>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Redução de {formatCurrency(consortium.installmentValue - result.optionReduceInstallment.newInstallmentValue)} por mês
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-secondary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-secondary">
                      <TrendingDown className="h-5 w-5" />
                      Opção 2: Reduzir Prazo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Novo prazo:</span>
                      <span className="font-semibold text-secondary">{result.optionReduceTerm.newTerm} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parcela:</span>
                      <span className="font-semibold">{formatCurrency(result.optionReduceTerm.sameInstallmentValue)}</span>
                    </div>
                    <div className="p-3 bg-secondary/5 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Redução de {consortium.term - result.optionReduceTerm.newTerm} meses
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsortiumSimulator;