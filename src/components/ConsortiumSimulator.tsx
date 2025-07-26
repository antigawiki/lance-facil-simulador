import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface ConsortiumData {
  type: string;
  cardValue: number;
  term: number;
  adminFee: number;
  reserveFundFee: number;
  insuranceValue: number;
  installmentValue: number;
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
  const [consortium, setConsortium] = useState<ConsortiumData>({
    type: "",
    cardValue: 0,
    term: 0,
    adminFee: 0,
    reserveFundFee: 0,
    insuranceValue: 0,
    installmentValue: 0,
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

    // Saldo devedor após o lance
    const remainingDebt = consortium.cardValue - totalBidValue;

    // Opção 1: Reduzir valor da parcela (mesmo prazo)
    const newInstallmentValue = remainingDebt / consortium.term;

    // Opção 2: Reduzir prazo (mesma parcela)
    const newTerm = Math.ceil(remainingDebt / consortium.installmentValue);

    setResult({
      totalBidValue,
      bidPercentage,
      remainingCardValue,
      optionReduceInstallment: {
        newInstallmentValue,
        sameTerm: consortium.term,
      },
      optionReduceTerm: {
        newTerm,
        sameInstallmentValue: consortium.installmentValue,
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
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
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <CardHeader className="bg-gradient-to-r from-accent to-accent-light text-accent-foreground">
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
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="amount">R$</SelectItem>
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
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resultados da Simulação
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

                <Card className="border-2 border-accent/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <TrendingDown className="h-5 w-5" />
                      Opção 2: Reduzir Prazo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Novo prazo:</span>
                      <span className="font-semibold text-accent">{result.optionReduceTerm.newTerm} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parcela:</span>
                      <span className="font-semibold">{formatCurrency(result.optionReduceTerm.sameInstallmentValue)}</span>
                    </div>
                    <div className="p-3 bg-accent/5 rounded-md">
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