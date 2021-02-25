// @flow
import * as React from 'react';
import {connect} from 'react-redux';
import {initCalculation} from '../Actions/Actions';
import {Button, Form, Input, Segment, Table} from 'semantic-ui-react';
import DatePicker from "react-datepicker";
import {formatAmount, formatDate} from '../Utils/Utils';
import {getTotalAmount} from '../Utils/BusinessUtils';
import type {Dispatch, Payment, ReduxState} from '../Models/Models';
import "react-datepicker/dist/react-datepicker.css";

type StateProps = {
    creditAmount: number;
    rate: number;
    monthsCount: number;
    startDate: Date;
    defaultMonthlyRepayment: number;
    paymentAmount: number;
    payments: Payment[];
}

type DispatchProps = {
    initCalculation: (
        creditAmount: number,
        rate: number,
        monthsCount: number,
        startDate: Date,
        defaultMonthlyRepayment: number
    ) => void;
}

type TProps = StateProps & DispatchProps;

/**
 * @property {string} creditAmount Значение инпута Сумма кредита.
 * @property {string} rate Значение инпута Процентная ставка.
 * @property {string} monthsCount Значение инпута Количество месяцев.
 * @property {Date} startDate Значение инпута Дата открытия договора.
 * @property {string} defaultMonthlyRepayment Значение инпута Сумма ежемесячного досрочного погашения.
 * @property {boolean} showCalculateButton Признак отоборажения кнопки "Рассчитать".
 * @property {boolean} showResult Признако отображения результатов расчетов.
 */
type State = {
    creditAmount: string;
    rate: string;
    monthsCount: string;
    startDate: Date;
    defaultMonthlyRepayment: string;
    showCalculateButton: boolean;
    showResult: boolean;
};

/**
 * Компонент Страница с ипотечным калькулятором.
 *
 * Формула и описание можно посмотреть здесь http://mobile-testing.ru/loancalc/rachet_dosrochnogo_pogashenia/.
 */
export class CalculatorPage extends React.Component<TProps, State> {

    constructor(props: TProps) {
        super(props);

        this.state = {
            creditAmount: '',
            rate: '',
            monthsCount: '',
            startDate: new Date(),
            defaultMonthlyRepayment: '0',
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
            defaultMonthlyRepayment: event.currentTarget.value || "0"
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
            defaultMonthlyRepayment = 0
        } = this.state;

        this.props.initCalculation(
            parseFloat(creditAmount),
            parseFloat(rate),
            parseInt(monthsCount),
            startDate,
            parseFloat(defaultMonthlyRepayment)
        );

        this.setState({
            showResult: true
        });
    }

    /**
     * Обработчик нажатия на кнопку "редактировать" в поле Сумма досрочного погашения в месяц.
     *
     * @param {SyntheticEvent<HTMLElement>} event Событие.
     */
    // handleEditRepaymentClick = (event: SyntheticEvent<HTMLElement>) => {
    //     const editableRepaymentIndex: number = parseInt(event.target.closest('tr').getAttribute('index'));

    //     this.setState({editableRepaymentIndex});
    // }

    /**
     * Обработчик событя 'блюр' для инпут поля ввода досрочного платежа.
     *
     * @param {SyntheticEvent<HTMLInputElement>} event Событие.
     */
    // handleRepaymentFieldBlur = (event: SyntheticEvent<HTMLInputElement>) => {
    //     const {updateRepaymentForMonth} = this.props;
    //     const {editableRepaymentIndex} = this.state;
    //     const {value} = event.currentTarget;

    //     if (isNil(editableRepaymentIndex)) {
    //         return;
    //     }

