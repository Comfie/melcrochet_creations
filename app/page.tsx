export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl mb-6">MelCrochet — token check</h1>
      <div className="flex gap-3 flex-wrap">
        <span className="px-4 py-2 bg-ink text-cream">ink</span>
        <span className="px-4 py-2 bg-gold text-ink">gold</span>
        <span className="px-4 py-2 bg-cream text-ink border border-taupe">cream</span>
        <span className="px-4 py-2 bg-taupe text-cream">taupe</span>
        <span className="px-4 py-2 bg-brown text-cream">brown</span>
      </div>
    </main>
  );
}
