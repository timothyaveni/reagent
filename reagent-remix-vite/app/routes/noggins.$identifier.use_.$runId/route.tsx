import { json } from '@remix-run/node';

export const loader = async ({ params, context }: any) => {
  return json({});
};

export default function NogginRun(props: any) {
  return <strong>adsf</strong>;
}
