// @flow
import * as React from 'react';
import {Icon, Input, Popup} from 'semantic-ui-react';
import {formatAmount, formatDate} from '../Utils/Utils';

type Props = {
    disabled: boolean;
    editable: boolean;
    repaymentsInMonth: number;
    prevPaymentDate: Date;
    onEditClick: (event) => void;
    onRepaymentBlur: (event) => void;
};

type State = {
    inputValue: ?number;
}

/**
 * Компонент ячейка "Досрочное погашение".
 * Имеет два представления: editable и не-editable.
 */
export class RepaymentCell extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            inputValue: props.repaymentsInMonth
        };
    }

    handleInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
        this.setState({
            inputValue: parseInt(event.currentTarget.value)
        });
    }

    render () {
        const {disabled, editable, repaymentsInMonth, prevPaymentDate, onEditClick, onRepaymentBlur} = this.props;
        const {inputValue} = this.state;
        let content: React.Node = null;

        if (editable) {
            content = (
                <Input
                    value={inputValue}
                    onBlur={onRepaymentBlur}
                    onChange={this.handleInputChange}
                />
            );
        } else if (disabled) {
            content = (
                <div>{formatAmount(inputValue)}</div>
            );
        } else {
            content = (
                <React.Fragment>
                    <div>{formatAmount(repaymentsInMonth)}</div>
                    <div>
                        <Icon
                            name='edit'
                            className='edit'
                            onClick={onEditClick}
                        />
                        <Popup
                            content={`Эту сумму необходимо внести ${formatDate(prevPaymentDate)}`}
                            trigger={<Icon name='info circle' />}
                        />
                    </div>
                </React.Fragment>
            );
        }

        return (
            <div className="repayment-cell">
                {content}
            </div>
        );
    }
}