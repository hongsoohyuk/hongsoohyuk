import {google} from 'googleapis';
import {NextResponse} from 'next/server';

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/documents.readonly'],
    });

    const docs = google.docs({version: 'v1', auth});
    const documentId = '1n0_DJJChjBQ_znl9sdbODHM0Wy3M1GvK8L4vYrwy8QI';
    const res = await docs.documents.get({documentId});

    return NextResponse.json({
      title: res.data.title,
      body: res.data.body?.content,
    });
  } catch (err: any) {
    return NextResponse.json({error: err.message}, {status: 500});
  }
}
