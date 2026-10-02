export type SectionHeadingProps = {
  id: string;
  children: React.ReactNode;
};

export function SectionHeading({ id, children }: Readonly<SectionHeadingProps>) {
  return (
    <h2 id={id} className="mb-16 text-20 font-normal text-text-primary">
      {children}
    </h2>
  );
}
