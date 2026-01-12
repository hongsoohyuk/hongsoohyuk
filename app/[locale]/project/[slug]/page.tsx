import {getNotionPageBlocks} from '@/entities/project';

export default async function PostPage() {
  const blocks = await getNotionPageBlocks('2e2cc5bea79e80799747d6e8bb6d5bfe');

  return (
    <article>
      {blocks.map((block) => (
        <NotionBlock key={block.id} block={block} />
      ))}
    </article>
  );
}

function NotionBlock({block}: {block: any}) {
  return <div>{block.type}</div>;
}
