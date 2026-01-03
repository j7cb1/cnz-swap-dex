import { PageHeader } from '@/components/dashboard/page-header'

export default async function UsersPage() {
  return (
    <div>
      <PageHeader title="Users" description="Manage your users" />
      <div className="mt-6">
        <p className="text-muted-foreground">User management coming soon.</p>
      </div>
    </div>
  )
}
