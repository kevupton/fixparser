import {
    ExecType,
    Field,
    Fields,
    FIXServer,
    HandlInst,
    LicenseManager,
    Message,
    Messages,
    OrderStatus,
    OrderTypes,
    Side,
    TimeInForce,
} from '../src/FIXServer';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const SENDER = 'EXEC';
const TARGET = 'BANZAI';
const fixServer = new FIXServer();
let intervalId: ReturnType<typeof setInterval> | null = null;

fixServer.createServer({
    host: 'localhost',
    port: 9900,
    protocol: 'websocket',
    sender: 'EXEC',
    target: 'BANZAI',
    onOpen: () => {
        console.log('Open');
        clearInterval(intervalId!);
        intervalId = setInterval(() => {
            sendOrder();
        }, 5000);
    },
    onMessage: (message: Message) => {
        console.log('server received message', message.description, message.messageString);
        // Respond with ExecutionReport
        if (message.messageType === Messages.NewOrderSingle) {
            sendExecutionReport(message);
        }
    },
    onClose: () => {
        console.log('Disconnected');
        clearInterval(intervalId!);
    },
});

const sendOrder = () => {
    const order = fixServer.createMessage(
        new Field(Fields.MsgType, Messages.NewOrderSingle),
        new Field(Fields.MsgSeqNum, fixServer.setNextTargetMsgSeqNum(fixServer.getNextTargetMsgSeqNum() + 1)),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.SendingTime, fixServer.getTimestamp()),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.ClOrdID, '11223344'),
        new Field(Fields.HandlInst, HandlInst.AutomatedExecutionNoIntervention),
        new Field(Fields.OrderQty, '123'),
        new Field(Fields.TransactTime, fixServer.getTimestamp()),
        new Field(Fields.OrdType, OrderTypes.Market),
        new Field(Fields.Side, Side.Buy),
        new Field(Fields.Symbol, '700.HK'),
        new Field(Fields.TimeInForce, TimeInForce.Day),
    );
    const messages = fixServer.parse(order.encode());
    console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
    fixServer.send(order);
};

const sendExecutionReport = (message: Message) => {
    const executionReport = fixServer.createMessage(
        new Field(Fields.MsgType, Messages.ExecutionReport),
        new Field(Fields.MsgSeqNum, fixServer.getNextTargetMsgSeqNum()),
        new Field(Fields.SenderCompID, 'SERVER'),
        new Field(Fields.SendingTime, fixServer.getTimestamp()),
        new Field(Fields.TargetCompID, 'CLIENT'),
        new Field(Fields.AvgPx, message.getField(Fields.Price) ? message.getField(Fields.Price)!.value : 0),
        new Field(Fields.ClOrdID, message.getField(Fields.ClOrdID) ? message.getField(Fields.ClOrdID)!.value : 'N/A'),
        new Field(Fields.CumQty, message.getField(Fields.OrderQty) ? message.getField(Fields.OrderQty)!.value : 0),
        new Field(Fields.Symbol, message.getField(Fields.Symbol) ? message.getField(Fields.Symbol)!.value : 'N/A'),
        new Field(Fields.LastPx, message.getField(Fields.Price) ? message.getField(Fields.Price)!.value : 0),
        new Field(Fields.OrderID, 55),
        new Field(Fields.OrderQty, message.getField(Fields.OrderQty) ? message.getField(Fields.OrderQty)!.value : 0),
        new Field(Fields.OrdStatus, OrderStatus.Filled),
        new Field(Fields.Side, Side.Buy),
        new Field(Fields.ExecType, ExecType.Trade),
        new Field(Fields.LeavesQty, 0),
    );
    fixServer.send(executionReport);
};
