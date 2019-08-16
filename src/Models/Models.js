//@flow

/**
 * Модель "Платёж" (ежемесячный).
 *
 * @prop {number} number Порядковый номер ежемесячного платежа.
 * @prop {Date} date Дата ежемесячного платежа.
 * @prop {number} amount Сумма ежемесячного платежа.
 * @prop {number} percents Сумма процентов ежемесячного платежа.
 * @prop {Date} bodyPayment Дата ежемесячного платежа.
 * @prop {Object[]} repayments Массив досрочных платежей за текущий месяц.
 * @prop {Date} currentCreditBody Оставшееся тело кредита после совершения ежемесячного платежа.
 */
export type Payment = {
    number: number;
    date: Date;
    amount: number;
    percents: number;
    bodyPayment: number;
    repayments: Repayment[];
    currentCreditBody: number
}

/**
 * Модель "Досрочный платёж".
 * Досрочных платежей в месяц может быть сколько угодно, можно делать хоть каждый день.
 *
 * @prop {Date} date Дата досрочного платежа.
 * @prop {number} amount Сумма досрочного платежа.
 */
export type Repayment = {
    date: Date;
    amount: number;
}
