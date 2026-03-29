import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CasinoPage from "@/pages/casino";
import AuthPage from "@/pages/auth";
import WalletPage from "@/pages/wallet";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import SportsbookPage from "@/pages/sportsbook";
import NFTPage from "@/pages/nft";
import VIPPage from "@/pages/vip";
import { lazy, Suspense } from "react";
import KenoGame from "@/pages/games/keno";
import RouletteGame from "@/pages/games/roulette";
import MinesGame from "@/pages/games/mines";
import TowerGame from "@/pages/games/tower";
import CrashGame from "@/pages/games/crash";
import HiLowGame from "@/pages/games/hilow";
import HelmGame from "@/pages/games/helm";
import BlackjackGame from "@/pages/games/blackjack";
import SlotsGame from "@/pages/games/slots";
import PlinkoGame from "@/pages/games/plinko";
import AboutPage from "@/pages/about";
import AffiliatePage from "@/pages/affiliate";
import ResponsibleGamingPage from "@/pages/responsible-gaming";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import ProvablyFairPage from "@/pages/provably-fair";

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/casino" component={CasinoPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/sportsbook" component={SportsbookPage} />
        <Route path="/nft" component={NFTPage} />
        <Route path="/vip" component={VIPPage} />
        <Route path="/games/keno" component={KenoGame} />
        <Route path="/games/roulette" component={RouletteGame} />
        <Route path="/games/mines" component={MinesGame} />
        <Route path="/games/tower" component={TowerGame} />
        <Route path="/games/crash" component={CrashGame} />
        <Route path="/games/hilow" component={HiLowGame} />
        <Route path="/games/helm" component={HelmGame} />
        <Route path="/games/blackjack" component={BlackjackGame} />
        <Route path="/games/slots" component={SlotsGame} />
        <Route path="/games/plinko" component={PlinkoGame} />
        <Route path="/about" component={AboutPage} />
        <Route path="/affiliate" component={AffiliatePage} />
        <Route path="/responsible-gaming" component={ResponsibleGamingPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/provably-fair" component={ProvablyFairPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
