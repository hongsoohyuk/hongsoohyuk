import React from 'react';

import {setRequestLocale} from 'next-intl/server';

import {getInstagramPostList} from './_lib/list-post';
import {getInstagramProfile} from './_lib/get-profile';
import {InstagramFeed} from './_components/instagram-feed';
import {ProfileCard} from './_components/profile-card';

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
