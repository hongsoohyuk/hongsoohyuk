import {getProjectDetail} from '@/lib/content/project';
import {generateContentOgImage, OG_IMAGE_SIZE} from '@/lib/seo/og-image';
import {SITE_CONFIG} from '@/config/site';

export const alt = `Project | ${SITE_CONFIG.name}`;
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export default async function Image({params}: Props) {
  const {slug} = await params;

  try {
    const data = await getProjectDetail(slug);
    return await generateContentOgImage({
      title: data.meta.title,
      subtitle: data.meta.description || undefined,
      badge: 'Project',
    });
  } catch {
    return await generateContentOgImage({title: SITE_CONFIG.name, badge: 'Project'});
  }
}