    //     this.setState({
    //         editableRepaymentIndex: null
    //     }, () => updateRepaymentForMonth(editableRepaymentIndex - 1, parseFloat(value)));
    // }

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
                            placeholder="Введите срок"
                            value={monthsCount}
                            onChange={this.handleMonthsCountChange}
                        />
                    </Form.Field>
                    <Form.Field required>
                        <label>Дата открытия договора</label>
                        <DatePicker
                            dateFormat="dd/MM/yyyy"
                            selected={startDate}
                            onChange={this.handleDateChange}
                        />
                    </Form.Field>
                    {/*
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
                            value={defaultMonthlyRepayment}
                            onChange={this.handleMonthlyRepaymentChange}
                        />
                    </Form.Field>
                    */}
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
        const {creditAmount, monthsCount, paymentAmount, defaultMonthlyRepayment, payments} = this.props;
        const totalAmount: number = getTotalAmount(payments);
        const totalPercents: number = totalAmount - creditAmount;

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
                            <Table.Cell><span className="red">{formatAmount(totalPercents)}</span></Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Долг:</Table.Cell>
                            <Table.Cell><span className="green">{formatAmount(creditAmount)}</span></Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Срок кредита:</Table.Cell>
                            <Table.Cell>{`${monthsCount} мес. (${Math.floor(monthsCount / 12)} лет)`}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Ежемесячный платёж:</Table.Cell>
                            <Table.Cell>{formatAmount(paymentAmount + defaultMonthlyRepayment)}</Table.Cell>
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
        const {monthsCount, payments} = this.props;
        const rows = [];

        for (let i = 0; i < monthsCount; i++) {
            const payment: Payment = payments[i];
            // const repaymentsInMonth: number = getRepaymentsMonthTotal(payment.repayments);

            const days = payment.days;
            const daysCount = days.length;

            for (let y = 0; y < daysCount; y++) {
                const day = days[y];

                rows.push(
                    <Table.Row key={`${+payment.date}__${day.number}`}>
                        <Table.Cell>-</Table.Cell>
                        <Table.Cell>{formatDate(payment.date.subtract(daysCount - y, 'day'))}</Table.Cell>
                        <Table.Cell>+{formatAmount(day.percentsPerDay)}, <span className="red">{formatAmount(day.percentsByDay)}</span></Table.Cell>
                        <Table.Cell>-</Table.Cell>
                        <Table.Cell>-</Table.Cell>
                        <Table.Cell>-</Table.Cell>
                        {/* <Table.Cell>{formatAmount(payment.currentCreditBody)}</Table.Cell> */}
                    </Table.Row>
                );
            }

            rows.push(
                <Table.Row key={+payment.date} index={i} >
                    <Table.Cell>{payment.number}</Table.Cell>
                    <Table.Cell><u><b>{formatDate(payment.date)}</b></u></Table.Cell>
                    <Table.Cell><b className="red">{formatAmount(payment.percents)}</b></Table.Cell>
                    <Table.Cell><b className="green">{formatAmount(payment.bodyPayment)}</b></Table.Cell>
                    <Table.Cell><u><b>{formatAmount(payment.amount)}</b></u></Table.Cell>
                    {/*
                    <Table.Cell>{formatAmount(repaymentsInMonth)}</Table.Cell>
                    Редактируемое поле для изменения суммы досрочного платежа.
                    <Table.Cell>
                        <RepaymentCell
                            disabled={i === 0}
                            editable={isRepaymentEditable}
                            repaymentsInMonth={repaymentsInMonth}
                            prevPaymentDate={prevPaymentDate}
                            onEditClick={this.handleEditRepaymentClick}
                            onRepaymentBlur={this.handleRepaymentFieldBlur}
                        />
                    </Table.Cell>
                     */}
                    <Table.Cell><b className="green">{formatAmount(payment.currentCreditBody)}</b></Table.Cell>
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
                            <Table.HeaderCell>№ платежа</Table.HeaderCell>
                            <Table.HeaderCell>Дата</Table.HeaderCell>
                            <Table.HeaderCell>Проценты</Table.HeaderCell>
                            <Table.HeaderCell>Основной долг</Table.HeaderCell>
                            <Table.HeaderCell>К оплате</Table.HeaderCell>
                            {/* <Table.HeaderCell>Сумма досрочного погашения в этом месяце</Table.HeaderCell> */}
                            <Table.HeaderCell>Остаток долга</Table.HeaderCell>
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

const mapStateToProps = (state: ReduxState): StateProps => {
    const {creditAmount, rate, monthsCount, startDate, defaultMonthlyRepayment, paymentAmount, payments} = state;

    return {
        creditAmount,
        rate,
        monthsCount,
        startDate,
        defaultMonthlyRepayment,
        paymentAmount,
        payments
    };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    initCalculation: (
        creditAmount: number,
        rate: number,
        monthsCount: number,
        startDate: Date,
        defaultMonthlyRepayment: number
    ) => dispatch(initCalculation(
        creditAmount,
        rate,
        monthsCount,
        startDate,
        defaultMonthlyRepayment
    ))
});

export default connect(mapStateToProps, mapDispatchToProps)(CalculatorPage);