import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

const combinaquiPlans = [
  // Combos de Proteção
  {
    id: "vida",
    name: "Combinaqui Vida",
    price: 16.00,
    category: "proteção",
    economy: "81%",
    services: [
      { name: "Assistência Residencial Clássica", included: true, marketPrice: 45.00 },
      { name: "Assistência de Saúde", included: true, marketPrice: 40.00 }
    ],
    highlight: false,
    availability: "Disponível para clientes Itaú"
  },
  {
    id: "tranquilidade",
    name: "Combinaqui Tranquilidade",
    price: 26.00,
    category: "proteção",
    economy: "81%",
    services: [
      { name: "Assistência de Saúde", included: true, marketPrice: 40.00 },
      { name: "Assistência Residencial Clássica", included: true, marketPrice: 45.00 },
      { name: "Assistência Auto", included: true, marketPrice: 52.00 }
    ],
    highlight: false,
    availability: "Disponível para clientes Itaú e Itaú Uniclass"
  },
  {
    id: "protecao",
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
    highlight: true,
    availability: "Disponível para clientes Itaú"
  },
  {
    id: "protecao2",
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
    highlight: false,
    availability: "Disponível para clientes Itaú e Itaú Uniclass"
  },
  {
    id: "protecao3",
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
    highlight: false,
    availability: "Disponível para clientes Itaú"
  },
  // Combos de Conexão
  {
    id: "conexao1",
    name: "Combinaqui Conexão I",
    price: 16.00,
    category: "conexão",
    economy: "50%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "500MB de Internet Extra", included: true, marketPrice: 12.00 }
    ],
    highlight: false,
    availability: "Disponível para clientes Itaú"
  },
  {
    id: "conexao2",
    name: "Combinaqui Conexão II",
    price: 37.00,
    category: "conexão",
    economy: "22%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "1GB de Internet Extra", included: true, marketPrice: 27.00 }
    ],
    highlight: false,
    availability: "Disponível para clientes Itaú"
  },
  {
    id: "conexao3",
    name: "Combinaqui Conexão III",
    price: 47.00,
    category: "conexão",
    economy: "57%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "1GB de Internet Extra", included: true, marketPrice: 27.00 },
      { name: "Seguro Celular", included: true, marketPrice: 25.00 }
    ],
    highlight: false,
    availability: "Disponível para clientes Itaú e Itaú Uniclass"
  },
  // Combo de Recompensa
  {
    id: "recompensa1",
    name: "Combinaqui Recompensa I",
    price: 37.00,
    category: "recompensa",
    economy: "43%",
    services: [
      { name: "Deezer Premium", included: true, marketPrice: 20.90 },
      { name: "5% de Cashback nas contas de consumo", included: true, marketPrice: 45.00 }
    ],
    highlight: false,
    availability: "Disponível para clientes Itaú e Itaú Uniclass"
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
            Combos de benefícios exclusivos com economia de até 82% em relação ao valor individual dos serviços
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {combinaquiPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative group hover:shadow-xl transition-all duration-300 cursor-pointer border ${
                plan.highlight ? 'border-primary border-2 scale-105' : 'hover:border-primary/20 border-border'
              }`}
              onClick={() => navigate(`/combinaqui/${plan.id}`)}
            >
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Recomendado
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">
                  {plan.category} • {plan.economy} de economia
                </div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">
                  R$ {plan.price.toFixed(2)}
                  <span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {plan.availability}
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