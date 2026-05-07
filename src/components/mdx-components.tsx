import type {MDXComponents} from 'mdx/types';

export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="text-2xl font-bold tracking-tight mt-8 mb-4 first:mt-0" {...props} />,
  h2: (props) => <h2 className="text-xl font-semibold tracking-tight mt-8 mb-3 first:mt-0" {...props} />,
  h3: (props) => <h3 className="text-lg font-semibold mt-6 mb-2" {...props} />,
  h4: (props) => <h4 className="text-base font-semibold mt-4 mb-2" {...props} />,
  p: (props) => <p className="leading-7 mb-4 last:mb-0" {...props} />,
  a: (props) => (
    <a className="underline underline-offset-4 text-primary hover:text-primary/80 transition-colors" {...props} />
  ),
  ul: (props) => <ul className="list-disc pl-6 space-y-2 mb-4" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 space-y-2 mb-4" {...props} />,
  li: (props) => <li className="leading-7" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-2 border-border pl-4 py-1 my-4 text-muted-foreground" {...props} />
  ),
  hr: () => <hr className="my-6 border-border/50" />,
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b border-border" {...props} />,
  th: (props) => <th className="text-left font-semibold px-3 py-2" {...props} />,
  td: (props) => <td className="border-t border-border/50 px-3 py-2" {...props} />,
  tr: (props) => <tr className="even:bg-muted/30" {...props} />,
  pre: (props) => (
    <pre className="overflow-x-auto rounded-lg bg-muted/50 border border-border/50 p-4 my-4 text-sm" {...props} />
  ),
  code: ({className, children, ...props}) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="rounded-lg my-4 max-w-full" alt={props.alt ?? ''} {...props} />
  ),
  details: (props) => <details className="my-4 rounded-lg border border-border/50 p-4" {...props} />,
  summary: (props) => <summary className="cursor-pointer font-medium" {...props} />,
  strong: (props) => <strong className="font-semibold" {...props} />,
  del: (props) => <del className="line-through text-muted-foreground" {...props} />,
};
