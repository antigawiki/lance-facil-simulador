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
    name: "Assistência de Saúde",
    description: "Serviço de assistência médica e orientação de saúde 24 horas por dia, 7 dias por semana.",
    coverage: [
      "Orientação médica por telefone 24h",
      "Indicação de médicos e hospitais",
      "Agendamento de consultas",
      "Segunda opinião médica",
      "Orientação sobre medicamentos",
      "Primeiros socorros por telefone",
      "Informações sobre exames médicos",
      "Orientação nutricional básica"
    ],
    limitations: [
      "Não substitui consulta médica presencial",
      "Não inclui custos de consultas ou exames",
      "Limitado a orientações e informações"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    contact: "0800 702 5050",
    icon: <Shield className="w-6 h-6" />
  },
  "Assistência Residencial Clássica": {
    name: "Assistência Residencial Clássica",
    description: "Serviços de emergência residencial para resolver problemas domésticos básicos.",
    coverage: [
      "Chaveiro 24h (perda ou quebra de chaves)",
      "Eletricista para emergências",
      "Encanador para vazamentos",
      "Vidraceiro para vidros quebrados",
      "Desentupimento de pias e vasos",
      "Serviços de limpeza pós-sinistro",
      "Orientações por telefone"
    ],
    limitations: [
      "Limitado a 4 acionamentos por ano",
      "Franquia de até R$ 150 por serviço",
      "Não inclui material ou peças",
      "Apenas emergências residenciais"
    ],
    availability: "24 horas para emergências, horário comercial para demais serviços",
    contact: "0800 702 5050",
    icon: <MapPin className="w-6 h-6" />
  },
  "Assistência Auto": {
    name: "Assistência Auto",
    description: "Socorro automotivo para situações de emergência com seu veículo.",
    coverage: [
      "Guincho para reboque (até 100km)",
      "Socorro por pane seca",
      "Troca de pneu furado",
      "Chaveiro automotivo",
      "Socorro por pane elétrica básica",
      "Orientações por telefone"
    ],
    limitations: [
      "Limitado a 6 acionamentos por ano",
      "Não inclui peças ou combustível",
      "Veículos até 10 anos de fabricação",
      "Cobertura em território nacional"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    contact: "0800 702 5050",
    icon: <Phone className="w-6 h-6" />
  },
  "Assistência Auto Premium": {
    name: "Assistência Auto Premium",
    description: "Socorro automotivo completo com serviços adicionais e maior cobertura.",
    coverage: [
      "Guincho para reboque (até 200km)",
      "Socorro por pane seca",
      "Troca de pneu furado",
      "Chaveiro automotivo",
      "Socorro por pane elétrica e mecânica",
      "Carro reserva (até 3 dias)",
      "Hospedagem em caso de viagem",
      "Motorista substituto",
      "Orientações por telefone"
    ],
    limitations: [
      "Limitado a 10 acionamentos por ano",
      "Não inclui peças ou combustível",
      "Veículos até 15 anos de fabricação",
      "Cobertura em território nacional"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    contact: "0800 702 5050",
    icon: <Phone className="w-6 h-6" />
  },
  "Seguro Celular": {
    name: "Seguro Celular",
    description: "Proteção para seu smartphone contra danos acidentais, roubo e furto.",
    coverage: [
      "Cobertura contra danos acidentais",
      "Proteção contra roubo e furto",
      "Reposição por aparelho similar",
      "Cobertura para acessórios originais",
      "Atendimento 24h para sinistros"
    ],
    limitations: [
      "Aparelhos com até 2 anos de uso",
      "Franquia de 10% do valor do aparelho",
      "Máximo 2 sinistros por ano",
      "Não cobre danos por uso inadequado"
    ],
    availability: "Atendimento de sinistros 24h",
    contact: "0800 702 5050",
    icon: <Shield className="w-6 h-6" />
  },
  "10 dias sem juros no cheque especial": {
    name: "10 dias sem juros no cheque especial",
    description: "Benefício bancário que permite usar o cheque especial sem cobrança de juros por 10 dias.",
    coverage: [
      "10 dias corridos sem juros",
      "Válido para todo limite disponível",
      "Renovação automática mensal",
      "Sem necessidade de solicitação"
    ],
    limitations: [
      "Válido apenas para clientes Itaú",
      "Limitado a 10 dias por mês",
      "Após o período, juros normais se aplicam",
      "Não acumula dias não utilizados"
    ],
    availability: "Disponível mensalmente",
    icon: <Clock className="w-6 h-6" />
  },
  "Deezer Premium": {
    name: "Deezer Premium",
    description: "Streaming de música premium com acesso ilimitado e sem anúncios.",
    coverage: [
      "Mais de 90 milhões de músicas",
      "Reprodução offline",
      "Qualidade de áudio Hi-Fi",
      "Sem anúncios",
      "Playlists personalizadas",
      "Letras das músicas",
      "Acesso simultâneo em múltiplos dispositivos"
    ],
    limitations: [
      "Restrito a 1 conta por titular",
      "Não pode ser compartilhado",
      "Cancelamento junto com o Combinaqui"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    icon: <Shield className="w-6 h-6" />
  },
  "500MB de Internet Extra": {
    name: "500MB de Internet Extra",
    description: "Pacote adicional de dados móveis para seu plano de celular.",
    coverage: [
      "500MB de dados móveis",
      "Válido para qualquer operadora",
      "Recarga automática mensal",
      "Notificação de uso"
    ],
    limitations: [
      "Válido apenas para uma linha",
      "Não acumula com mês seguinte",
      "Sujeito à disponibilidade da operadora"
    ],
    availability: "Recarga automática mensal",
    icon: <Phone className="w-6 h-6" />
  },
  "1GB de Internet Extra": {
    name: "1GB de Internet Extra",
    description: "Pacote adicional de dados móveis para seu plano de celular.",
    coverage: [
      "1GB de dados móveis",
      "Válido para qualquer operadora",
      "Recarga automática mensal",
      "Notificação de uso"
    ],
    limitations: [
      "Válido apenas para uma linha",
      "Não acumula com mês seguinte",
      "Sujeito à disponibilidade da operadora"
    ],
    availability: "Recarga automática mensal",
    icon: <Phone className="w-6 h-6" />
  },
  "5% de Cashback nas contas de consumo": {
    name: "5% de Cashback nas contas de consumo",
    description: "Retorno de 5% do valor pago em contas de consumo em débito automático.",
    coverage: [
      "5% de cashback em contas de luz",
      "5% de cashback em contas de água",
      "5% de cashback em contas de gás",
      "5% de cashback em telefone/internet",
      "Crédito automático na conta corrente"
    ],
    limitations: [
      "Apenas contas em débito automático",
      "Máximo de R$ 50 de cashback por mês",
      "Não válido para financiamentos",
      "Sujeito a regulamentação específica"
    ],
    availability: "Crédito mensal automático",
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