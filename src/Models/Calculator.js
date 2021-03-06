// @flow
import {getDifferenceDaysBetweenDates, getNumberDaysOfYear} from '../Utils/Utils';
import {getRepaymentsMonthTotal} from '../Utils/BusinessUtils';
import type {Payment} from './Models';

/**
 * Класс Калькулятор ипотеки.
 * @Deprecated
 */
export class Calculator {
    creditAmount: number;
    rate: number;
    monthsCount: number;
    startDate: Date;
    defaultMonthlyRepayment: number;
    paymentAmount: number;
    payments: Payment[];

    /**
     * @param {number} creditAmount Сумма кредита в рублях.
     * @param {number} rate Процентная ставка (в целом виде, например: 12)
     * @param {number} monthsCount Количество месяцев, на которые берется кредит.
     * @param {Date} startDate Дата первого ежемесячного платежа.
     * @param {number} [defaultMonthlyRepayment] Сумма ежемесячного досрочного погашения (по умолчанию применяется ко всем выплатам).
     */
    constructor(
        creditAmount: number,
        rate: number,
        monthsCount: number,
        startDate: Date,
        defaultMonthlyRepayment: number
    ) {
        this.creditAmount = creditAmount;
        this.rate = rate;
        this.monthsCount = monthsCount;
        this.startDate = startDate;
        this.defaultMonthlyRepayment = defaultMonthlyRepayment;
        this.paymentAmount = this._calculatePaymentAmount();
        this.payments = this._calculatePayments();
    }

    getCreditAmount (): number {
        return this.creditAmount;
    }

    /**
     * Возвращает годовую процентную ставку (без пересчёта на сотые доли).
     * Пример возвращаемого значения: 11.
     */
    getRate (): number {
        return this.rate;
    }

    getMonthsCount (): number {
        return this.monthsCount;
    }

    /**
     * Устанавливает новое значение для количества месяцев ипотеки.
     *
     * @param {number} monthsCount Устанавливаемое количество месяцев.
     */
    _setMonthsCount (monthsCount: number): void {
        this.monthsCount = monthsCount;
    }

    getStartDate (): Date {
        return this.startDate;
    }

    getDefaultMonthlyRepayment (): number {
        return this.defaultMonthlyRepayment;
    }

    getPaymentAmount (): number {
        return this.paymentAmount;
    }

    /**
     * Возвращает общую сумму выплат за весь период кредита.
     */
    getTotalAmount (): number {
        const payments: Payment[] = this.getPayments();
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

    getPayments (): Object[] {
        return this.payments;
    }

    /**
     * Возвращает месячную годовую процентную ставку в формате сотых долей.
     * Умножаем на 0.01, чтобы преобразовать к сотым долям: 11 % => 0.11 %
     * Т.к. указана годовая ставка, необходимо разделить её на 12, чтобы получить ставку в месяц.
     */
    getFractionalMonthRate (): number {
        return (this.getRate() * 0.01) / 12;
    }

    /**
     * Обновляет сумму досрочного платежа для конкретного месяца.
     *
     * @param {number} index Порядковый индекс в массиве платежей (номер ежемесячной выплаты).
     * @param {number} newRepayment Новое значение досрочного платежа, которое необходимо установить.
     */
    updateRepaymentForMonth (index: number, newRepayment: number): void {
        const payments: Payment[] = this.getPayments();
        const paymentToUpdate: Payment = payments[index];

        paymentToUpdate.repayments[0].amount = newRepayment;

        this._calculatePayments();
    }

    /**
     * Расчитывает ежемесячный платёж.
     */
    _calculatePaymentAmount (): number {
        const i = this.getFractionalMonthRate();
        const n = this.getMonthsCount();
        const a = this.getCreditAmount();

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
    _calculatePayments (): Payment[] {
        const payments: Payment[] = [];
        const startDate: Date = this.getStartDate();
        const creditAmount: number = this.getCreditAmount();
        const paymentAmount: number = this.getPaymentAmount();
        const defaultMonthlyRepayment: number = this.getDefaultMonthlyRepayment();

        for (let i = 0; i < this.getMonthsCount(); i++) {
            const paymentDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + i));
            const currentCreditBody = (i === 0) ? creditAmount : payments[i - 1].currentCreditBody;
            const percents = this._calculatePercentsForMonth(currentCreditBody, paymentDate);
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
                this._setMonthsCount(payments.length);
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
    _calculatePercentsForMonth (currentCreditBody: number, currentDate: Date): number {
        let percents = null;
        const currentYear = currentDate.getFullYear();

        // Если дата платежа не приходится на январь.
        if (currentDate.getMonth() !== 0) {
            const currentPaymentDaysCount = getDifferenceDaysBetweenDates(
                new Date(new Date(currentDate).setMonth(currentDate.getMonth() - 1)),
                currentDate
            );

            percents =
                (currentCreditBody * this.getRate() * currentPaymentDaysCount) /
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
                (currentCreditBody * this.getRate() * currentPaymentDaysCount1) /
                (100 * getNumberDaysOfYear(currentYear - 1))
                +
                (currentCreditBody * this.getRate() * currentPaymentDaysCount2) /
                (100 * getNumberDaysOfYear(currentYear))
            ;
        }

        return percents;
    }
}
