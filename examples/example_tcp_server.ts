import {
    ExecType,
    Field,
    Fields,
    FIXServer,
    LicenseManager,
    Message,
    Messages,
    OrderStatus,
    Side,
} from '../src/FIXServer'; // from 'fixparser/server';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const fixServer = new FIXServer();
fixServer.createServer({
    host: 'localhost',
    port: 9878,
    sender: 'SERVER',
    target: 'CLIENT',
    onOpen: () => console.log('Open'),
    onClose: () => console.log('Disconnected'),
    onMessage: (message: Message) => {
        console.log('server received message', message.description, message.messageString);
        // Respond with ExecutionReport
        if (message.messageType === Messages.NewOrderSingle) {
            sendExecutionReport(message);
        }
    },
});

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
    const messages = fixServer.parse(executionReport.encode());
    console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
    fixServer.send(executionReport);
};
