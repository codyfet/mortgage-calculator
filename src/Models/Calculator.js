/**
 * Класс Калькулятор.
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
    }

    getCreditAmount () {
        return this.creditAmount;
    }

    getRate () {
        return this.rate;
    }

    getMonthsCount () {
        return this.monthsCount;
    }

    getStartDate () {
        return this.startDate;
    }

    /**
     * Умножаем на 0.01, чтобы преобразовать к сотым долям: 11 % => 0.11 %
     * Т.к. указана годовая ставка, необходимо разделить её на 12, чтобы получить ставку в месяц.
     */
    getFractionalMonthRate () {
        return (this.getRate() * 0.1) / 12;
    }

    getPayment () {
        const i = this.getFractionalMonthRate();
        const n = this.getMonthsCount();
        const a = this.getCreditAmount();

        const payment = a * (
            i * Math.pow((1 + i), n)
        ) / (
            Math.pow((1 + i), n) - 1
        );

        return payment;
    }
}
