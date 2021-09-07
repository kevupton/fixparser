/**
 * This example will connect to the C++ QuickFIX engine.
 * Clone https://github.com/quickfix/quickfix
 * build and run ./bin/run_executor_cpp.sh.
 *
 * FIX session flow:
 * Initiator (us) connects over TCP to port 5001.
 * Upon connection, we send a Logon message. QuickFIX responds to the Logon message.
 * After an interval, we send a NewOrderSingle. QuickFIX responds with a ExecutionReport.
 */
import {
    EncryptMethod,
    Field,
    Fields,
    FIXParser,
    HandlInst,
    LicenseManager,
    Message,
    Messages,
    Options,
    OrderTypes,
    Side,
    TimeInForce,
} from '../src/FIXParser';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const fixParser = new FIXParser();
const SENDER = 'CLIENT2';
const TARGET = 'EXECUTOR';
const CONNECT_PARAMS: Options = {
    host: '10.0.1.81',
    port: 5001,
    protocol: 'tcp',
    sender: SENDER,
    target: TARGET,
    fixVersion: 'FIX.4.4',
    logging: true,
    onOpen: () => {
        console.log('Open');
        let orderId = 0;
        sendLogon();
        setInterval(() => {
            orderId++;
            sendOrder(orderId);
        }, 3000);
    },
    onMessage: (message: Message) =>
        console.log('received message', message.description, message.messageString.replace(/\x01/g, '|')),
    onClose: () => {
        console.log('Disconnected');
        setTimeout(() => {
            console.log('Reconnecting...');
            fixParser.connect(CONNECT_PARAMS);
        }, 3000);
    },
};

const sendLogon = () => {
    const logon = fixParser.createMessage(
        new Field(Fields.MsgType, Messages.Logon),
        new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.SendingTime, fixParser.getTimestamp()),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.ResetSeqNumFlag, 'Y'),
        new Field(Fields.EncryptMethod, EncryptMethod.None),
        new Field(Fields.HeartBtInt, 10),
    );
    const messages = fixParser.parse(logon.encode());
    console.log('sending message', messages[0].description, messages[0].messageString);
    fixParser.send(logon);
};

const sendOrder = (orderId: number) => {
    const newOrderSingle = fixParser.createMessage(
        new Field(Fields.MsgType, Messages.NewOrderSingle),
        new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.SendingTime, fixParser.getTimestamp()),
        new Field(Fields.ClOrdID, String(orderId).padStart(4, '0')),
        new Field(Fields.Side, Side.Buy),
        new Field(Fields.Symbol, 'MSFT'),
        new Field(Fields.OrderQty, 10000),
        new Field(Fields.Price, 100),
        new Field(Fields.OrdType, OrderTypes.Limit),
        new Field(Fields.HandlInst, HandlInst.ManualOrder),
        new Field(Fields.TimeInForce, TimeInForce.Day),
        new Field(Fields.Text, 'NewOrderSingle'),
        new Field(Fields.TransactTime, fixParser.getTimestamp()),
    );
    const messages = fixParser.parse(newOrderSingle.encode());
    console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
    fixParser.send(newOrderSingle);
};

fixParser.connect(CONNECT_PARAMS);
