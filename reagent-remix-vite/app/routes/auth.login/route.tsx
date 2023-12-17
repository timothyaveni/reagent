import DevLogin from "./DevLogin";
import T from "~/i18n/T";

export default function Login() {
  return (
    <div>
      <h1>Log in</h1>

      {/* github login */}
      <a href="/auth/github">
        <T>Log in with GitHub</T>
      </a>
      <p>
        {/* todo: i do not want to deal with the end-of-semester emails -- make them give us an email address */}
        <T>If you typically log in through a course site for a class you are taking, you'll need to log in through that site again.</T>
      </p>
      <DevLogin />
    </div>
  )
}