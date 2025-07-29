import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

const combinaquiPlans = [
  {
    id: "essencial",
    name: "Combinaqui Essencial",
    price: 49.90,
    services: [
      { name: "Conta Corrente", included: true, marketPrice: 25.00 },
      { name: "Cartão de Crédito", included: true, marketPrice: 15.90 },
      { name: "Pix Ilimitado", included: true, marketPrice: 0 },
      { name: "TED/DOC (5 grátis)", included: true, marketPrice: 12.50 },
      { name: "Cartão de Débito", included: true, marketPrice: 8.00 }
    ],
    highlight: false
  },
  {
    id: "completo",
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
    ],
    highlight: true
  },
  {
    id: "premium",
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
    ],
    highlight: false
  }
];

const Combinaqui = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Combinaqui
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Combine vários produtos financeiros em um só plano e economize mais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {combinaquiPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative group hover:shadow-xl transition-all duration-300 cursor-pointer ${
                plan.highlight ? 'border-primary border-2 scale-105' : 'hover:border-primary/20'
              }`}
              onClick={() => navigate(`/combinaqui/${plan.id}`)}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  R$ {plan.price.toFixed(2)}
                  <span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{service.name}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full mt-6"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/combinaqui/${plan.id}`);
                  }}
                >
                  Ver Comparativo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Combinaqui;