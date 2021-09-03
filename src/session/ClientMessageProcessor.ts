/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { MessageEnum } from '../fieldtypes/MessageEnum';
import { FIXParser } from '../FIXParser';
import { FIXParserBrowser } from '../FIXParserBrowser';
import { Message } from '../message/Message';
import { log, logWarning } from '../util/util';
import { handleLogon } from './SessionLogon';
import { handleResendRequest } from './SessionResendRequest';
import { handleSequenceReset } from './SessionSequenceReset';
import { handleTestRequest } from './SessionTestRequest';

export const clientProcessMessage = (parser: FIXParser | FIXParserBrowser, message: Message): void => {
    if (message.messageSequence !== parser.nextNumIn) {
        logWarning(
            `FIXParser (${parser.protocol!.toUpperCase()}): -- Expected MsgSeqNum ${parser.nextNumIn}, but got ${
                message.messageSequence
            }`,
        );
    }
    log(`FIXParser (${parser.protocol!.toUpperCase()}): << received ${message.description} ${message.encode('|')}`);

    if (message.messageType === MessageEnum.SequenceReset) {
        handleSequenceReset(parser, message);
    } else if (message.messageType === MessageEnum.TestRequest) {
        handleTestRequest(parser, message);
    } else if (message.messageType === MessageEnum.Logon) {
        handleLogon(parser, parser.messageBuffer, message);
    } else if (message.messageType === MessageEnum.ResendRequest) {
        handleResendRequest(parser, parser.messageBuffer, message);
    }
    parser.nextNumIn++;
};
