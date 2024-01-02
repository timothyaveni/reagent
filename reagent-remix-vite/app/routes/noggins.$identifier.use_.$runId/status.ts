import { NogginRunStatus } from '@prisma/client';
import { t } from '~/i18n/T';

export function renderNogginRunStatus(status: NogginRunStatus) {
  switch (status) {
    case NogginRunStatus.pending:
      return t('Pending');
    case NogginRunStatus.running:
      return t('Running');
    case NogginRunStatus.succeeded:
      return t('Succeeded');
    case NogginRunStatus.failed:
      return t('Failed');
    default:
      const _exhaustiveCheck: never = status;
  }
}
