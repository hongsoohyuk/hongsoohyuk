type Props = {
  children: React.ReactNode;
};

export default function ContentLayout({children}: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
