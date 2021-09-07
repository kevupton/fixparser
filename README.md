# fixparser
[![FIXParser Demo](https://gitlab.com/logotype/fixparser/-/raw/main/badges/fixparser-demo.svg)](https://logotype.gitlab.io/fixparser/)
[![Pipeline](https://gitlab.com/logotype/fixparser/badges/main/pipeline.svg)](https://gitlab.com/logotype/fixparser/-/commits/main)
[![Coverage](https://gitlab.com/logotype/fixparser/badges/main/coverage.svg?job=test)](https://gitlab.com/logotype/fixparser/-/commits/main)
[![npm version](https://badge.fury.io/js/fixparser.svg)](https://www.npmjs.com/package/fixparser)
[![Downloads](https://img.shields.io/npm/dm/fixparser.svg)](https://www.npmjs.com/package/fixparser)

This is the TypeScript framework for working with FIX protocol messages. Compliant with FIX 5.0 SP2.

The Financial Information eXchange (FIX) protocol is an electronic communications protocol initiated in 1992 for international real-time exchange of information related to the securities transactions and markets.

Versions
------------------
<table style="border-collapse: collapse; width: 100%;" border="1">
<tbody>
<tr>
<td style="width: 33.3333%;">Feature</td>
<td style="width: 33.3333%;">FIXParser</td>
<td style="width: 33.3333%;">FIXParser Enterprise</td>
</tr>
<tr>
<td style="width: 33.3333%;">Parse FIX messages</td>
<td style="width: 33.3333%;">●</td>
<td style="width: 33.3333%;">●</td>
</tr>
<tr>
<td style="width: 33.3333%;">Create FIX messages</td>
<td style="width: 33.3333%;"> </td>
<td style="width: 33.3333%;">●</td>
</tr>
<tr>
<td style="width: 33.3333%;">Encode FIX messages</td>
<td style="width: 33.3333%;"> </td>
<td style="width: 33.3333%;">●</td>
</tr>
<tr>
<td style="width: 33.3333%;">Remote connections</td>
<td style="width: 33.3333%;"> </td>
<td style="width: 33.3333%;">●</td>
</tr>
<tr>
<td style="width: 33.3333%;">FIX Server</td>
<td style="width: 33.3333%;"> </td>
<td style="width: 33.3333%;">●</td>
</tr>
</tbody>
</table>

Features
--------
+ Parse and create FIX messages
+ Connect over TCP/WebSocket socket as client or server
+ FIX Session support (Logon, Logout, Heartbeat, etc)
+ Fast, single-digit microsecond performance
+ Modern, written in Typescript
+ Validation (checksum and body length), includes per-field FIX specification in parsed message
+ Supports various separators/start of headers (e.g. 0x01, ^ and |)
+ Clean and lightweight code
+ Supports both node.js and browser environments (`import 'fixparser' from 'fixparser/browser';`)

[FIXParser Enterprise](https://fixparser.io)
-----------

The FIXParser Enterprise version can be purchased at [fixparser.io](https://fixparser.io).
A license is valid for 1 year, includes updates and enables all functionality of the fixparser library.

Quick start
-----------

Install with `npm install fixparser`.

Parse a FIX message:

```typescript
import FIXParser from 'fixparser';
const fixParser: FIXParser = new FIXParser();
const messages: Message[] = fixParser.parse('8=FIX.4.2|9=51|35=0|34=703|49=ABC|52=20100130-10:53:40.830|56=XYZ|10=249|');
```

```json
{
  "fixVersion": "FIX.4.2",
  "description": "Heartbeat",
  "messageType": "0",
  "messageSequence": 703,
  "data": [
    {
      "tag": 8,
      "value": "FIX.4.2",
      "name": "BeginString",
      "description": "Identifies beginning of new message and protocol version. ALWAYS FIRST FIELD IN MESSAGE. (Always unencrypted)\nValid values:\nFIXT.1.1",
      "type": {
        "name": "String",
        "description": "Alpha-numeric free format strings, can include any character or punctuation except the delimiter. All String fields are case sensitive (i.e. morstatt != Morstatt).",
        "added": "FIX.4.2"
      },
      "category": null,
      "section": null,
      "enumeration": null,
      "validated": false
    },
    ... // Rest of tags...
  ],
  "messageContents": [
    {
      "componentID": 1,
      "tagText": "StandardHeader",
      "indent": 0,
      "position": 1,
      "reqd": 1,
      "description": "MsgType = 0",
      "added": "FIX.2.7",
      ... // Rest of spec...
    }
  ],
  "bodyLengthValid": true,
  "checksumValid": true,
  "checksumValue": "249",
  "checksumExpected": "249",
  "bodyLengthValue": 51,
  "bodyLengthExpected": 51
}
```

**FIXParser Enterprise** Create a FIX message:

```typescript
import {
    FIXParser,
    Field,
    Fields,
    Message,
    Messages,
    Side,
    OrderTypes,
    HandlInst,
    TimeInForce,
    EncryptMethod,
    LicenseManager
} from 'fixparser';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const fixParser: FIXParser = new FIXParser();
const order: Message = fixParser.createMessage(
    new Field(Fields.MsgType, Messages.NewOrderSingle),
    new Field(Fields.MsgSeqNum, fixParser.getNextTargetMsgSeqNum()),
    new Field(Fields.SenderCompID, 'SENDER'),
    new Field(Fields.SendingTime, fixParser.getTimestamp()),
    new Field(Fields.TargetCompID, 'TARGET'),
    new Field(Fields.ClOrdID, '11223344'),
    new Field(Fields.HandlInst, HandlInst.AutomatedExecutionNoIntervention),
    new Field(Fields.OrderQty, '123'),
    new Field(Fields.TransactTime, fixParser.getTimestamp()),
    new Field(Fields.OrdType, OrderTypes.Market),
    new Field(Fields.Side, Side.Buy),
    new Field(Fields.Symbol, '123.HK'),
    new Field(Fields.TimeInForce, TimeInForce.Day)
);
console.log(order.encode('|'));
```

**FIXParser Enterprise** Connect over TCP socket (as client):

```typescript
import { FIXParser, LicenseManager } from 'fixparser';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');
const fixParser: FIXParser = new FIXParser();
fixParser.connect({
    host: 'localhost',
    port: 9878,
    protocol: 'tcp',
    sender: 'BANZAI',
    target: 'EXEC',
    fixVersion: 'FIX.4.4',
    logging: true,
    onReady: () => { /* Client is ready to connect */ },
    onOpen: () => { /* Connection is now open */ },
    onMessage: (message: Message) => { /* Received a FIX message */ },
    onError: (error?: Error) => { /* Some error occurred */ },
    onClose: () => { /* Disconnected from remote */ },
});
```

**FIXParser Enterprise** FIX Server:

```typescript
import { FIXServer, LicenseManager }  from 'fixparser/server';

// NOTE: This feature requires a FIXParser Enterprise license
void LicenseManager.setLicenseKey('<your license here>');

const fixServer: FIXServer = new FIXServer();
fixServer.createServer({
    host: 'localhost',
    port: 9878,
    protocol: 'tcp',
    sender: 'SERVER',
    target: 'CLIENT',
    onReady: () => { /* Server is ready */ },
    onOpen: () => { /* Received connection */ },
    onMessage: (message: Message) => { /* Received a FIX message */ },
    onError: (error?: Error) => { /* Some error occurred */ },
    onClose: () => { /* Client disconnected */ },
});
```

Performance
-----------
```bash
┌─────────────────────────────────┬───────────────┬──────────────┬──────────────┐
│ FIX Messages                    │ Messages/sec  │ Microseconds │ Milliseconds │
│ 200,000 iterations (same msg)   │ 156,863 msg/s │ 6.3750 μs    │ 0.0064 ms    │
│ 200,000 iterations (same msg)   │ 171,233 msg/s │ 5.8400 μs    │ 0.0058 ms    │
│ 200,000 iterations (random msg) │ 92,039 msg/s  │ 10.8650 μs   │ 0.0109 ms    │
│ 200,000 iterations (same msg)   │ 168,209 msg/s │ 5.9450 μs    │ 0.0059 ms    │
│ 200,000 iterations (random msg) │ 86,133 msg/s  │ 11.6100 μs   │ 0.0116 ms    │
│ 200,000 iterations (same msg)   │ 171,821 msg/s │ 5.8200 μs    │ 0.0058 ms    │
│ 200,000 iterations (random msg) │ 86,319 msg/s  │ 11.5850 μs   │ 0.0116 ms    │
│ 200,000 iterations (same msg)   │ 172,265 msg/s │ 5.8050 μs    │ 0.0058 ms    │
│ 200,000 iterations (same msg)   │ 170,940 msg/s │ 5.8500 μs    │ 0.0059 ms    │
│ 200,000 iterations (same msg)   │ 171,233 msg/s │ 5.8400 μs    │ 0.0058 ms    │
└─────────────────────────────────┴───────────────┴──────────────┴──────────────┘
```
MacBook Air, 1.7 GHz Intel Core i7 (8 GB 1600 MHz DDR3), run with `npm run perf`.

Message format
--------------

The general format of a FIX message is a standard header followed by the message body fields and terminated with a standard trailer.

Each message is constructed of a stream of <tag>=<value> fields with a field delimiter between fields in the stream. Tags are of data type TagNum. All tags must have a value specified. Optional fields without values should simply not be specified in the FIX message. A Reject message is the appropriate response to a tag with no value.
Except where noted, fields within a message can be defined in any sequence (Relative position of a field within a message is inconsequential.) The exceptions to this rule are:

- General message format is composed of the standard header followed by the body followed by the standard trailer.
- The first three fields in the standard header are BeginString (tag #8) followed by BodyLength (tag #9) followed by MsgType (tag #35).
- The last field in the standard trailer is the CheckSum (tag #10).
- Fields within repeating data groups must be specified in the order that the fields are specified in the message definition within the FIX specification document. The NoXXX field where XXX is the field being counted specifies the number of repeating group instances that must immediately precede the repeating group contents.
- A tag number (field) should only appear in a message once. If it appears more than once in the message it should be considered an error with the specification document. The error should be pointed out to the FIX Global Technical Committee.

In addition, certain fields of the data type MultipleCharValue can contain multiple individual values separated by a space within the "value" portion of that field followed by a single "SOH" character (e.g. "18=2 9 C<SOH>" represents 3 individual values: '2', '9', and 'C'). Fields of the data type MultipleStringValue can contain multiple values that consists of string values separated by a space within the "value" portion of that field followed by a single "SOH" character (e.g. "277=AA I AJ<SOH>" represents 3 values: 'AA', 'I', 'AJ').

It is also possible for a field to be contained in both the clear text portion and the encrypted data sections of the same message. This is normally used for validation and verification. For example, sending the SenderCompID in the encrypted data section can be used as a rudimentary validation technique. In the cases where the clear text data differs from the encrypted data, the encrypted data should be considered more reliable. (A security warning should be generated).

Copyright
-------

**fixparser.io**

+ https://fixparser.io