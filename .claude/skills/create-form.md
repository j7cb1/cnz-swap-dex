# Create Form Skill

Creates form component files following the project's form pattern with react-hook-form and zod.

**Reference:** See `docs/project-pattern/front-end-forms.md` for complete documentation.

## Usage

```
/create-form <form-name>
```

Example: `/create-form user-settings`

## What it creates

For a given form (e.g., `user-settings`), creates:

```
components/{domain}/
├── {form-name}-client.tsx   # Client component (orchestrates form logic)
└── {form-name}-form.tsx     # Form UI component (renders inputs)
```

Plus skeleton and error components if needed (see `/create-frontend-component`).

## Instructions

1. **Ask for the form name** if not provided
2. **Ask for the domain/folder** (e.g., `users`, `settings`)
3. **Ask for the schema/entity** being edited
4. **Ask what mutation hook to use** (e.g., `useMutateUserProfile`)

## File Templates

### 1. Client Component (`{form-name}-client.tsx`)

```typescript
'use client'

import { use{Entity} } from '@/use-cases/{domain}/{entity}/use-{entity}'
import { useMutate{Entity} } from '@/use-cases/{domain}/{entity}/use-mutate-{entity}'
import { {FormName}Form } from './{form-name}-form'
import { {FormName}Skeleton } from './{form-name}-skeleton'
import { {FormName}Error } from './{form-name}-error'
import type { {Entity}Update } from '@/repositories/{domain}/{entity}-schema'

type {FormName}ClientProps = {
  {entityId}: string
}

export function {FormName}Client({ {entityId} }: {FormName}ClientProps) {
  const { data, isLoading, error } = use{Entity}({entityId})
  const mutation = useMutate{Entity}()

  if (isLoading) {
    return <{FormName}Skeleton />
  }

  if (error || !data) {
    return <{FormName}Error />
  }

  const handleSubmit = async (values: {Entity}Update) => {
    await mutation.mutateAsync({
      {entityId},
      data: values,
    })
  }

  return (
    <{FormName}Form
      initialValues={data}
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
      submitError={mutation.error?.message}
      submitSuccess={mutation.isSuccess}
    />
  )
}
```

### 2. Form UI Component (`{form-name}-form.tsx`)

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { update{Entity}Schema, type {Entity}, type {Entity}Update } from '@/repositories/{domain}/{entity}-schema'

type {FormName}FormProps = {
  initialValues: {Entity}
  onSubmit: (values: {Entity}Update) => Promise<void>
  isSubmitting: boolean
  submitError?: string
  submitSuccess?: boolean
}

export function {FormName}Form({
  initialValues,
  onSubmit,
  isSubmitting,
  submitError,
  submitSuccess,
}: {FormName}FormProps) {
  const form = useForm<{Entity}Update>({
    resolver: zodResolver(update{Entity}Schema),
    defaultValues: {
      // Map initialValues to form defaults
    },
  })

  const handleFormSubmit = async (values: {Entity}Update) => {
    try {
      await onSubmit(values)
      form.reset(values)
    } catch (error) {
      // Error handled via submitError prop
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Changes saved successfully</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
```

## Key Libraries

- **Form Management:** `react-hook-form`
- **Validation:** `zod` with `@hookform/resolvers/zod`
- **Data Submission:** `@tanstack/react-query` mutation hooks
- **UI Components:** Shadcn UI (`@/components/ui/`)

## Form Flow

1. `*-client.tsx` fetches initial data and provides mutation
2. `*-form.tsx` renders form with `react-hook-form`
3. User interacts with form
4. On submit, `form.handleSubmit` triggers `handleFormSubmit`
5. `handleFormSubmit` calls `onSubmit` (mutation)
6. On success: reset form, show inline success message
7. On error: show inline error message

## Rules

- Separate form rendering (`*-form.tsx`) from submission logic (`*-client.tsx`)
- Use `zodResolver` for schema-based validation
- Handle loading/error states in client component
- Reset form with new values on successful submission
- Use `isPending`/`isSubmitting` to disable submit button
- **Use inline Alert components for feedback (no toasts)**
- Pass `submitError` and `submitSuccess` as props for inline display
- Validation schemas come from repository layer
