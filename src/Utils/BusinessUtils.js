//@flow
import type {Repayment} from '../Models/Models';

/**
 * Возвращает сумму всех досрочных погащений за месяц.
 *
 * @param {Repayment[]} repayments Массив досрочных погашений за месяц.
 */
export function getRepaymentsMonthTotal (repayments: Repayment[]): number {
    return repayments.reduce((repaymentsMonthTotal: number, currentRepayment: Repayment) => {
        return repaymentsMonthTotal + currentRepayment.amount;
    }, 0);
}