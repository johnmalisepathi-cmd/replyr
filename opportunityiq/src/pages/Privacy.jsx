import { go } from "../lib/router.js";

export default function Privacy() {
  return (
    <main className="section max-w-3xl py-12">
      <button onClick={() => go("/")} className="text-sm text-slate-500 hover:text-slate-900">← Home</button>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Privacy & how it works</h1>
      <div className="mt-6 space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">What we collect on this website</h2>
          <p className="mt-2">
            If you join early access, we receive your first name, email, where you live, the first goal you'd like watched and any
            note you add. We use it only to contact you about early access. We don't sell it or share it for marketing.
          </p>
          <p className="mt-2">
            The demo keeps your goals and plan in your own browser (local storage). They are not sent to us. When you use the AI
            features, your words and goals are sent to the AI service to produce the answer.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Where suggestions come from</h2>
          <p className="mt-2">
            At launch, OpportunityIQ will use licensed travel, retail, property and restaurant data, plus official sources for things
            like interest rates and grants, and will link back to each source. The demo uses fictional sample data.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">AI limitations</h2>
          <p className="mt-2">
            AI suggestions help you decide where to look. They aren't professional, financial or legal advice. Check prices, terms
            and availability with the provider before you book or buy. OpportunityIQ never books, buys or pays on your behalf.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
          <p className="mt-2">
            You can ask us to access, correct or delete your details at any time by replying to any email from us. We handle
            personal information in line with the Australian Privacy Principles.
          </p>
        </section>
        <p className="text-sm text-slate-500">This is a pre-launch summary and will be replaced by a full privacy policy before paid plans open.</p>
      </div>
    </main>
  );
}
