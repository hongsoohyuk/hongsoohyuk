import React from 'react';

import {setRequestLocale} from 'next-intl/server';

import {InstagramFeed} from '@/widgets/instagram/ui/InstagramFeed';
import {ProfileCard} from '@/widgets/instagram/ui/ProfileCard';

import {getInstagramProfile} from '@/entities/instagram/api/get-profile';
import {getInstagramPostList} from '@/entities/instagram/api/list-post';

type Props = {
  params: Promise<{locale: string}>;
};

export async function InstagramPage({params}: Props) {
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
