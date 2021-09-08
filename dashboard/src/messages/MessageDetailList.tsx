import { ChangeEvent, useState } from 'react';
import ReactJson from 'react-json-view';

import { FIXParser, Fields, Field, Message } from '../../../src/FIXParserBrowser';
import { MessageDetailListItem } from './MessageDetailListItem';
import { getValue } from '../Dashboard';

type MessageDetailListProps = {
    message: Message;
    parser: FIXParser;
};

export function MessageDetailList({ message, parser }: MessageDetailListProps): JSX.Element | null {
    const [requiredFieldsOnly, setRequiredFieldsOnly] = useState(true);
    const [viewType, setViewType] = useState('grid');

    const toggleView = () => {
        if (viewType === 'grid') {
            setViewType('json');
        } else {
            setViewType('grid');
        }
    };

    const renderItems = (): JSX.Element[] => {
        const filteredItems = requiredFieldsOnly
            ? message.validate().filter((item: any) => {
                  if (item.spec && item.spec.components && item.spec.components.length > 0) {
                      item.spec.components = item.spec.components.filter((subItem: any) => subItem.reqd === '1');
                  }
                  return item.hasValue || item.reqd === '1';
              })
            : message.validate();

        return filteredItems.map((item: any, index: number) => {
            let field: Field;
            if (item.field) {
                field = item.field;
            } else {
                field = new Field(item.tagText, '<MISSING VALUE>');
                parser.fixParserBase.fields.processField(message, field);
            }
            return <MessageDetailListItem key={`data_${index}`} data={item} field={field} message={message} />;
        });
    };

    const onChangeCheckbox = (event: ChangeEvent<HTMLInputElement>): void => {
        setRequiredFieldsOnly(event.target.checked);
    };

    if (!message) {
        return null;
    }

    let messageDescription: string = 'FIX message details';
    let messageElaboration: string = 'Click on a FIX message in the left grid to see individual message components.';
    const messageType: Field | undefined = message.getField(Fields.MsgType);
    if (messageType && messageType.tag) {
        messageDescription = getValue(message.getEnum(messageType.tag, messageType.value), 'Description');
    }
    if (messageType && messageType.value) {
        messageElaboration = getValue(message.getEnum(messageType.tag, messageType.value), 'Elaboration');
    }

    return (
        <table className="uk-table uk-table-small uk-table-divider uk-table-middle fixed-height-table">
            <thead>
                <tr>
                    <td colSpan={4} className="no-padding">
                        <div className="uk-alert-primary" uk-alert="true">
                            <h3>{messageDescription}</h3>
                            <p>{messageElaboration}</p>
                            <input
                                type="checkbox"
                                defaultChecked={requiredFieldsOnly}
                                onChange={onChangeCheckbox}
                            />{' '}
                            Validate required fields only
                            <br />
                            <br />
                            <button className="uk-button uk-button-primary uk-button-small" onClick={toggleView}>
                                {viewType === 'grid' ? 'View Raw Data' : 'View as table'}
                            </button>
                        </div>
                    </td>
                </tr>
            </thead>
            {viewType === 'grid' ? (
                <>
                    <thead>
                        <tr>
                            <th>Tag</th>
                            <th>Name</th>
                            <th>Value</th>
                            <th>Enumeration</th>
                        </tr>
                    </thead>
                    <tbody>{renderItems()}</tbody>
                </>
            ) : (
                <tbody>
                    <tr>
                        <td colSpan={4} className="no-padding">
                            <ReactJson src={message} collapsed={1} quotesOnKeys={false} />
                        </td>
                    </tr>
                </tbody>
            )}
        </table>
    );
}
