import { I18nString } from "~/shared/editorSchema";

const T = ({
  children,
  flagged = false,
}: {
  children: React.ReactNode;
  flagged?: boolean; // for when you think this is going to be some i18n work
}) => {
  return <>
    {children}
  </>
};

export const t = (s: string | I18nString ) => {
  if (typeof s === 'string') {
    return s;
  }

  return s.en_US;
};

export default T;