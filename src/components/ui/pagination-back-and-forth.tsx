'use client';
import {ComponentProps, ComponentPropsWithoutRef} from 'react';

import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';

import {useTranslations} from 'next-intl';

import {DEFAULT_PAGE, PAGINATION_PARAMETER_PAGE} from '@/lib/api/pagination';
import {Button} from './button';
import {ButtonGroup} from './button-group';

type PaginationButtonProps =
  | (ComponentProps<typeof Link> & {disabled?: false})
  | (ComponentPropsWithoutRef<'button'> & {disabled: true});

function PaginationButton(props: PaginationButtonProps) {
  if (props.disabled) {
    const {disabled, ...rest} = props;
    return (
      <Button variant="link" disabled={disabled} asChild>
        <button {...rest} />
      </Button>
    );
  }

  return (
    <Button variant="link" asChild>
      <Link {...props} />
    </Button>
  );
}

function PaginationBackAndForth({totalPages}: {totalPages: number}) {
  const t = useTranslations('Common');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams?.get(PAGINATION_PARAMETER_PAGE)) || DEFAULT_PAGE;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams || undefined);
    params.set(PAGINATION_PARAMETER_PAGE, pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const prevDisabled = currentPage <= DEFAULT_PAGE;
  const nextDisabled = currentPage >= totalPages;
  return (
    <ButtonGroup className="py-0">
      <PaginationButton href={createPageURL(Math.max(currentPage - 1, DEFAULT_PAGE))} disabled={prevDisabled}>
        {t('pagination.previous')}
      </PaginationButton>
      <PaginationButton href={createPageURL(Math.min(currentPage + 1, totalPages))} disabled={nextDisabled}>
        {t('pagination.next')}
      </PaginationButton>
    </ButtonGroup>
  );
}

export {PaginationBackAndForth};
