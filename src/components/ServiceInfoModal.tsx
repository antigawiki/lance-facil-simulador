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
    contact: "0800 722 4444",
    icon: <Shield className="w-6 h-6" />
  },
  "Assistência Residencial Clássica": {
    name: "Assistência Residencial Clássica",
    description: "Serviços de assistência residencial para emergências domésticas.",
    coverage: [
      "Chaveiro 24h (perda ou quebra de chaves)",
      "Eletricista para emergências",
      "Guarda da residência",
      "Limpeza pós-sinistro",
      "Serviços domésticos provisórios",
      "Orientações por telefone"
    ],
    limitations: [
      "Não inclui serviços de encanador",
      "Não inclui serviços de vidraceiro",
      "Não inclui mudança e guarda-móveis",
      "Material e peças não inclusos"
    ],
    availability: "24 horas para emergências",
    contact: "0800 722 4444",
    icon: <MapPin className="w-6 h-6" />
  },
  "Assistência Auto": {
    name: "Assistência Auto",
    description: "Socorro automotivo básico para situações de emergência com seu veículo.",
    coverage: [
      "Reboque por acidente ou pane",
      "Socorro por pane mecânica ou elétrica",
      "Envio de chaveiro automotivo",
      "Troca de pneus",
      "Socorro por pane seca (falta de combustível)",
      "Transmissão de mensagens urgentes"
    ],
    limitations: [
      "Reboque limitado conforme plano contratado",
      "Não inclui peças ou combustível",
      "Cobertura em território nacional",
      "Sem limite de acionamentos exceto táxi (5x) e lotação (2x)"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    contact: "0800 722 4444",
    icon: <Phone className="w-6 h-6" />
  },
  "Assistência Auto Premium": {
    name: "Assistência Auto Premium",
    description: "Socorro automotivo completo com serviços adicionais e cobertura estendida.",
    coverage: [
      "Reboque por acidente ou pane (até 500km)",
      "Socorro por pane mecânica ou elétrica",
      "Envio de chaveiro automotivo",
      "Troca de pneus",
      "Socorro por pane seca",
      "Transporte dos ocupantes (sem limite de despesa)",
      "Remoção para hospital (sem limite)",
      "Hospedagem para aguardar conserto (R$ 400/dia até 2 dias)",
      "Serviço de motorista profissional",
      "Localização e envio de peças",
      "Assistência residencial inclusa"
    ],
    limitations: [
      "Não inclui peças ou combustível",
      "Cobertura: Brasil, Paraguai, Argentina e Uruguai",
      "Sem limite de acionamentos exceto táxi (5x) e lotação (2x)"
    ],
    availability: "24 horas por dia, 7 dias por semana",
    contact: "0800 722 4444",
    icon: <Phone className="w-6 h-6" />
  },
  "Seguro Celular": {
    name: "Seguro Celular",
    description: "Proteção para seu smartphone contra roubo, furto e danos acidentais.",
    coverage: [
      "Roubo ou furto qualificado - Reposição por aparelho novo, igual ou similar",
      "Quebra acidental - Reparo ou reposição por aparelho igual ou similar",
      "Perda ou roubo de documentos - Reembolso até R$ 500 para segunda via"
    ],
    limitations: [
      "Quebra acidental: máximo 2 acionamentos a cada 12 meses",
      "Roubo ou furto: 1 acionamento a cada 12 meses",
      "Necessário comunicar outros seguros do mesmo celular",
      "Aparelho substituto pode ser de cor, modelo ou fabricante diferente"
    ],
    availability: "Atendimento de sinistros 24h",
    contact: "0800 722 4824",
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