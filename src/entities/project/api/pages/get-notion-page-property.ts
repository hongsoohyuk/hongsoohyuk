import {notion} from '@/shared/api/notion';

export async function getNotionPageProperty(pageId: string, propertyId: string) {
  return await notion.pages.properties.retrieve({
    page_id: pageId,
    property_id: propertyId,
  });
}
