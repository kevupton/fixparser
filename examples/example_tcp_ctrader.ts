import {
    EncryptMethod,
    Field,
    Fields,
    FIXParser,
    LicenseManager,
    MDEntryType,
    Message,
    Messages,
} from '../src/FIXParser';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const fixParser = new FIXParser();

const SENDER = 'ctrader.xxxxxxx';
const TARGET = 'CSERVER';
const CTRADER_PASSWORD = 'xxxxxxxxxxxx';
const CTRADER_SERVER = 'xxxxxxxxxxxx'; // e.g. h47.p.ctrader.com
const CTRADER_PORT = 5201; // 5211 SSL, 5201 Plain Text

let countReq = 0;

fixParser.connect({
    host: CTRADER_SERVER,
    port: CTRADER_PORT,
    protocol: 'tcp',
    sender: SENDER,
    target: TARGET,
    fixVersion: 'FIX.4.4',
    onOpen: () => {
        console.log('Open');
        sendLogon();
        sendMarketDataRequest();
    },
    onMessage: (message: Message) => console.log('received message', message.description, message.messageString),
    onError: (error?: Error) => console.log('error', error),
    onClose: () => console.log('Disconnected'),
});

const sendLogon = () => {
    const logon = fixParser.createMessage(
        new Field(Fields.MsgType, Messages.Logon),
        new Field(Fields.BeginString, 'FIX.4.4'),
        new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.SendingTime, fixParser.getTimestamp()),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.SenderSubID, 'QUOTE'),
        new Field(Fields.ResetSeqNumFlag, 'Y'),
        new Field(Fields.RawData, CTRADER_PASSWORD),
        new Field(Fields.EncryptMethod, EncryptMethod.None),
        new Field(Fields.HeartBtInt, 10),
    );
    const messages = fixParser.parse(logon.encode());
    console.log('sending message', messages[0].description, messages[0].messageString);
    fixParser.send(logon);
};

// for sending market data request to cTrader's FIX API server
const sendMarketDataRequest = () => {
    const quote = fixParser.createMessage(
        new Field(Fields.MsgType, Messages.MarketDataRequest),
        new Field(Fields.BeginString, 'FIX.4.4'),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.SendingTime, fixParser.getTimestamp()),
        new Field(Fields.MarketDepth, 0),
        new Field(Fields.MDUpdateType, 0),
        new Field(Fields.NoRelatedSym, 2),
        new Field(Fields.Symbol, 1), // for cTrader's own symbol system, 1 for EURUSD
        new Field(Fields.Symbol, 2), // 2 for GBPUSD
        new Field(Fields.MDReqID, ++countReq),
        new Field(Fields.SubscriptionRequestType, 1),
        new Field(Fields.NoMDEntryTypes, 2),
        new Field(Fields.MDEntryType, MDEntryType.Bid),
        new Field(Fields.MDEntryType, MDEntryType.Offer),
    );
    const messages = fixParser.parse(quote.encode());
    console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
    fixParser.send(quote);
};
