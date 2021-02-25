/**
 * Вовращает дату в формате MM.DD.YYYY.
 *
 * @param {DateJS} date Значение типа Date.
 */
export function formatDate(date) {
    return date.format('DD.MM.YYYY');
}

/**
 * Выводит отформатированную сумму в рублях.
 *
 * @param {number} value Значение, которое необходимо отформатировать.
 */
export function formatAmount(value) {
    if (Intl.NumberFormat) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            currencyDisplay: 'symbol'
        }).format(value);
    }

    return value;
}

/**
 * Возвращает количество дней в году.
 *
 * https://www.w3resource.com/javascript-exercises/javascript-date-exercise-14.php
 *
 * @param {number} year Год.
 */
export function getNumberDaysOfYear(year) {
    return isLeapYear(year) ? 366 : 365;
}

/**
 * Вычисляет является ли переданный на вход год високосным.
 *
 * @param {number} year Год.
 */
function isLeapYear(year) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}

/**
 * Вовращает разницу в днях между Второй датой и Первой датой.
 *
 * @param {DateJS} date1 Первая дата.
 * @param {DateJS} date2 Вторая дата.
 */
export function getDifferenceDaysBetweenDates(date1, date2) {
    return date2.diff(date1, "day");
}