import { json } from '@remix-run/node';

export const loader = async ({ params, context }: any) => {
  // const user = requireUser(context);
  // const { identifier } = params;

  // const noggin = await loadNogginBySlug(context, { slug: identifier });

  // if (!noggin) {
  //   throw notFound();
  // }

  // const editorSchema = await getNogginEditorSchema_OMNISCIENT(noggin.id);

  // return json({ noggin, editorSchema });
  return json({});
};

export default function UseNoggin() {
  return <div></div>;
}
