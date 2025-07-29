import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SimuladorConsorcio from "./pages/SimuladorConsorcio";
import Combinaqui from "./pages/Combinaqui";
import CombinaquiComparison from "./pages/CombinaquiComparison";
import Seguros from "./pages/Seguros";
import Capitalizacao from "./pages/Capitalizacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/simulador-consorcio" element={<SimuladorConsorcio />} />
          <Route path="/combinaqui" element={<Combinaqui />} />
          <Route path="/combinaqui/:id" element={<CombinaquiComparison />} />
          <Route path="/seguros" element={<Seguros />} />
          <Route path="/capitalizacao" element={<Capitalizacao />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
