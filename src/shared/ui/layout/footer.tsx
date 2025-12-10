import {SITE_CONFIG} from '@/shared/config/site';
import {getTranslations} from 'next-intl/server';

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations('Footer');

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('copyright', {year: currentYear})}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={SITE_CONFIG.links.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href={SITE_CONFIG.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
