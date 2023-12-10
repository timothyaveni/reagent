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

export const t = (s: string) => s;

export default T;