export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{title}</h1>
      <span className="text-muted">Trang này sẽ làm ở bước sau.</span>
    </div>
  )
}
