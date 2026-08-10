import {setRequestLocale} from 'next-intl/server';

import {ContentSurface} from '@/components/content/content-surface';
import {NotionBlocks} from '@/components/notion';
import {getResumePage} from '@/lib/content/resume';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function ResumePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const data = await getResumePage(locale);

  return (
    <ContentSurface className="space-y-6">
      {data.blocks.length > 0 && <NotionBlocks blocks={data.blocks} />}
    </ContentSurface>
  );
}
