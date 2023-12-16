import DevLogin from "~/components/DevLogin";
import T from "~/i18n/T";

export default function Login() {
  return (
    <div>
      <h1>Log in</h1>

      {/* github login */}
      <a href="/auth/github">
        <T>Log in with GitHub</T>
      </a>
      <DevLogin />
    </div>
  )
}