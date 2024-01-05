import { NogginRunStatus } from '~/db';
import type { NogginRunStatusType } from '~/db';
import { t } from '~/i18n/T';

export function renderNogginRunStatus(status: NogginRunStatusType) {
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
