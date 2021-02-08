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
 * Модель день.
 *
 * @prop {number} number вава.
 * @prop {number} percentsPerDay Сумма процентов в день.
 * @prop {number} percentsByDay Сумма процентов за период с начала месяца до текущего дня.
 */
export type Day = {
    number: number;
    percentsPerDay: number;
    percentsByDay: number;
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

/**
 * Тип, описывающий redux дерево
 */
export type ReduxState = {
    +creditAmount: ?number;
    +rate: ?number;
    +monthsCount: ?number;
    +startDate: ?Date;
    +defaultMonthlyRepayment: ?number;
    +paymentAmount: ?number;
    +payments: Payment[];
}

/**
 * Тип, описывающий redux экшен.
 */
export type Action = {
    +type: string,
    +payload: Object
};

/**
 * Тип, описывающий dispatch функцию.
 */
export type Dispatch = (action: Action) => any;
