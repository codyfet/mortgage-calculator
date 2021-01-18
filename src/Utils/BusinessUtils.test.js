import {calculatePayments} from "./BusinessUtils";

describe('Блок проверок для массива платижей', () => {
    const payments = calculatePayments(
        new Date(2021, 0, 19),
        500000,
        17016.051776058586,
        0,
        36,
        13.7
    );

    test('Всего выплат 36', () => {
        expect(payments.length).toBe(36);
    });

    test('Первая выплата. Сумма ежемесячного платежа равна 17016.051776058586', () => {
        expect(payments[0].amount).toBe(17016.051776058586);
    });

    test('Первая выплата. Сумма части платежа, идущей на погашение основного долга равна 11198.243556880505', () => {
        expect(payments[0].bodyPayment).toBe(11198.243556880505);
    });

    test('Первая выплата. Проценты за месяц равны 5817.808219178082', () => {
        expect(payments[0].percents).toBe(5817.808219178082);
    });

    test('Первая выплата. Тело долга равно 488801.7564431195', () => {
        expect(payments[0].currentCreditBody).toBe(488801.7564431195);
    });

    test('Вторая выплата. Тело долга равно 476922.8102498439', () => {
        expect(payments[1].currentCreditBody).toBe(476922.8102498439);
    });

    test('Последняя выплата. Тело долга равно 0', () => {
        expect(payments[35].currentCreditBody).toBe(0);
    });
});
