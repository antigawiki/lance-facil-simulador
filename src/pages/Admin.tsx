import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, MailOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import itauLogo from "@/assets/itau-logo.png";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

const Admin = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: "Houve um problema ao carregar as mensagens.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, currentReadStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: !currentReadStatus })
        .eq('id', id);

      if (error) throw error;

      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, read: !currentReadStatus } : msg
      ));

      toast({
        title: currentReadStatus ? "Marcado como não lido" : "Marcado como lido",
        description: "Status da mensagem atualizado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Houve um problema ao atualizar o status da mensagem.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Carregando mensagens...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src={itauLogo} alt="Itaú" className="h-8" />
            <h1 className="text-3xl font-bold text-foreground">Administração - Mensagens</h1>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{messages.length}</div>
              <p className="text-muted-foreground">Total de mensagens</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{messages.filter(m => !m.read).length}</div>
              <p className="text-muted-foreground">Não lidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{messages.filter(m => m.read).length}</div>
              <p className="text-muted-foreground">Lidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhuma mensagem encontrada.</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={`${!message.read ? 'border-primary' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {message.subject}
                        {!message.read && <Badge variant="default">Nova</Badge>}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        <strong>{message.name}</strong> • {message.email} • {formatDate(message.created_at)}
                      </div>
                    </div>
                    <Button
                      onClick={() => markAsRead(message.id, message.read)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {message.read ? (
                        <>
                          <Mail className="h-4 w-4" />
                          Marcar como não lido
                        </>
                      ) : (
                        <>
                          <MailOpen className="h-4 w-4" />
                          Marcar como lido
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;