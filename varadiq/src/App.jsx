import { useEffect } from "react";
import { go, useRoute } from "./lib/router.js";
import { useAppState } from "./lib/store.js";
import { setCurrentLocale } from "./lib/locale.js";
import { Footer, Nav, SampleBanner } from "./components/ui.jsx";
import Home from "./pages/Home.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Goal from "./pages/Goal.jsx";
import Pipeline from "./pages/Pipeline.jsx";
import Privacy from "./pages/Privacy.jsx";
import Account from "./pages/Account.jsx";

const NEEDS_PROFILE = ["/dashboard", "/pipeline", "/goal"];

export default function App() {
  const route = useRoute();
  const { profile, setProfile, pipeline, setStage, progress, goalActions, user, sync, signOut, authReady } = useAppState();
  // Signed in on a new device: wait for the account's goals before deciding where to go.
  const waiting = !authReady || (!!user && (sync === "idle" || sync === "loading"));
  const blocked = !waiting && !profile && NEEDS_PROFILE.some((p) => route.startsWith(p));
  setCurrentLocale(profile);

  // App screens need goals — send first-time visitors to add some.
  useEffect(() => {
    if (blocked) go("/onboarding");
  }, [blocked]);

  let page;
  if (blocked) page = null;
  else if (waiting && route !== "/" && route !== "/privacy" && route !== "/account")
    page = <main className="section py-16 text-center text-slate-500" role="status">Loading your goals…</main>;
  else if (route === "/onboarding") page = <Onboarding profile={profile} setProfile={setProfile} />;
  else if (route === "/dashboard") page = <Dashboard user={user} profile={profile} setProfile={setProfile} pipeline={pipeline} progress={progress} goalActions={goalActions} />;
  else if (route === "/pipeline") page = <Pipeline profile={profile} pipeline={pipeline} setStage={setStage} />;
  else if (route.startsWith("/goal/"))
    page = <Goal key={route} id={route.split("/")[2]} profile={profile} setProfile={setProfile} pipeline={pipeline} setStage={setStage} progress={progress} goalActions={goalActions} user={user} />;
  else if (route === "/privacy") page = <Privacy />;
  else if (route === "/account") page = <Account user={user} sync={sync} signOut={signOut} />;
  else page = <Home hasProfile={!!profile} setProfile={setProfile} />;

  const inApp = route !== "/" && route !== "/privacy";

  return (
    <div className="flex min-h-screen flex-col">
      <Nav route={route} hasProfile={!!profile} user={user} />
      {inApp && <SampleBanner />}
      <div className={`flex-1 ${route === "/" || route === "" ? "bg-navy-950 pb-16" : "pb-20"}`}>{page}</div>
      <Footer />
    </div>
  );
}
