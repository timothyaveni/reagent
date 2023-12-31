import { I18nString } from '~/shared/i18nString';

const T = ({
  children,
  flagged = false,
}: {
  children: React.ReactNode;
  flagged?: boolean; // for when you think this is going to be some i18n work
}) => {
  return <>{children}</>;
};

export const t = (s: string | I18nString) => {
  if (typeof s === 'string') {
    return s;
  }

  return s.en_US;
};

export const pluralize = (
  count: number,
  singular: string,
  plural: string,
  includeCount = false,
) => {
  const word = count === 1 ? singular : plural;

  if (includeCount) {
    return `${count} ${word}`;
  }

  return word;
};

export default T;
