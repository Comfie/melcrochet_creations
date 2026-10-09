/** Skeleton shown while a filtered or searched shop view streams in. */
export default function ProductsLoading() {
  return (
    <div className="bg-cream" role="status" aria-label="Loading products">
      <div className="shell pb-10 pt-14 sm:pt-20">
        <div className="h-3 w-32 animate-shimmer bg-sand" />
        <div className="mt-10 h-14 w-2/3 max-w-xl animate-shimmer bg-sand sm:h-20" />
      </div>
      <div className="border-y border-ink/10">
        <div className="shell flex gap-8 py-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-3 w-20 animate-shimmer bg-sand" />
          ))}
        </div>
      </div>
      <div className="shell grid grid-cols-2 gap-x-4 gap-y-12 pb-24 pt-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-shimmer bg-sand" style={{ animationDelay: `${i * 90}ms` }} />
            <div className="mt-4 h-5 w-3/4 animate-shimmer bg-sand" />
            <div className="mt-2 h-4 w-1/3 animate-shimmer bg-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
