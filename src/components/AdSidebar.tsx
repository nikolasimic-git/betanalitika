import AdBanner from './AdBanner'

export default function AdSidebar() {
  return (
    <div className="hidden lg:block space-y-4 sticky top-24">
      <AdBanner />
      <AdBanner />
      <AdBanner />
    </div>
  )
}
