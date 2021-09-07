/**
 * This example will connect to the C++ QuickFIX engine.
 * Clone https://github.com/quickfix/quickfix
 * build and run ./bin/run_tradeclient.sh.
 *
 * FIX session flow:
 * Initiator (us) connects over TCP to port 5001.
 * Upon connection, QuickFIX sends a Logon message. We respond to the Logon message.
 * You can send orders from QuickFIX. We respond with a ExecutionReport.
 */
import { ExecType, Field, Fields, FIXServer, LicenseManager, Message, Messages, OrderStatus } from '../src/FIXServer';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const SENDER: string = 'EXECUTOR';
const TARGET: string = 'CLIENT1';

const fixServer = new FIXServer();
fixServer.createServer({
    host: '10.0.1.112',
    port: 5001,
    sender: SENDER,
    target: TARGET,
    onOpen: () => console.log('Open'),
    onMessage: (message: Message) => {
        console.log('server received message', message.description, message.messageString.replace(/\x01/g, '|'));
        // Respond with ExecutionReport
        if (message.messageType === Messages.NewOrderSingle) {
            sendExecutionReport(message);
        }
    },
    onClose: () => console.log('Disconnected'),
});

const sendExecutionReport = (message: Message) => {
    const executionReport = fixServer.createMessage(
        new Field(Fields.MsgType, Messages.ExecutionReport),
        new Field(Fields.MsgSeqNum, fixServer.getNextTargetMsgSeqNum()),
        new Field(Fields.SenderCompID, SENDER),
        new Field(Fields.SendingTime, fixServer.getTimestamp()),
        new Field(Fields.TargetCompID, TARGET),
        new Field(Fields.AvgPx, message.getField(Fields.Price) ? message.getField(Fields.Price)!.value : 0),
        new Field(Fields.ClOrdID, message.getField(Fields.ClOrdID) ? message.getField(Fields.ClOrdID)!.value : 'N/A'),
        new Field(Fields.ExecID, message.getField(Fields.ClOrdID) ? message.getField(Fields.ClOrdID)!.value : 'N/A'),
        new Field(Fields.ExecTransType, 0),
        new Field(Fields.CumQty, message.getField(Fields.OrderQty) ? message.getField(Fields.OrderQty)!.value : 0),
        new Field(Fields.Symbol, message.getField(Fields.Symbol) ? message.getField(Fields.Symbol)!.value : 'N/A'),
        new Field(Fields.LastPx, message.getField(Fields.Price) ? message.getField(Fields.Price)!.value : 0),
        new Field(Fields.OrderID, message.getField(Fields.ClOrdID) ? message.getField(Fields.ClOrdID)!.value : 'N/A'),
        new Field(Fields.OrderQty, message.getField(Fields.OrderQty) ? message.getField(Fields.OrderQty)!.value : 0),
        new Field(Fields.OrdStatus, OrderStatus.Filled),
        new Field(Fields.Side, message.getField(Fields.Side) ? message.getField(Fields.Side)!.value : 'N/A'),
        new Field(Fields.ExecType, ExecType.New),
        new Field(Fields.LeavesQty, 0),
    );
    const messages = fixServer.parse(executionReport.encode());
    console.log('sending message', messages[0].description, messages[0].messageString.replace(/\x01/g, '|'));
    fixServer.send(executionReport);
};
