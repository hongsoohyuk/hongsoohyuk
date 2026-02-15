import {setRequestLocale} from 'next-intl/server';

import {NotionBlocks} from '@/components/notion';
import {getResumePage} from '@/features/resume/api';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ResumePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const data = await getResumePage();

  return (
    <section className="space-y-6 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 p-6 md:p-8">
      {data.blocks.length > 0 && <NotionBlocks blocks={data.blocks} />}
    </section>
  );
}
