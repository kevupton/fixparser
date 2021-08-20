import FIXParser, {
    Field,
    Fields,
    Messages,
    Side,
    OrderTypes,
    HandlInst,
    TimeInForce,
    EncryptMethod,
    LicenseManager,
} from '../src/FIXParser'; // from 'fixparser';
import { readFileSync } from 'fs';

// NOTE: This feature requires a FIXParser Enterprise license
LicenseManager.setLicenseKey('<your license here>');

const fixParser = new FIXParser();
const SENDER = 'BANZAI';
const TARGET = 'EXEC';

function sendLogon() {
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
}

fixParser.connect({
    host: 'localhost',
    port: 9878,
    protocol: 'tls-tcp',
    sender: SENDER,
    target: TARGET,
    fixVersion: 'FIXT.1.1',
    tlsKey: readFileSync('key.pem'),
    tlsCert: readFileSync('cert.pem'),
    tlsUseSNI: false, // Set to true to use TLS SNI connection, requires host to be FQDN
});

fixParser.on('open', () => {
    console.log('Open');

    sendLogon();

    setInterval(() => {
        const order = fixParser.createMessage(
            new Field(Fields.MsgType, Messages.NewOrderSingle),
            new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
            new Field(Fields.SenderCompID, SENDER),
            new Field(Fields.SendingTime, fixParser.getTimestamp()),
            new Field(Fields.TargetCompID, TARGET),
            new Field(Fields.ClOrdID, '11223344'),
            new Field(Fields.HandlInst, HandlInst.AutomatedExecutionNoIntervention),
            new Field(Fields.OrderQty, '123'),
            new Field(Fields.TransactTime, fixParser.getTimestamp()),
            new Field(Fields.OrdType, OrderTypes.Market),
            new Field(Fields.Side, Side.Buy),
            new Field(Fields.Symbol, '700.HK'),
            new Field(Fields.TimeInForce, TimeInForce.Day),
        );
        const messages = fixParser.parse(order.encode());
        console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
        fixParser.send(order);
    }, 500);
});
fixParser.on('message', (message) => {
    console.log('received message', message.description, message.messageString);
});
fixParser.on('close', () => {
    console.log('Disconnected');
});
