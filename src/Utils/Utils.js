/**
 * Вовращает дату в формате MM.DD.YYYY.
 *
 * https://stackoverflow.com/questions/12409299/how-to-get-current-formatted-date-dd-mm-yyyy-in-javascript-and-append-it-to-an-i
 *
 * @param {Date} date Значение типа Date.
 */
export function formatDate(date) {
    let dd = date.getDate();
    let mm = date.getMonth() + 1; // January is 0!
    const yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    return dd + '.' + mm + '.' + yyyy;
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
 * @param {Date} date1 Первая дата.
 * @param {Date} date2 Вторая дата.
 */
export function getDifferenceDaysBetweenDates(date1, date2) {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}