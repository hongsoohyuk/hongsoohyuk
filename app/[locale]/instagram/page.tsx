import {getInitialInstagramPostList, getInitialInstagramProfile, InstagramMedia} from '@/entities/instagram';
import {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {ProfileCard, InstagramFeed} from '@/widgets/instagram';
import {DEFAULT_LIMIT} from '@/entities/instagram/config/constant';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Instagram'});

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function InstagramPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [mediaList, profile] = await Promise.all([
    getInitialInstagramPostList({limit: DEFAULT_LIMIT}),
    getInitialInstagramProfile(),
  ]);

  const posts: InstagramMedia[] = mediaList.data ?? [];
  const after = mediaList.paging?.cursors?.after;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl mx-auto flex flex-col gap-8">
      <ProfileCard profile={profile} />
      <InstagramFeed initialItems={posts} initialAfter={after} />
    </div>
  );
}
