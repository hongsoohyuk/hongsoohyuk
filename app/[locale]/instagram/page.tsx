import {getInstagramPostList, getInstagramProfile} from '@/entities/instagram';
import {setRequestLocale} from 'next-intl/server';
import {InstagramFeed, ProfileCard} from '@/widgets/instagram';
import React from 'react';

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
