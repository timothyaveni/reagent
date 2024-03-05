import { unit } from 'reagent-noggin-shared/cost-calculation/units';
import T from '~/i18n/T';

export const CostText = ({ quastra }: { quastra: number | bigint }) => {
  const quastraAsNumber =
    typeof quastra === 'bigint' ? Number(quastra) : quastra;

  const creditCount = unit(quastraAsNumber, 'quastra').toNumber('credits');
  // round for rendering
  const roundedCreditCount = Math.round(creditCount * 1000000) / 1000000;
  return (
    <T flagged>
      {roundedCreditCount}{' '}
      <T flagged>credit{roundedCreditCount === 1 ? '' : 's'}</T>
    </T>
  );
};

export const roundedCreditCount = (quastra: number) => {
  const creditCount = unit(quastra, 'quastra').toNumber('credits');
  return Math.round(creditCount * 1000000) / 1000000;
};
