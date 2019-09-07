//@flow
import type {Payment, Repayment} from '../Models/Models';
import {getDifferenceDaysBetweenDates, getNumberDaysOfYear} from './Utils';

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

/**
 * Возвращает месячную годовую процентную ставку в формате сотых долей.
 * Умножаем на 0.01, чтобы преобразовать к сотым долям: 11 % => 0.11 %
 * Т.к. указана годовая ставка, необходимо разделить её на 12, чтобы получить ставку в месяц.
 */
function getFractionalMonthRate (rate: number): number {
    return (rate * 0.01) / 12;
}

/**
 * Расчитывает ежемесячные платежи.
 *
 * @param {number} rate Процентная ставка.
 * @param {number} monthsCount Количество месяцев.
 * @param {number} creditAmount Сумма кредита.
 */
export function calculatePaymentAmount (rate: number, monthsCount: number, creditAmount: number): number {
    const i = getFractionalMonthRate(rate);
    const n = monthsCount;
    const a = creditAmount;

    const paymentAmount = a * (
        i * Math.pow((1 + i), n)
    ) / (
            Math.pow((1 + i), n) - 1
        );

    return paymentAmount;
}

/**
 * Расчитывает и возвращает подробную информацию по каждому платежу.
 */
export function calculatePayments (
    startDate: Date,
    creditAmount: number,
    paymentAmount: number,
    defaultMonthlyRepayment: number,
    monthsCount: number,
    rate: number
): Payment[] {
    const payments: Payment[] = [];

    for (let i = 0; i < monthsCount; i++) {
        const paymentDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + i));
        const currentCreditBody = (i === 0) ? creditAmount : payments[i - 1].currentCreditBody;
        const percents = calculatePercentsForMonth(currentCreditBody, paymentDate, rate);
        const bodyPayment = paymentAmount - percents;
        let newCurrentCreditBody = currentCreditBody - bodyPayment;

        const prevPayment: Payment = payments[i - 1];
        const monthlyRepayment: number = (prevPayment && prevPayment.repayments[0].amount !== defaultMonthlyRepayment) ?
            prevPayment.repayments[0].amount :
            defaultMonthlyRepayment
            ;

        // Уменьшаем оставшееся тело кредита на сумму досрочного погашения за этот месяц.
        if (i > 0 && prevPayment.repayments.length > 0) {
            newCurrentCreditBody = newCurrentCreditBody - monthlyRepayment;
        }

        if (newCurrentCreditBody > 0) {
            payments.push({
                number: i + 1,
                date: paymentDate,
                amount: paymentAmount,
                percents: percents,
                bodyPayment: bodyPayment,
                repayments: [{
                    date: paymentDate,
                    amount: monthlyRepayment
                }],
                currentCreditBody: newCurrentCreditBody
            });
        } else {
            /**
             * Обычно клиент может выбрать сокращать ему срок или сокращать размер ежемесячного платежа)
             * Пока только сокращаем срок ипотеки.
             */
            break;
        }
    }

    return payments;
}

/**
 * Расчитывает и возвращает сумму процентов в конкретный месяц.
 *
 * @param {number} currentCreditBody Оставшееся тело кредита.
 * @param {Date} currentDate Дата ежемесячного платежа (в месяце, для которого расчитываем проценты).
 */
function calculatePercentsForMonth (currentCreditBody: number, currentDate: Date, rate: number): number {
    let percents = null;
    const currentYear = currentDate.getFullYear();

    // Если дата платежа не приходится на январь.
    if (currentDate.getMonth() !== 0) {
        const currentPaymentDaysCount = getDifferenceDaysBetweenDates(
            new Date(new Date(currentDate).setMonth(currentDate.getMonth() - 1)),
            currentDate
        );

        percents =
            (currentCreditBody * rate * currentPaymentDaysCount) /
            (100 * getNumberDaysOfYear(currentYear))
            ;
        // Если дата платежа приходится на январь, то необходимо отдельно посчитать часть за предыдущий год и часть за текущий год.
    } else {
        const currentPaymentDaysCount1 = getDifferenceDaysBetweenDates(
            new Date(new Date(currentDate).setMonth(currentDate.getMonth() - 1)),
            new Date(currentYear - 1, 11, 31) // 31 декабря.
        );

        const currentPaymentDaysCount2 = getDifferenceDaysBetweenDates(
            new Date(currentYear, 0, 1), // 1 января.
            currentDate
        );

        percents =
            (currentCreditBody * rate * currentPaymentDaysCount1) /
            (100 * getNumberDaysOfYear(currentYear - 1))
            +
            (currentCreditBody * rate * currentPaymentDaysCount2) /
            (100 * getNumberDaysOfYear(currentYear))
            ;
    }

    return percents;
}

/**
 * Возвращает общую сумму выплат за весь период кредита.
 */
export function getTotalAmount(payments: Payment[]): number {
    // const payments: Payment[] = this.getPayments();
    let totalAmount: number = 0;

    /**
     * Цикл по месяцам.
     */
    payments.forEach((payment: Payment) => {
        /**
         * Прибавляем ежемесячный платёж (тело кредита + проценты за месяц).
         */
        totalAmount += payment.amount;

        /**
         * Прибавляем все досрочные платежи, какие были в этом месяце.
         */
        totalAmount += getRepaymentsMonthTotal(payment.repayments);
    });

    return totalAmount;
}