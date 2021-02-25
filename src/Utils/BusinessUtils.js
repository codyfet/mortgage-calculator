//@flow
import type {Payment, Repayment} from '../Models/Models';
import {getDifferenceDaysBetweenDates, getNumberDaysOfYear} from './Utils';
import dayjs from 'dayjs';

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
 *
 * @param startDate Дата открытия договора.
 * @param creditAmount Сумма кредита.
 * @param paymentAmount Сумма ежемесячного платежа.
 * @param defaultMonthlyRepayment Сумма ежемесячного досрочного погашения.
 * @param monthsCount Количетсво месяцев, на которые взят кредит.
 * @param rate Ставка.
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
    const firstPaymentDate = dayjs(startDate).add(1, 'month');

    for (let i = 1; i <= monthsCount + 1; i++) {
        const isFirstPayment = i === 1;
        const paymentDate = firstPaymentDate.add(i - 1, 'month');
        const prevPayment: Payment = isFirstPayment ? null : payments[i - 2];
        const currentCreditBody = isFirstPayment ? creditAmount : prevPayment.currentCreditBody;
        const percents = calculatePercentsForMonth(currentCreditBody, paymentDate, rate);
        const bodyPayment = (paymentAmount < currentCreditBody ? paymentAmount - percents : currentCreditBody);
        let newCurrentCreditBody = currentCreditBody - bodyPayment;

        const monthlyRepayment: number = (prevPayment && prevPayment.repayments[0].amount !== defaultMonthlyRepayment) ?
            prevPayment.repayments[0].amount :
            defaultMonthlyRepayment
            ;

        // Уменьшаем оставшееся тело кредита на сумму досрочного погашения за этот месяц.
        if (i > 1 && prevPayment.repayments.length > 0) {
            newCurrentCreditBody = newCurrentCreditBody - monthlyRepayment;
        }

        /**
         * Если тело кредита равно нулю, то значит остался последний платёж.
         * Так как у нас индексация сдвинута на один (по умолчанию отсчёт идёт с 0), то в последняя выплата зачастую рисуется пустая.
         * Чтобы пустую выплату не добавялть, мы проверяем bodyPayment на 0.
         */
        if (newCurrentCreditBody >= 0 && bodyPayment !== 0) {
            const prevPaymentDate = paymentDate.subtract(1, 'month');
            const daysCount = getDifferenceDaysBetweenDates(prevPaymentDate, paymentDate);
            const percentsPerDay = percents / daysCount;
            const days: Day[] = [];

            for (let i = 1; i <= daysCount; i++) {
                days.push({
                    number: i,
                    percentsPerDay,
                    percentsByDay: i === 1 ? percentsPerDay : days[i - 2].percentsByDay + percentsPerDay
                });
            }

            payments.push({
                number: i,
                date: paymentDate,
                amount: bodyPayment + percents,
                percents: percents,
                bodyPayment: bodyPayment,
                repayments: [{
                    date: paymentDate,
                    amount: monthlyRepayment
                }],
                days,
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
 * @param {DateJS} currentDate Дата ежемесячного платежа (в месяце, для которого расчитываем проценты).
 */
function calculatePercentsForMonth (currentCreditBody: number, currentDate: DateJS, rate: number): number {
    let percents = null;
    const currentYear = currentDate.year();

    // Если дата платежа не приходится на январь.
    if (currentDate.month() !== 0) {
        const currentPaymentDaysCount = getDifferenceDaysBetweenDates(
            currentDate.subtract(1, 'month'),
            currentDate
        );

        percents =
            (currentCreditBody * rate * currentPaymentDaysCount) /
            (100 * getNumberDaysOfYear(currentYear))
            ;
        // Если дата платежа приходится на январь, то необходимо отдельно посчитать часть за предыдущий год и часть за текущий год.
    } else {
        const currentPaymentDaysCount1 = getDifferenceDaysBetweenDates(
            currentDate.subtract(1, 'month'),
            dayjs(new Date(currentYear - 1, 11, 31)), // 31 декабря.
        ) + 1;

        const currentPaymentDaysCount2 = getDifferenceDaysBetweenDates(
            dayjs(new Date(currentYear, 0, 1)), // 1 января.
            currentDate
        ) + 1;

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