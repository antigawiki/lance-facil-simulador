import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Phone, MapPin, Shield } from "lucide-react";

interface ServiceInfo {
  name: string;
  description: string;
  coverage: string[];
  limitations?: string[];
  availability: string;
  contact?: string;
  icon: React.ReactNode;
}

const servicesInfo: Record<string, ServiceInfo> = {
  "Assistência de Saúde": {
    name: "Assistência de Saúde (Programa TEM Saúde)",
    description: "Serviços de saúde preventiva com possibilidade de incluir até 3 beneficiários.",
    coverage: [
      "Check-up médico com clínico geral ou ginecologista",
      "Exames conforme plano contratado",
      "Consulta de retorno em até 30 dias",
      "Até 30% de desconto em medicamentos nas farmácias credenciadas",
      "Plataforma de bem-estar com + de 5.000 conteúdos em vídeo",
      "Rede de academias modelo pay-per-use",
      "Assistente digital",
      "Cobertura em território nacional"
    ],
    limitations: [
      "Agendamento em até 48h úteis",
      "Até 3 reagendamentos por período",
      "Não inclui exames adicionais para diagnóstico complementar",
      "Não inclui continuidade de tratamento médico",
      "Retorno limitado a 30 dias da primeira consulta"
    ],
    availability: "Segunda à sexta das 7h às 19h, exceto feriados",
    contact: "4000-1640 (capitais) ou 0800-836-8836 (demais localidades)",
    icon: <Shield className="w-6 h-6" />
  },
  "Assistência Residencial Clássica": {
    name: "Assistência Residencial Clássica",
    description: "Serviços para reparos emergenciais residenciais oferecidos pela Tempo Assistência.",
    coverage: [
      "Reparos emergenciais elétricos",
      "Reparos emergenciais hidráulicos", 
      "Desentupimento",
      "Chaveiro"
    ],
    limitations: [
      "Limitação global de 1 intervenção por mês",
      "Independente do serviço solicitado",
      "Agendamento conforme disponibilidade em até 24h após adesão"
    ],
    availability: "Agendamento em até 24h após adesão",
    contact: "0800 704 3837",
    icon: <MapPin className="w-6 h-6" />
  },
  "Assistência Residencial Premium": {
    name: "Assistência Residencial Premium", 
    description: "Serviços completos para reparos emergenciais residenciais oferecidos pela Tempo Assistência.",
    coverage: [
      "Reparos emergenciais elétricos",
      "Reparos emergenciais hidráulicos",
      "Desentupimento", 
      "Chaveiro",
      "Conserto de eletrodomésticos",
      "Assistência à informática"
    ],
    limitations: [
      "Limitação global de 1 intervenção por mês",
      "Independente do serviço solicitado",
      "Carência de 48h para assistência de informática",
      "Agendamento conforme disponibilidade em até 24h após adesão"
    ],
    availability: "Agendamento em até 24h após adesão", 
    contact: "0800 704 3837",
    icon: <MapPin className="w-6 h-6" />
  },
  "Assistência Auto": {
    name: "Assistência Auto (S.O.S Auto)",
    description: "Serviços de assistência emergencial veicular oferecidos pela Porto Seguro.",
    coverage: [
      "Mecânico emergencial (carga de bateria, troca de pneu)",
      "Guincho para utilizar mensalmente"
    ],
    limitations: [
      "1 acionamento por mês",
      "Acionamento e veículo devem estar em seu nome",
      "Exceto para Leva e Traz, balanceamento e alinhamento"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    contact: "3003-3951 (capitais) ou 0800-703-3451 (demais localidades)",
    icon: <Phone className="w-6 h-6" />
  },
  "Assistência Auto Premium": {
    name: "Assistência Auto Premium (S.O.S Auto Premium)",
    description: "Serviços completos de assistência emergencial veicular oferecidos pela Porto Seguro.",
    coverage: [
      "Mecânico emergencial",
      "Guincho (até 50km para motos, 100km para carros)",
      "Chaveiro",
      "Leva e traz",
      "Translado"
    ],
    limitations: [
      "1 acionamento por mês",
      "Acionamento e veículo devem estar em seu nome",
      "Exceto para Leva e Traz, balanceamento e alinhamento",
      "Combinação de serviços caso necessário"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    contact: "3003-3951 (capitais) ou 0800-703-3451 (demais localidades)",
    icon: <Phone className="w-6 h-6" />
  },
  "Seguro Celular": {
    name: "Seguro Celular",
    description: "Proteção contra roubo ou furto qualificado oferecido pela Chubb Seguros.",
    coverage: [
      "Reposição por aparelho igual ou similar (novo ou recondicionado)",
      "Cobertura para roubo ou furto qualificado",
      "Aparelhos de até R$ 15.000 e 4 anos de fabricação",
      "Marcas: Apple, Asus, Samsung, Motorola, LG, Huawei, Xiaomi",
      "Vigência de 12 meses com renovação automática"
    ],
    limitations: [
      "Franquia de R$ 400,00",
      "1 evento a cada 12 meses",
      "Não válido para modelos Flip ou Folder",
      "Comunicar troca de aparelho imediatamente",
      "Indenização em até 30 dias"
    ],
    availability: "Atendimento 24h, 7 dias por semana",
    contact: "0800 000 0671",
    icon: <Shield className="w-6 h-6" />
  },
  "10 dias sem juros no cheque especial": {
    name: "10 dias sem juros no limite da conta",
    description: "Benefício que permite usar o limite da conta sem juros por 10 dias corridos.",
    coverage: [
      "10 dias corridos sem juros por mês",
      "Renovação automática mensal",
      "Uso em dias corridos ou alternados",
      "Contagem considera sábados, domingos e feriados",
      "Disponível em até 24h após contratação"
    ],
    limitations: [
      "Limitado à conta corrente vinculada ao Combinaqui",
      "Após 10 dias, juros + IOF sobre dias utilizados",
      "IOF não está isento (imposto federal)",
      "Não cumulativo com outros benefícios similares",
      "Sujeito a análise de crédito"
    ],
    availability: "Renovação automática mensal",
    contact: "4004-4828 (capitais) ou 0800-970-4828 (demais localidades)",
    icon: <Clock className="w-6 h-6" />
  },
  "500MB de Internet Extra": {
    name: "500MB de Internet Extra (Bônus Internet)",
    description: "Concessão de 500MB de internet para operadoras Vivo, Claro e Tim.",
    coverage: [
      "500MB de dados móveis",
      "Válido para Vivo (exceto Vivo Easy), Claro e Tim",
      "Planos pré-pago, pós-pago e Controle",
      "Validade de 30 dias",
      "Velocidade 4G até 5 Mbps download e 500 Kbps upload"
    ],
    limitations: [
      "Não conveniado: Nextel e OI",
      "Não acumula para o mês seguinte", 
      "Consumido junto com outros bônus (Vivo/Tim)",
      "Concedido antes da franquia (Claro)",
      "Linha deve estar ativa conforme regra da operadora"
    ],
    availability: "Concessão mensal automática",
    icon: <Phone className="w-6 h-6" />
  },
  "1GB de Internet Extra": {
    name: "1GB de Internet Extra (Bônus Internet)",
    description: "Concessão de 1GB de internet para operadoras Vivo, Claro e Tim.",
    coverage: [
      "1GB de dados móveis", 
      "Válido para Vivo (exceto Vivo Easy), Claro e Tim",
      "Planos pré-pago, pós-pago e Controle",
      "Validade de 30 dias",
      "Velocidade 4G até 5 Mbps download e 500 Kbps upload"
    ],
    limitations: [
      "Não conveniado: Nextel e OI",
      "Não acumula para o mês seguinte",
      "Consumido junto com outros bônus (Vivo/Tim)", 
      "Concedido antes da franquia (Claro)",
      "Linha deve estar ativa conforme regra da operadora"
    ],
    availability: "Concessão mensal automática",
    icon: <Phone className="w-6 h-6" />
  },
  "5% de Cashback nas contas de consumo": {
    name: "5% de Cashback nas contas de consumo",
    description: "Retorno de 5% do valor pago em contas de consumo cadastradas em débito automático.",
    coverage: [
      "5% sobre contas de luz, água, gás, internet e TV a cabo",
      "Contas em débito automático e efetivamente pagas",
      "Crédito até o 7º dia útil do mês subsequente",
      "Válido apenas para contas cadastradas após adesão ao Combinaqui"
    ],
    limitations: [
      "Máximo de R$ 100,00 por mês",
      "Conta deve estar ativa sem restrições",
      "Não concedido em caso de inadimplência",
      "Cancelamento do Combinaqui cancela o benefício"
    ],
    availability: "Crédito automático mensal",
    icon: <Check className="w-6 h-6" />
  }
};

interface ServiceInfoModalProps {
  serviceName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceInfoModal = ({ serviceName, isOpen, onClose }: ServiceInfoModalProps) => {
  if (!serviceName || !servicesInfo[serviceName]) return null;

  const service = servicesInfo[serviceName];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {service.icon}
            {service.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {service.description}
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                O que está incluído:
              </h4>
              <ul className="space-y-2">
                {service.coverage.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {service.limitations && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <X className="w-5 h-5 text-orange-500" />
                  Limitações e restrições:
                </h4>
                <ul className="space-y-2">
                  {service.limitations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="font-medium">Disponibilidade:</span>
                <span className="text-sm">{service.availability}</span>
              </div>
              
              {service.contact && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="font-medium">Contato:</span>
                  <Badge variant="outline">{service.contact}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceInfoModal;