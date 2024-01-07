import { t } from '~/i18n/T';

// TODO: figure out why this prisma TS import isn't working in the prod build
type NogginRunStatus = 'pending' | 'running' | 'succeeded' | 'failed';
const NogginRunStatus = {
  pending: 'pending' as const,
  running: 'running' as const,
  succeeded: 'succeeded' as const,
  failed: 'failed' as const,
};

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
