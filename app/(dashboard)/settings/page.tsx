import { PageHeader } from '@/components/dashboard/page-header'

export default async function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure your application" />
      <div className="mt-6">
        <p className="text-muted-foreground">Settings coming soon.</p>
      </div>
    </div>
  )
}
