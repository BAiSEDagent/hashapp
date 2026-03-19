import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { WalletGate } from "@/components/WalletGate";
import { DemoProvider } from "@/context/DemoContext";
import { walletConfig } from "@/config/wallet";

import Money from "@/pages/Money";
import Activity from "@/pages/Activity";
import Receipt from "@/pages/Receipt";
import Rules from "@/pages/Rules";
import Agent from "@/pages/Agent";
import DeFi from "@/pages/DeFi";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <WalletGate>
      <MobileLayout>
        <Switch>
          <Route path="/" component={Money} />
          <Route path="/money">{() => <Redirect to="/" />}</Route>
          <Route path="/activity" component={Activity} />
          <Route path="/receipt/:id" component={Receipt} />
          <Route path="/rules" component={Rules} />
          <Route path="/agent" component={Agent} />
          <Route path="/defi" component={DeFi} />
          <Route component={NotFound} />
        </Switch>
      </MobileLayout>
    </WalletGate>
  );
}

function App() {
  return (
    <WagmiProvider config={walletConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DemoProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </DemoProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
