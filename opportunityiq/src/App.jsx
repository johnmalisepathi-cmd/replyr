import { useEffect } from "react";
import { go, useRoute } from "./lib/router.js";
import { useAppState } from "./lib/store.js";
import { Footer, Nav, SampleBanner } from "./components/ui.jsx";
import Home from "./pages/Home.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Opportunity from "./pages/Opportunity.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Privacy from "./pages/Privacy.jsx";

const NEEDS_PROFILE = ["/dashboard", "/pipeline", "/opportunity"];

export default function App() {
  const route = useRoute();
  const { profile, setProfile, pipeline, setStage } = useAppState();
  const blocked = !profile && NEEDS_PROFILE.some((p) => route.startsWith(p));

  // App screens need a capability profile — send first-time visitors to set one up.
  useEffect(() => {
    if (blocked) go("/onboarding");
  }, [blocked]);

  let page;
  if (blocked) page = null;
  else if (route === "/onboarding") page = <Onboarding profile={profile} setProfile={setProfile} />;
  else if (route === "/dashboard") page = <Dashboard profile={profile} pipeline={pipeline} />;
  else if (route === "/pipeline") page = <Pipeline profile={profile} pipeline={pipeline} setStage={setStage} />;
  else if (route.startsWith("/opportunity/"))
    page = <Opportunity id={route.split("/")[2]} profile={profile} pipeline={pipeline} setStage={setStage} />;
  else if (route === "/privacy") page = <Privacy />;
  else page = <Home hasProfile={!!profile} />;

  const inApp = route !== "/" && route !== "/privacy";

  return (
    <div className="flex min-h-screen flex-col">
      <Nav route={route} hasProfile={!!profile} />
      {inApp && <SampleBanner />}
      <div className="flex-1">{page}</div>
      <Footer />
    </div>
  );
}
