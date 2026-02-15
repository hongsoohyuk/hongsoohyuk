type Props = {
  children: React.ReactNode;
};

export default function BlogDetailLayout({children}: Props) {
  return <article>{children}</article>;
}
