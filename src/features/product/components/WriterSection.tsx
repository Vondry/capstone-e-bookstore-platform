import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Author } from '../../catalog/types';
import { useWriter } from '../hooks/useProduct';
import { SectionHeading } from './SectionHeading';

export type WriterSectionProps = {
  author: Author;
};

function WriterBody({ author }: Readonly<WriterSectionProps>) {
  const { data: writer, isPending, isError, error, refetch } = useWriter(author.slug);

  if (isPending) {
    return (
      <div className="flex gap-24" aria-busy="true">
        <Skeleton className="h-[96px] w-[96px] shrink-0 rounded-full" />
        <div className="flex-1 space-y-8">
          <Skeleton className="h-24 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-5/6" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState title="Could not load the writer" error={error} onRetry={() => void refetch()} />
    );
  }

  if (!writer) {
    return (
      <div>
        <p className="text-20 text-text-primary">{author.name}</p>
        <p className="mt-8 text-14 text-text-secondary">No biography available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 md:flex-row md:gap-24">
      <img
        src={writer.avatarUrl}
        alt=""
        className="h-[96px] w-[96px] shrink-0 rounded-full object-cover md:h-[120px] md:w-[120px]"
      />
      <div className="min-w-0">
        <p className="text-20 text-text-primary">{writer.name}</p>
        {writer.bio.map((paragraph) => (
          <p key={paragraph} className="mt-8 text-14 text-text-secondary">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

/** "About the writer": avatar, name and bio (SIMULATED profile) */
export function WriterSection({ author }: Readonly<WriterSectionProps>) {
  return (
    <section aria-labelledby="about-writer-heading">
      <SectionHeading id="about-writer-heading">About the writer</SectionHeading>
      <WriterBody author={author} />
    </section>
  );
}
