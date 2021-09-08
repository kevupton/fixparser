import { Fragment } from 'react';
import classNames from 'classnames';

import { getValue } from '../Dashboard';
import { Field, Message } from '../../../src/FIXParserBrowser';

type MessageDetailListItemProps = {
    message: Message;
    data: any;
    field: Field;
};

export function MessageDetailListItem({ message, data, field }: MessageDetailListItemProps): JSX.Element | null {
    const renderAdditionalData = (field: Field): JSX.Element | null => {
        const data: JSX.Element[] = [];
        if (!field) {
            return null;
        }
        if (getValue(field.category, 'categoryID')) {
            data.push(
                <tr key={'key_2'} className="table-border">
                    <td>
                        <strong>Category</strong>
                    </td>
                    <td>
                        {getValue(field.category, 'categoryID')}. {getValue(field.category, 'description')}
                    </td>
                </tr>,
            );
        }
        if (getValue(field.section, 'sectionID')) {
            data.push(
                <tr key={'key_3'} className="table-border">
                    <td>
                        <strong>Section</strong>
                    </td>
                    <td>
                        {getValue(field.section, 'sectionID')}. {getValue(field.section, 'description')}
                    </td>
                </tr>,
            );
        }
        if (getValue(field.enumeration, 'elaboration')) {
            data.push(
                <tr key={'key_4'} className="table-border">
                    <td>
                        <strong>Enumeration</strong>
                    </td>
                    <td>
                        {getValue(field.enumeration, 'elaboration')}. {getValue(field.enumeration, 'description')}
                    </td>
                </tr>,
            );
        }

        return data.length > 0 ? (
            <table className="uk-table uk-table-small uk-table-divider uk-table-middle table-less-margin">
                <tbody>{data}</tbody>
            </table>
        ) : null;
    };

    if (!message) {
        return null;
    }

    const description: JSX.Element | null = getValue(field.enumeration, 'description') ? (
        <span>
            <strong>{getValue(field.enumeration, 'description')}</strong>
        </span>
    ) : null;

    const isValid = (field: Field): boolean => {
        if (Number(getValue(field, 'tag')) === 9) {
            return message.bodyLengthValue === message.bodyLengthExpected;
        } else if (Number(getValue(field, 'tag')) === 10) {
            return message.checksumValue === message.checksumExpected;
        } else {
            return true;
        }
    };

    const renderExpectedValue = (field: Field): JSX.Element | null => {
        if (Number(getValue(field, 'tag')) === 10) {
            return <span className="bold">(Expected {message.checksumExpected})</span>;
        } else if (Number(getValue(field, 'tag')) === 9) {
            return <span className="bold">(Expected {message.bodyLengthExpected})</span>;
        } else {
            return null;
        }
    };

    return (
        <Fragment>
            <tr
                key={'key_0'}
                className={classNames({
                    'table-border': true,
                    'validation-valid': data.valid,
                    'validation-invalid': !isValid(field) || !data.valid,
                    'validation-not-required': data.reqd === '0',
                })}
            >
                <td>{getValue(field, 'tag')}</td>
                <td>
                    <span className="uk-badge">{getValue(field, 'name')}</span>
                </td>
                <td>
                    {getValue(field, 'value')} {isValid(field) ? null : renderExpectedValue(field)}
                </td>
                <td>{description}</td>
            </tr>
            <tr
                key={'key_1'}
                className={classNames({
                    'uk-table-divider-remove': true,
                    'validation-valid': data.valid,
                    'validation-invalid': !isValid(field) || !data.valid,
                    'validation-not-required': data.reqd === '0',
                })}
            >
                <td colSpan={5} className="uk-text-muted">
                    {getValue(field, 'description')}
                    {renderAdditionalData(field)}
                </td>
            </tr>
        </Fragment>
    );
}
