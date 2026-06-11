/** Generic placeholder for routes not yet implemented */
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <p className="mt-2 max-w-md text-slate-500">
        This module will be built in a future phase. The navigation and routing foundation is
        ready.
      </p>
    </div>
  )
}
