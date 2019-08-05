import {getNumberDaysOfYear, getDifferenceDaysBetweenDates} from '../Utils/Utils';

/**
 * Класс Калькулятор ипотеки.
 */
export class Calculator {
    /**
     * @param {number} creditAmount Сумма кредита в рублях.
     * @param {number} rate Процентная ставка (в целом виде, например: 12)
     * @param {number} monthsCount Количество месяцев, на которые берется кредит.
     * @param {Date} startDate Дата первого ежемесячного платежа.
     */
    constructor(creditAmount, rate, monthsCount, startDate) {
        this.creditAmount = creditAmount;
        this.rate = rate;
        this.monthsCount = monthsCount;
        this.startDate = startDate;
        this.paymentAmount = this._calculatePaymentAmount();
        this.totalAmount = this.paymentAmount * monthsCount;
        this.payments = this._calculatePayments();
    }

    getCreditAmount () {
        return this.creditAmount;
    }

    /**
     * Возвращает годовую процентную ставку (без пересчёта на сотые доли).
     * Пример возвращаемого значения: 11.
     */
    getRate () {
        return this.rate;
    }

    getMonthsCount () {
        return this.monthsCount;
    }

    getStartDate () {
        return this.startDate;
    }

    getPaymentAmount () {
        return this.paymentAmount;
    }

    getTotalAmount () {
        return this.totalAmount;
    }

    getPayments () {
        return this.payments;
    }

    /**
     * Возвращает месячную годовую процентную ставку в формате сотых долей.
     * Умножаем на 0.01, чтобы преобразовать к сотым долям: 11 % => 0.11 %
     * Т.к. указана годовая ставка, необходимо разделить её на 12, чтобы получить ставку в месяц.
     */
    getFractionalMonthRate () {
        return (this.getRate() * 0.01) / 12;
    }

    /**
     * Расчитывает ежемесячный платёж.
     */
    _calculatePaymentAmount () {
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
     * Расчитывает поддробную информацию по каждому платежу.
     */
    _calculatePayments () {
        const payments = [];
        const startDate = this.getStartDate();
        const creditAmount = this.getCreditAmount();
        const paymentAmount = this.getPaymentAmount();

        for (let i = 0; i < this.getMonthsCount(); i++) {
            const paymentDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + i));
            const currentCreditBody = (i === 0) ? creditAmount : payments[i - 1].currentCreditBody;
            const percents = this._calculatePercentsForMonth(currentCreditBody, paymentDate);
            const bodyPayment = paymentAmount - percents;
            const newCurrentCreditBody = currentCreditBody - bodyPayment;

            payments.push({
                number: i + 1,
                date: paymentDate,
                amount: paymentAmount,
                percents: percents,
                bodyPayment: bodyPayment,
                currentCreditBody: newCurrentCreditBody
            });
        }

        return payments;
    }

    /**
     * Расчитывает сумму процентов в конкретный месяц.
     *
     * @param {number} currentCreditBody Оставшееся тело кредита.
     * @param {Date} currentDate Дата ежемесячного платежа (в месяце, для которого расчитываем проценты).
     */
    _calculatePercentsForMonth (currentCreditBody, currentDate) {
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
