/* eslint-disable flowtype/no-types-missing-file-annotation */
/* eslint-disable react/prop-types */
import React from 'react';
import {AutoSizer, Column, Table, WindowScroller} from 'react-virtualized';
import {formatAmount, formatDate} from '../Utils/Utils';
import 'react-virtualized/styles.css';

/**
 * react-virtualized обёртка для таблиы.
 */
const VirtualizedTable = (props) => {
    return (
        <WindowScroller>
            {({height, isScrolling, onChildScroll, scrollTop}) => (
                <AutoSizer disableHeight>
                    {({width}) => (
                        <Table
                            autoHeight
                            width={width}
                            height={height}
                            isScrolling={isScrolling}
                            onScroll={onChildScroll}
                            scrollTop={scrollTop}
                            {...props}
                        />
                    )}
                </AutoSizer>
            )}
        </WindowScroller>
    );
};

/**
 * Отрисовывает содержимое ячейки таблицы.
 *
 * @param {*} cellData Контент ячейки.
 */
const Cell = ({cellData}) => {
    return cellData;
};

/**
 * Компонент таблица для вывода графика платежей с разбивкой по дням на основе react-virtualized.
 *
 * @param {number} monthsCount Количество месяцев.
 * @param {Payment[]} payments Платежи.
 */
export const VTable = ({monthsCount, payments}) => {
    const rows = [];

    for (let i = 0; i < monthsCount; i++) {
        const payment: Payment = payments[i];
        const days = payment.days;
        const daysCount = days.length;

        for (let y = 0; y < daysCount; y++) {
            const day = days[y];

            rows.push({
                number: '-',
                date: <span>{formatDate(payment.date.subtract(daysCount - y, 'day'))}</span>,
                percents: <span>+{formatAmount(day.percentsPerDay)}, <span className="red">{formatAmount(day.percentsByDay)}</span></span>,
                bodyPayment: '-',
                amount: '-',
                currentCreditBody: '-',
            });
        }

        rows.push({
            number: payment.number,
            date: <span><u><b>{formatDate(payment.date)}</b></u></span>,
            percents: <span><b className="red">{formatAmount(payment.percents)}</b></span>,
            bodyPayment: <span><b className="green">{formatAmount(payment.bodyPayment)}</b></span>,
            amount: <span><u><b>{formatAmount(payment.amount)}</b></u></span>,
            currentCreditBody: <span><b className="green">{formatAmount(payment.currentCreditBody)}</b></span>,
        });
    }

    return (
        <VirtualizedTable
            rowHeight={40}
            headerHeight={50}
            rowCount={rows.length}
            rowGetter={({index}) => rows[index]}
        >
            <Column label='№ платежа' dataKey='number' width={100} cellRenderer={Cell} />
            <Column label='Дата' dataKey='date' width={100} cellRenderer={Cell} />
            <Column label='Проценты' dataKey='percents' width={150} cellRenderer={Cell} />
            <Column label='Основной долг' dataKey='bodyPayment' width={150} cellRenderer={Cell} />
            <Column label='К оплате' dataKey='amount' width={150} cellRenderer={Cell} />
            <Column label='Остаток долга' dataKey='currentCreditBody' width={150} cellRenderer={Cell} />
        </VirtualizedTable>
    );
};
