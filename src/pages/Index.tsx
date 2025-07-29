import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Handshake, Shield, TrendingUp } from "lucide-react";
import itauLogo from "@/assets/itau-logo.png";

const products = [
  {
    title: "Simulador de Consórcio",
    description: "Simule seu consórcio e encontre a melhor opção",
    icon: Calculator,
    href: "/simulador-consorcio",
    color: "text-blue-600"
  },
  {
    title: "Combinaqui",
    description: "Combine produtos financeiros ideais para você",
    icon: Handshake,
    href: "/combinaqui", 
    color: "text-green-600"
  },
  {
    title: "Seguros",
    description: "Proteja o que é importante para você",
    icon: Shield,
    href: "/seguros",
    color: "text-purple-600"
  },
  {
    title: "Capitalização",
    description: "Invista e concorra a prêmios",
    icon: TrendingUp,
    href: "/capitalizacao",
    color: "text-orange-600"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src={itauLogo} 
              alt="Itaú Logo" 
              className="h-20 mx-auto mb-4"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            Bem Vindo Ituber
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore nossas ferramentas e faça seu gera decolar!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {products.map((product) => (
            <Card 
              key={product.title}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => window.location.href = product.href}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <product.icon 
                    className={`w-12 h-12 mx-auto ${product.color} group-hover:scale-110 transition-transform duration-300`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {product.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
