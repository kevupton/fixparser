import { MessageListItem } from './MessageListItem';
import { Message } from '../../../src/FIXParserBrowser';

type MessageListProps = {
    messages: Message[];
    selectedMessage: Message;
    onSelectMessage: (message: Message) => any;
};

export function MessageList({ messages, selectedMessage, onSelectMessage }: MessageListProps): JSX.Element {
    const renderItems = (): JSX.Element[] | null => {
        if (messages.length > 0 && messages[0].data.length === 0) {
            return null;
        }
        return messages.map((message, key) => (
            <MessageListItem
                key={`message_${key}`}
                selected={selectedMessage === message}
                onSelectMessage={onSelectMessage}
                message={message}
            />
        ));
    };

    return (
        <table className="uk-table uk-table-small uk-table-divider uk-table-hover uk-table-middle uk-background-muted fixed-height-table">
            <thead>
                <tr>
                    <td colSpan={5} className="no-padding">
                        <div className="uk-alert-muted" uk-alert="true">
                            <h3>Timeline</h3>
                            Click on a list item below to see FIX message details.
                        </div>
                    </td>
                </tr>
            </thead>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Sender</th>
                    <th>Target</th>
                    <th>Order Id</th>
                    <th>Type</th>
                    <th>Detail</th>
                </tr>
            </thead>
            <tbody>{renderItems()}</tbody>
        </table>
    );
}
