//@flow
import type {Action} from '../Models/Models';
import {INIT_CALCULATION} from './ActionTypes';

/**
 * Экшен криэйтор для действия "Создание модели кредита".
 *
 * @param {number} creditAmount Сумму кредита.
 * @param {number} rate Процентная ставка.
 * @param {number} monthsCount Количество месяцев (срок кредита).
 * @param {Date} startDate Дата открытия договора.
 * @param {number} defaultMonthlyRepayment Сумма досрочного погашения (дефолтная - применяется для каждого месяца).
 */
export const initCalculation = (
    creditAmount: number,
    rate: number,
    monthsCount: number,
    startDate: Date,
    defaultMonthlyRepayment: number
): Action => ({
    type: INIT_CALCULATION,
    payload: {
        creditAmount,
        rate,
        monthsCount,
        startDate,
        defaultMonthlyRepayment
    }
});
