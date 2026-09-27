import Link from "next/link";

const STEPS = [
  {
    title: "Tell us what you want",
    body:
      "Describe the piece in your own words, upload sketches, photos, or inspiration images, and pick a rough size, material, and budget.",
  },
  {
    title: "Get an AI-assisted brief",
    body:
      "Our AI turns your description into a structured spec — category, materials, dimensions, style — so nothing gets lost in translation.",
  },
  {
    title: "Review your quote",
    body:
      "We price it out (manufacturing, materials, labor, delivery) and send a quote you can approve or ask us to adjust.",
  },
  {
    title: "We manufacture & ship",
    body:
      "Once you approve and pay a deposit, we send your spec to our manufacturing partners in Vietnam and keep you posted with progress photos.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Custom furniture, built to your spec.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
          Describe the sofa, table, bed, or cabinet you actually want. We
          turn it into a manufacturable design, quote it, and build it
          through our vetted furniture manufacturers in Vietnam.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/design"
            className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Submit your design
          </Link>
          <Link
            href="/track"
            className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium hover:bg-neutral-50"
          >
            Track an existing order
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-8 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <div key={step.title} className="rounded-lg border border-neutral-200 p-6">
            <div className="text-sm font-medium text-neutral-400">
              Step {i + 1}
            </div>
            <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
