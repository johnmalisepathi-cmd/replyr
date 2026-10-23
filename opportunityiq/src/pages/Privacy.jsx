import { go } from "../lib/router.js";

export default function Privacy() {
  return (
    <main className="section max-w-3xl py-12">
      <button onClick={() => go("/")} className="text-sm text-slate-500 hover:text-slate-900">← Home</button>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Privacy & data sources</h1>
      <div className="mt-6 space-y-6 text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">What we collect on this website</h2>
          <p className="mt-2">
            If you submit the pilot form, we receive your name, work email, company, industry, region and any note you add.
            We use it only to contact you about the pilot. We don't sell it or share it for marketing.
          </p>
          <p className="mt-2">
            The interactive demo stores your sample profile and pipeline in your own browser (local storage). It is not sent to us.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Where opportunity data comes from</h2>
          <p className="mt-2">
            OpportunityIQ uses publicly published information, such as government tender portals, procurement notices, project
            pipelines and planning announcements, and links back to the original source. We only use private or paywalled
            sources where we have permission or a licence, and we respect each site's terms of use.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">AI limitations</h2>
          <p className="mt-2">
            AI summaries and fit scores help you decide where to look. They aren't professional advice. Always check the
            original tender documents before bidding. We never contact buyers or submit bids on your behalf, and we can't
            guarantee you will win work.
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
