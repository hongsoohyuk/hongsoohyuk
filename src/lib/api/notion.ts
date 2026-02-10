import {Client} from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
console.log(process.env.NOTION_API_KEY);
