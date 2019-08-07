// @flow
import {formatAmount, getDifferenceDaysBetweenDates, getNumberDaysOfYear} from '../Utils/Utils';

/**
 * Класс Калькулятор ипотеки.
 */
export class Calculator {
    creditAmount: number;
    rate: number;
    monthsCount: number;
    startDate: Date;
    monthlyRepayment: number;
    paymentAmount: number;
    payments: Array<Object>;

    /**
     * @param {number} creditAmount Сумма кредита в рублях.
     * @param {number} rate Процентная ставка (в целом виде, например: 12)
     * @param {number} monthsCount Количество месяцев, на которые берется кредит.
     * @param {Date} startDate Дата первого ежемесячного платежа.
     * @param {number} [monthlyRepayment] Сумма ежемесячного досрочного погашения.
     */
    constructor(
        creditAmount: number,
        rate: number,
        monthsCount: number,
        startDate: Date,
        monthlyRepayment: number
    ) {
        this.creditAmount = creditAmount;
        this.rate = rate;
        this.monthsCount = monthsCount;
        this.startDate = startDate;
        this.monthlyRepayment = monthlyRepayment;
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

    getMonthlyRepayment (): number {
        return this.monthlyRepayment;
    }

    getPaymentAmount (): number {
        return this.paymentAmount;
    }

    getTotalAmount (): number {
        return this.getPaymentAmount() * this.getMonthsCount();
    }

    getPayments (): Array<Object> {
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
    _calculatePayments (): Array<Object> {
        const payments = [];
        const startDate = this.getStartDate();
        const creditAmount = this.getCreditAmount();
        const paymentAmount = this.getPaymentAmount();
        const monthlyRepayment = this.getMonthlyRepayment();

        for (let i = 0; i < this.getMonthsCount(); i++) {
            const paymentDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + i));
            const currentCreditBody = (i === 0) ? creditAmount : payments[i - 1].currentCreditBody;
            const percents = this._calculatePercentsForMonth(currentCreditBody, paymentDate);
            const bodyPayment = paymentAmount - percents;
            let newCurrentCreditBody = currentCreditBody - bodyPayment;

            // Уменьшаем оставшееся тело кредита на сумму досрочного погашения за этот месяц.
            if (i > 0 && payments[i - 1].repayments.length > 0) {
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
                        [formatAmount(paymentDate)]: monthlyRepayment
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
