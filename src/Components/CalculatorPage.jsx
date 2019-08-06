import React from 'react';
import {Button, Form, Icon, Input, Popup, Segment, Table} from 'semantic-ui-react';
import DatePicker from "react-datepicker";
import {formatAmount, formatDate} from '../Utils/Utils';
import {Calculator} from '../Models/Calculator';
import "react-datepicker/dist/react-datepicker.css";

/**
 * http://mobile-testing.ru/loancalc/rachet_dosrochnogo_pogashenia/
 */
export class CalculatorPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            // Инстанс калькулятора
            calculator: null,
            // Значение инпута Сумма кредита
            creditAmount: '',
            // Значение инпута Процентная ставка
            rate: '',
            // Значение инпута Количество месяцев
            monthsCount: '',
            // Значение инпута Дата платежа
            startDate: new Date(),
            // Значение инпута Сумма ежемесячного досрочного погашения
            monthlyRepayment: 0,

            showCalculateButton: false,
            showResult: false
        };
    }

    /**
     * Вычисляет необходимость отображения кнопки "Рассчитать".
     */
    checkCalculateButtonVisbility() {
        const {rate, creditAmount, monthsCount, startDate} = this.state;

        if (rate !== '' && creditAmount !== '' && monthsCount !== '' && startDate !== '') {
            this.setState({
                showCalculateButton: true
            });
        }
    }

    /**
     * Обработчик изменения значения в поле Сумма кредита.
     */
    handleCreditAmountChange = (event) => {
        this.setState({
            creditAmount: event.target.value
        }, this.checkCalculateButtonVisbility);
    }

    /**
     * Обработчик изменения значения в поле Процентная ставка.
     */
    handleRateChange = (event) => {
        this.setState({
            rate: event.target.value.replace(',', '.')
        }, this.checkCalculateButtonVisbility);
    }

    /**
     * Обработчик изменения значения в поле Количество месяцев.
     */
    handleMonthsCountChange = (event) => {
        this.setState({
            monthsCount: event.target.value
        }, this.checkCalculateButtonVisbility);
    }

    /**
     * Обработчик изменения значения в поле Сумма ежемесячного досрочного погашения.
     */
    handleMonthlyRepaymentChange = (event) => {
        this.setState({
            monthlyRepayment: event.target.value
        });
    }

    /**
     * Обработчик изменения значения в поле Дата первого ежемесячного платежа.
     */
    handleDateChange = (startDate) => {
        this.setState({
            startDate
        }, this.checkCalculateButtonVisbility);
    }

    /**
     * Обработчик нажатия на кнопку "Рассчитать".
     */
    handleCalculateButtonClick = () => {
        const {
            creditAmount,
            rate,
            monthsCount,
            startDate,
            monthlyRepayment = 0
        } = this.state;

        const calculator = new Calculator(
            parseFloat(creditAmount),
            parseFloat(rate),
            parseInt(monthsCount),
            startDate,
            parseFloat(monthlyRepayment)
        );

        this.setState({
            calculator,
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
            monthlyRepayment,
            showCalculateButton,
        } = this.state;

        return (
            <Segment>
                <Form>
                    <Form.Field>
                        <label>Сумма кредита:</label>
                        <Input
                            label={{basic: true, content: '₽'}}
                            labelPosition='right'
                            placeholder='Например: 2 500 000'
                            value={creditAmount}
                            onChange={this.handleCreditAmountChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Процентная ставка:</label>
                        <Input
                            label={{basic: true, content: '%'}}
                            labelPosition='right'
                            placeholder='Например: 10,1'
                            value={rate}
                            onChange={this.handleRateChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Срок кредита (в месяцах):</label>
                        <Input
                            label={monthsCount ? {
                                basic: true,
                                content: `${Math.floor(monthsCount / 12)} лет`
                            } : null}
                            // labelPosition='right'
                            placeholder="Например: 300"
                            value={monthsCount}
                            onChange={this.handleMonthsCountChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Дата первого платежа:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={this.handleDateChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>
                            Сумма ежемесячного досрочного погашения:
                            <Popup
                                content='Сумма, которую вы будете вносить сверх ежемесячного платежа в день ежемесячного платежа'
                                trigger={<Icon name='info circle' />}
                            />
                        </label>
                        <Input
                            label={{basic: true, content: '₽'}}
                            labelPosition='right'
                            placeholder='Например: 5 000'
                            value={monthlyRepayment}
                            onChange={this.handleMonthlyRepaymentChange}
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
        const {calculator} = this.state;
        const totalAmount = calculator.getTotalAmount();
        const creditAmount = calculator.getCreditAmount();
        const monthsCount = calculator.getMonthsCount();
        const totalPercents = totalAmount - creditAmount;


        return (
            <Segment>
                <Table celled>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>Общая сумма выплат:</Table.Cell>
                            <Table.Cell>{formatAmount(totalAmount)}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Из них процентов:</Table.Cell>
                            <Table.Cell>{formatAmount(totalPercents)}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Срок ипотеки (в месяцах):</Table.Cell>
                            <Table.Cell>{`${monthsCount} (${Math.floor(monthsCount / 12)} лет)`}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Segment>
        );
    }

    /**
     * Рисует строки таблицы с результатом.
     */
    renderResultRows() {
        const {calculator} = this.state;
        const payments = calculator.getPayments();
        const rows = [];

        for (let i = 0; i < calculator.getMonthsCount(); i++) {
            const payment = payments[i];

            const repaymentInMonth = payment.repayments.length > 0 ?
                payment.repayments[0][formatAmount(payment.date)] :
                0
                ;

            rows.push(
                <Table.Row key={payment.date}>
                    <Table.Cell>{payment.number}</Table.Cell>
                    <Table.Cell>{formatDate(payment.date)}</Table.Cell>
                    <Table.Cell>{formatAmount(payment.amount)}</Table.Cell>
                    <Table.Cell>{formatAmount(payment.percents)}</Table.Cell>
                    <Table.Cell>{formatAmount(payment.bodyPayment)}</Table.Cell>
                    <Table.Cell>{formatAmount(repaymentInMonth)}</Table.Cell>
                    <Table.Cell>{formatAmount(payment.currentCreditBody)}</Table.Cell>
                </Table.Row>
            );
        }

        return rows;
    }

    /**
     * Рисует таблицу с результатами.
     */
    renderResultTable() {
        return (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Номер платежа</Table.HeaderCell>
                        <Table.HeaderCell>Дата платежа</Table.HeaderCell>
                        <Table.HeaderCell>Сумма платежа</Table.HeaderCell>
                        <Table.HeaderCell>Проценты за текущий месяц</Table.HeaderCell>
                        <Table.HeaderCell>Плата в счёт тела кредита</Table.HeaderCell>
                        <Table.HeaderCell>Сумма досрочного погашения в этом месяце</Table.HeaderCell>
                        <Table.HeaderCell>Тело кредита</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>{this.renderResultRows()}</Table.Body>
            </Table>
        );
    }

    render() {
        const {showResult} = this.state;

        return (
            <div className="calculator-page">
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