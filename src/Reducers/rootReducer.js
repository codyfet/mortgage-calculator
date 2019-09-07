//@flow
import {INIT_CALCULATION} from '../Actions/ActionTypes';
import {calculatePaymentAmount, calculatePayments} from '../Utils/BusinessUtils';
import type {Payment, ReduxState} from '../Models/Models';

const initialState: ReduxState = {
    creditAmount: null,
    rate: null,
    monthsCount: null,
    startDate: null,
    defaultMonthlyRepayment: null,
    paymentAmount: null,
    payments: []
};

/**
 *
 * @param {*} state
 * @param {*} action
 */
export const rootReducer = (state: ReduxState = initialState, action: Object): ReduxState => {

    if (action.type === INIT_CALCULATION) {
        const {
            creditAmount,
            rate,
            monthsCount,
            startDate,
            defaultMonthlyRepayment
        } = action.payload;

        const paymentAmount: number = calculatePaymentAmount(
            rate,
            monthsCount,
            creditAmount
        );

        const payments: Payment[] = calculatePayments(
            startDate,
            creditAmount,
            paymentAmount,
            defaultMonthlyRepayment,
            monthsCount,
            rate
        );

        /**
         * Обычно клиент может выбрать сокращать ему срок или сокращать размер ежемесячного платежа)
         * Пока только сокращаем срок ипотеки.
         */
        const recalculatedMonthCount: number = payments.length;

        return {
            ...state,
            creditAmount,
            rate,
            monthsCount: recalculatedMonthCount,
            startDate,
            defaultMonthlyRepayment,
            paymentAmount,
            payments // cloneDeep?
        };
    }

    return state;
};