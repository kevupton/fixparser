import classNames from 'classnames';
import moment from 'moment';

import { getValue } from '../Dashboard';
import { Field, Fields, Message } from '../../../src/FIXParserBrowser';

type MessageListItemProps = {
    message: Message;
    onSelectMessage: (message: Message) => any;
    selected: boolean;
};

export function MessageListItem({
    message,
    onSelectMessage,
    selected = false,
}: MessageListItemProps): JSX.Element | null {
    const onClickListItem = (): void => {
        onSelectMessage(message);
    };

    const renderDetail = (): JSX.Element => {
        let side = ((message.getField(Fields.Side) || {}).enumeration || {}).symbolicName;
        side = side ? side.replace('Sell', 'SL').toUpperCase() : null;
        return (
            <td>
                {message.getBriefDescription()}
                <br />
                {side ? (
                    <span
                        className={classNames({
                            'uk-badge': true,
                            buy: side.toLowerCase().indexOf('buy') > -1,
                            sell: side.toLowerCase().indexOf('sl') > -1,
                        })}
                    >
                        {side}
                    </span>
                ) : null}
            </td>
        );
    };

    if (!message) {
        return null;
    }

    let messageDescription: string | null = null;
    const messageType: Field | undefined = message.getField(Fields.MsgType);
    if (messageType && messageType.tag && messageType.value) {
        messageDescription = getValue(message.getEnum(messageType.tag, messageType.value), 'Description');
    }
    const styleObject = {
        cursor: 'pointer',
    };
    return (
        <tr onClick={onClickListItem} style={styleObject} className={classNames({ 'selected-row': selected })}>
            <td>{moment(getValue(message.getField(Fields.SendingTime)), 'YYYYMMDD-HH:mm:ss').format('HH:mm:ss')}</td>
            <td className="uk-text-truncate">{getValue(message.getField(Fields.SenderCompID))}</td>
            <td className="uk-text-truncate">{getValue(message.getField(Fields.TargetCompID))}</td>
            <td className="uk-text-truncate">{getValue(message.getField(Fields.ClOrdID))}</td>
            <td>{messageDescription}</td>
            {renderDetail()}
        </tr>
    );
}
