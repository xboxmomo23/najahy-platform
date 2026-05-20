export function createPlaceholderPage(title: string, description?: string) {
  return function PlaceholderPage() {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="font-display text-2xl font-semibold text-emerald-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-muted sm:text-base">{description}</p>
        ) : (
          <p className="mt-2 text-sm text-muted">Page en construction.</p>
        )}
      </div>
    );
  };
}
