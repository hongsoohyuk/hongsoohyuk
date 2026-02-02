import {getTranslations} from 'next-intl/server';
import {APP_LAYOUT_CLASSES} from '@/shared/config';
import {SITE_CONFIG} from '@/shared/config/site';

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations('Footer');

  return (
    <footer className={`hidden md:block border-t ${APP_LAYOUT_CLASSES.footerPaddingY}`}>
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-center text-sm leading-loose text-foreground/60">{t('copyright', {year: currentYear})}</p>
        <div className="flex items-center gap-2 md:gap-4">
          <a
            href={SITE_CONFIG.links.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href={SITE_CONFIG.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
