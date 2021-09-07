import {
    EncryptMethod,
    Field,
    Fields,
    FIXParser,
    HandlInst,
    LicenseManager,
    Message,
    Messages,
    OrderTypes,
    Side,
    TimeInForce,
} from '../src/FIXParser'; // from 'fixparser';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const fixParser = new FIXParser();
const SENDER = 'CLIENT';
const TARGET = 'SERVER';

fixParser.connect({
    host: 'localhost',
    port: 9878,
    protocol: 'tcp',
    sender: SENDER,
    target: TARGET,
    fixVersion: 'FIX.4.4',
    logging: true,
    onOpen: () => {
        console.log('Open');
        sendLogon();

        // Send some orders
        sendOrders();

        // Ask to Resend
        setTimeout(() => {
            const resendRequest = fixParser.createMessage(
                new Field(Fields.MsgType, Messages.ResendRequest),
                new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
                new Field(Fields.SenderCompID, SENDER),
                new Field(Fields.SendingTime, fixParser.getTimestamp()),
                new Field(Fields.TargetCompID, TARGET),
                new Field(Fields.BeginSeqNo, 4),
                new Field(Fields.EndSeqNo, 7),
            );
            const messages = fixParser.parse(resendRequest.encode());
            console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
            fixParser.send(resendRequest);
        }, 10000);
    },
    onMessage: (message: Message) => console.log('received message', message.description, message.messageString),
    onClose: () => console.log('Disconnected'),
});

const sendLogon = () => {
    const logon = fixParser.createMessage(
        new Field(Fields.MsgType, Messages.Logon),
        new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.SendingTime, fixParser.getTimestamp()),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.ResetSeqNumFlag, 'Y'),
        new Field(Fields.EncryptMethod, EncryptMethod.None),
        new Field(Fields.HeartBtInt, 60),
    );
    const messages = fixParser.parse(logon.encode());
    console.log('sending message', messages[0].description, messages[0].messageString);
    fixParser.send(logon);
};

const sendOrders = () => {
    ['order1', 'order2', 'order3', 'order4', 'order5', 'order6'].forEach((orderId: string, index: number) => {
        const order = fixParser.createMessage(
            new Field(Fields.MsgType, Messages.NewOrderSingle),
            new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
            new Field(Fields.SenderCompID, SENDER),
            new Field(Fields.SendingTime, fixParser.getTimestamp()),
            new Field(Fields.TargetCompID, TARGET),
            new Field(Fields.ClOrdID, orderId),
            new Field(Fields.HandlInst, HandlInst.AutomatedExecutionNoIntervention),
            new Field(Fields.OrderQty, 1000 * index),
            new Field(Fields.Price, 300 * index),
            new Field(Fields.TransactTime, fixParser.getTimestamp()),
            new Field(Fields.OrdType, OrderTypes.Market),
            new Field(Fields.Side, Side.Buy),
            new Field(Fields.Symbol, `${(index + 1) * 100}.HK`),
            new Field(Fields.TimeInForce, TimeInForce.Day),
        );
        const messages = fixParser.parse(order.encode());
        console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
        fixParser.send(order);
    });
};
