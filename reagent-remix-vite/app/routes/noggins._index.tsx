import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { requireUser } from "~/auth/auth.server";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  return null;
}

export const action = async () => {
  
};

export default function NogginList() {
  return <div className="noggin-list">
    <h1>Noggins</h1>
    <Form method="post" action="/noggins">
      <button type="submit">New noggin</button>
    </Form>

    <Link to="/noggins/1">Noggin 1</Link>
  </div>;
}