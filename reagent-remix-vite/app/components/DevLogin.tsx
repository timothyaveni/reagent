export default function DevLogin() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <form method="post" action="/auth/dev/login">
      [Dev login]
      <br />
      User ID: <input type="number" name="id" />
      {/* juuuust to be safe */}
      Password: <input type="password" name="password" />
      <button type="submit">Dev login</button>
    </form>
  );
}
