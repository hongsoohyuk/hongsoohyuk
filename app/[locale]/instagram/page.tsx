import React from 'react';

import {setRequestLocale} from 'next-intl/server';

import {
  getInstagramPostList,
  getInstagramProfile,
  InstagramFeed,
  ProfileCard,
} from '@/features/instagram';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function InstagramPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const [posts, profile] = await Promise.all([getInstagramPostList(), getInstagramProfile()]);

  return (
    <React.Fragment>
      <ProfileCard profile={profile} />
      <InstagramFeed items={posts.data} />
    </React.Fragment>
  );
}
