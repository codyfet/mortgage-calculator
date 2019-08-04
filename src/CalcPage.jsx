import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { Label, Table, Segment } from 'semantic-ui-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDate, formatAmount } from './Utils/Utils';

/**
 * http://mobile-testing.ru/loancalc/rachet_dosrochnogo_pogashenia/
 */

export class CalcPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            // Сумма кредита
            creditAmount: '',
            // Процентная ставка
            rate: '',
            // Количество месяцев
            monthsCount: '',
            // Дата платежа
            startDate: new Date(),

            showCalculateButton: false,
            showResult: false
        }
    }

    getPayment() {
        const i = this.getMonthRate();
        const n = this.getMonthsCount();
        const a = this.getCreditAmount();

        const payment = a * (
            i * Math.pow((1 + i), n)
        ) / (
                Math.pow((1 + i), n) - 1
            );

        return payment;
    }

    /**
     * Возвращает процентную ставку по займу в месяц.
     */
    getMonthRate() {
        // Умножаем на 0.01, чтобы преобразовать к сотым долям: 12 % => 0.12 %
        // Т.к. указана годовая ставка, необходимо разделить её на 12, чтобы получить ставку в месяц.
        return (parseFloat(this.state.rate) * 0.01) / 12;
    }

    /**
     * Возвращает количетво месяцев, на которые производится расчёт.
     */
    getMonthsCount() {
        return parseInt(this.state.monthsCount);
    }

    /**
     * Возвращает количетво месяцев, на которые производится расчёт.
     */
    getCreditAmount() {
        return parseInt(this.state.creditAmount);
    }

    checkCalculateButtonVisbility() {
        const { rate, creditAmount, monthsCount, startDate } = this.state;

        if (rate !== '' && creditAmount !== '' && monthsCount !== '' && startDate !== '') {
            this.setState({
                showCalculateButton: true
            })
        }
    }

    handleCreditAmountChange = (event) => {
        this.setState({
            creditAmount: event.target.value
        }, this.checkCalculateButtonVisbility);
    }

    handleRateChange = (event) => {
        this.setState({
            rate: event.target.value
        }, this.checkCalculateButtonVisbility);
    }

    handleMonthsCountChange = (event) => {
        this.setState({
            monthsCount: event.target.value
        }, this.checkCalculateButtonVisbility);
    }

    handleDateChange = (startDate) => {
        this.setState({
            startDate
        }, this.checkCalculateButtonVisbility);
    }

    handleCalculateButtonClick = () => {
        this.setState({
            showResult: true
        });
    }

    /**
     * Рисует панель с исходными данными.
     */
    renderInputPanel() {
        const {
            rate,
            creditAmount,
            monthsCount,
            startDate,
            showCalculateButton,
        } = this.state;

        return (
            <Segment>
                <Form>
                    <Form.Field>
                        <label>Сумма кредита:</label>
                        <input placeholder="Например: 2 500 000" value={creditAmount} onChange={this.handleCreditAmountChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Процентная ставка:</label>
                        <input placeholder="Например: 10,1" value={rate} onChange={this.handleRateChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Срок кредита (в месяцах):</label>
                        <input placeholder="Например: 300" value={monthsCount} onChange={this.handleMonthsCountChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Дата первого платежа:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={this.handleDateChange}
                        />
                    </Form.Field>
                    {showCalculateButton && (
                        <Button
                            type='submit'
                            onClick={this.handleCalculateButtonClick}
                        >
                            Рассчитать
                    </Button>
                    )}
                </Form>
            </Segment>
        );
    }

    /**
     * Рисует панель с результатами.
     */
    renderResultPanel() {
        const monthPayment = this.getPayment();

        return (
            <Segment>
                <Table celled>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Общая сумма выплат:</Table.Cell>
                            <Table.Cell>{formatAmount(monthPayment * this.state.monthsCount)}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Segment>
        );
    }

    /**
     * Рисует таблицу с результатами.
     */
    renderResultTable() {
        const { monthsCount, startDate } = this.state;
        const rows = [];
        const payment = this.getPayment();

        for (let i = 0; i < monthsCount; i++) {

            const paymentDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + i));

            rows.push(
                <Table.Row key={paymentDate}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell>{formatDate(paymentDate)}</Table.Cell>
                    <Table.Cell>{formatAmount(payment)}</Table.Cell>
                </Table.Row>
            );
        }

        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Номер платежа</Table.HeaderCell>
                        <Table.HeaderCell>Дата платежа</Table.HeaderCell>
                        <Table.HeaderCell>Сумма платежа</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>{rows}</Table.Body>
            </Table>
        );
    }

    render() {
        const {showResult} = this.state;

        return (
            <div className="calc-page">
                {/* Блок для ввода значений */}
                {this.renderInputPanel()}

                {/* Панель с результатом */}
                {showResult && this.renderResultPanel()}

                {/* Таблица с результатом */}
                {showResult && this.renderResultTable()}
            </div>
        );
    }
}