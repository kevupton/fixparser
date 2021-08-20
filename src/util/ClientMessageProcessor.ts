/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Message } from '../message/Message';
import { log, logWarning } from './util';
import { FIXParser } from '../FIXParser';
import { MessageEnum } from '../fieldtypes/MessageEnum';
import { FIXParserBrowser } from '../FIXParserBrowser';
import { handleResendRequest } from '../session/SessionResendRequest';
import { handleLogon } from '../session/SessionLogon';
import { handleTestRequest } from '../session/SessionTestRequest';
import { handleSequenceReset } from '../session/SessionSequenceReset';

export const clientProcessMessage = (parser: FIXParser | FIXParserBrowser, message: Message): void => {
    if (message.messageSequence !== parser.nextNumIn) {
        logWarning(
            `FIXParser (${parser.protocol!.toUpperCase()}): -- Expected MsgSeqNum ${parser.nextNumIn}, but got ${
                message.messageSequence
            }`,
        );
    }

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
    log(`FIXParser (${parser.protocol!.toUpperCase()}): << received ${message.description}`);
};
