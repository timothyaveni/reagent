import { t } from "~/i18n/T";

export const notFound = () => new Response(null, { status: 404, statusText: t('Not Found') });