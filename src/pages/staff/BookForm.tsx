import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useBook, useCreateBook, useUpdateBook } from '@/hooks/useBooks'
import { useAuthors } from '@/hooks/useAuthors'
import { useGenres } from '@/hooks/useGenres'
import { usePublishers } from '@/hooks/usePublishers'
import { bookSchema, type BookFormValues } from '@/lib/schemas'
import { PageShell } from '@/components/shared/PageShell'
import { FormField, Input, Select, Textarea } from '@/components/shared/FormField'
import { MultiSelect } from '@/components/shared/MultiSelect'
import type { Author, Genre, Publisher } from '@/types'

export default function StaffBookForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id && id !== 'new'
  const navigate = useNavigate()

  const { data: book } = useBook(isEdit ? Number(id) : 0)
  const { data: authors = [] } = useAuthors()
  const { data: genres = [] } = useGenres()
  const { data: publishers = [] } = usePublishers()

  const create = useCreateBook()
  const update = useUpdateBook(Number(id))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema) as Resolver<BookFormValues>,
    defaultValues: { authorIds: [], genreIds: [] },
  })

  useEffect(() => {
    if (book && isEdit) {
      reset({
        isbn: book.isbn,
        title: book.title,
        description: book.description ?? '',
        publicationDate: book.publicationDate ?? '',
        language: book.language ?? '',
        pageCount: book.pageCount,
        publisherId: book.publisher?.id ?? 0,
        authorIds: book.authors.map((a) => a.id),
        genreIds: book.genres.map((g) => g.id),
      })
    }
  }, [book, isEdit, reset])

  function onSubmit(data: BookFormValues) {
    const clean = {
      ...data,
      description: data.description || undefined,
      publicationDate: data.publicationDate || undefined,
      language: data.language || undefined,
    }
    if (isEdit) {
      update.mutate(clean, { onSuccess: () => navigate(`/staff/books/${id}`) })
    } else {
      create.mutate(clean, { onSuccess: (book) => navigate(`/staff/books/${book.id}`) })
    }
  }

  const authorOptions = (authors as Author[]).map((a) => ({ value: a.id, label: a.name }))
  const genreOptions = (genres as Genre[]).map((g) => ({ value: g.id, label: g.name }))
  const publisherList = publishers as Publisher[]

  const isPending = create.isPending || update.isPending

  return (
    <PageShell
      title={isEdit ? 'Edit Book' : 'Add Book'}
      action={
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="ISBN" required error={errors.isbn?.message}>
            <Input {...register('isbn')} error={!!errors.isbn} />
          </FormField>
          <FormField label="Language" error={errors.language?.message}>
            <Input {...register('language')} error={!!errors.language} />
          </FormField>
        </div>

        <FormField label="Title" required error={errors.title?.message}>
          <Input {...register('title')} error={!!errors.title} />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Textarea rows={4} {...register('description')} error={!!errors.description} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Publication Date" error={errors.publicationDate?.message}>
            <Input type="date" {...register('publicationDate')} error={!!errors.publicationDate} />
          </FormField>
          <FormField label="Page Count" error={errors.pageCount?.message}>
            <Input type="number" {...register('pageCount', { valueAsNumber: true })} error={!!errors.pageCount} />
          </FormField>
        </div>

        <FormField label="Publisher" required error={errors.publisherId?.message}>
          <Select {...register('publisherId')} error={!!errors.publisherId}>
            <option value="">Select a publisher…</option>
            {publisherList.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Authors" required error={errors.authorIds?.message}>
          <Controller
            control={control}
            name="authorIds"
            render={({ field }) => (
              <MultiSelect
                options={authorOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select authors…"
                error={errors.authorIds?.message}
              />
            )}
          />
        </FormField>

        <FormField label="Genres" required error={errors.genreIds?.message}>
          <Controller
            control={control}
            name="genreIds"
            render={({ field }) => (
              <MultiSelect
                options={genreOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select genres…"
                error={errors.genreIds?.message}
              />
            )}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-border px-5 py-2.5 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isSubmitting}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Book'}
          </button>
        </div>
      </form>
    </PageShell>
  )
}
