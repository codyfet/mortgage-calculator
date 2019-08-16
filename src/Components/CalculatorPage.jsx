// @flow
import * as React from 'react';
import {Button, Form, Icon, Input, Popup, Segment, Table} from 'semantic-ui-react';
import DatePicker from "react-datepicker";
import {formatAmount, formatDate} from '../Utils/Utils';
import {getRepaymentsMonthTotal} from '../Utils/BusinessUtils';
import {Calculator} from '../Models/Calculator';
import "react-datepicker/dist/react-datepicker.css";

type Props = {

};

/**
 * @property {bject} calculator Инстанс калькулятора.
 * @property {string} creditAmount Значение инпута Сумма кредита.
 * @property {string} rate Значение инпута Процентная ставка.
 * @property {string} monthsCount Значение инпута Количество месяцев.
 * @property {Date} startDate Значение инпута Дата платежа.
 * @property {string} monthlyRepayment Значение инпута Сумма ежемесячного досрочного погашения.
 * @property {boolean} showCalculateButton Признак отоборажения кнопки "Рассчитать".
 * @property {boolean} showResult Признако отображения результатов расчетов..
 */
type State = {
    calculator: Object;
    creditAmount: string;
    rate: string;
    monthsCount: string;
    startDate: Date;
    monthlyRepayment: string;
    showCalculateButton: boolean;
    showResult: boolean;
};

/**
 * Компонент Страница с ипотечным калькулятором.
 *
 * Формула и описание можно помотерть здесь http://mobile-testing.ru/loancalc/rachet_dosrochnogo_pogashenia/.
 */
export class CalculatorPage extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            calculator: null,
            creditAmount: '',
            rate: '',
            monthsCount: '',
            startDate: new Date(),
            monthlyRepayment: '0',
            showCalculateButton: false,
            showResult: false
        };
    }

    /**
     * Вычисляет необходимость отображения кнопки "Рассчитать".
     */
    checkCalculateButtonVisbility () {
        const {rate, creditAmount, monthsCount, startDate} = this.state;

        if (rate !== '' && creditAmount !== '' && monthsCount !== '' && startDate !== '') {
            this.setState({
                showCalculateButton: true
            });
        }
    }

    /**
     * Обработчик изменения значения в поле Сумма кредита.
     *
     * @param {SyntheticEvent<HTMLButtonElement>} event Событие.
     */
    handleCreditAmountChange = (event: SyntheticEvent<HTMLButtonElement>) => {
        this.setState({
            creditAmount: event.currentTarget.value
        }, this.checkCalculateButtonVisbility);
    }

    /**
     * Обработчик изменения значения в поле Процентная ставка.
     *
     * @param {SyntheticEvent<HTMLButtonElement>} event Событие.
     */
    handleRateChange = (event: SyntheticEvent<HTMLButtonElement>) => {
        const {value} = event.currentTarget;

        if (isNaN(value)) {
            return;
        }

        this.setState({
            rate: value
        }, this.checkCalculateButtonVisbility);
    }

    /**
     * Обработчик изменения значения в поле Количество месяцев.
     *
     * @param {SyntheticEvent<HTMLButtonElement>} event Событие.
     */
    handleMonthsCountChange = (event: SyntheticEvent<HTMLButtonElement>) => {
        this.setState({
            monthsCount: event.currentTarget.value
        }, this.checkCalculateButtonVisbility);
    }

    /**
     * Обработчик изменения значения в поле Сумма ежемесячного досрочного погашения.
     *
     * @param {SyntheticEvent<HTMLButtonElement>} event Событие.
     */
    handleMonthlyRepaymentChange = (event: SyntheticEvent<HTMLButtonElement>) => {
        this.setState({
            monthlyRepayment: event.currentTarget.value || "0"
        });
    }

    /**
     * Обработчик изменения значения в поле Дата первого ежемесячного платежа.
     */
    handleDateChange = (startDate: Date) => {
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

        const calculator: Calculator = new Calculator(
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
     * Рисует сайдбар.
     */
    renderSidebar () {
        return (
            <div className="sidebar">
                {/* Блок для ввода значений */}
                {this.renderInputPanel()}
            </div>
        );
    }

    /**
     * Рисует блок с таблицей.
     */
    renderTableView () {
        const {showResult} = this.state;

        return (
            <div className="tableview">
                {/* Панель с результатом */}
                {showResult && this.renderResultPanel()}

                {/* Таблица с результатом */}
                {showResult && this.renderResultTable()}
            </div>
        );
    }

    /**
     * Рисует панель с исходными данными.
     */
    renderInputPanel () {
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
                    <Form.Field required>
                        <label>Сумма кредита</label>
                        <Input
                            label={{basic: true, content: '₽'}}
                            labelPosition='right'
                            placeholder='Введите сумму'
                            value={creditAmount}
                            onChange={this.handleCreditAmountChange}
                        />
                    </Form.Field>
                    <Form.Field required>
                        <label>Процентная ставка</label>
                        <Input
                            label={{basic: true, content: '%'}}
                            labelPosition='right'
                            placeholder='Введите ставку'
                            value={rate}
                            onChange={this.handleRateChange}
                        />
                    </Form.Field>
                    <Form.Field required>
                        <label>Срок кредита (в месяцах)</label>
                        <Input
                            // label={monthsCount ? {
                            //     basic: true,
                            //     content: `${Math.floor(parseInt(monthsCount) / 12)} лет`
                            // } : null}
                            placeholder="Введите срок"
                            value={monthsCount}
                            onChange={this.handleMonthsCountChange}
                        />
                    </Form.Field>
                    <Form.Field required>
                        <label>Дата первого платежа</label>
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            selected={startDate}
                            onChange={this.handleDateChange}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>
                            Сумма ежемесячного досрочного погашения
                            <Popup
                                content='Сумма досрочного погашения, которую можно внести в день ежемесячного платежа'
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
    renderResultPanel () {
        const {calculator} = this.state;
        const totalAmount = calculator.getTotalAmount();
        const creditAmount = calculator.getCreditAmount();
        const monthsCount = calculator.getMonthsCount();
        const paymentAmount = calculator.getPaymentAmount();
        const monthlyRepayment = calculator.getMonthlyRepayment();
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
                            <Table.Cell>Срок ипотеки:</Table.Cell>
                            <Table.Cell>{`${monthsCount} мес. (${Math.floor(monthsCount / 12)} лет)`}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Ежемесячный платёж:</Table.Cell>
                            <Table.Cell>{formatAmount(paymentAmount + monthlyRepayment)}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Segment>
        );
    }

    /**
     * Рисует строки таблицы с результатом.
     */
    renderResultRows () {
        const {calculator} = this.state;
        const payments = calculator.getPayments();
        const rows = [];

        for (let i = 0; i < calculator.getMonthsCount(); i++) {
            const payment = payments[i];
            const repaymentInMonth = getRepaymentsMonthTotal(payment.repayments);

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
    renderResultTable () {
        return (
            <Segment>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>№</Table.HeaderCell>
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
            </Segment>
        );
    }

    render () {
        return (
            <div className="calculator-page">
                {this.renderSidebar()}
                {this.renderTableView()}
            </div>
        );
    }
}