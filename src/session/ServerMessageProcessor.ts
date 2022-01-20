/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { MessageEnum } from '../fieldtypes/MessageEnum';
import FIXServer, { LicenseManager } from '../FIXServer';
import { Message } from '../message/Message';
import { log, logError } from '../util/util';
import { handleFirstMessage } from './SessionFirstMessage';
import { handleLogon } from './SessionLogon';
import { handleLogout } from './SessionLogout';
import { handleResendRequest } from './SessionResendRequest';
import { handleSequence } from './SessionSequence';
import { handleSequenceReset } from './SessionSequenceReset';
import { handleTestRequest } from './SessionTestRequest';

export const serverProcessMessage = (parser: FIXServer, message: Message): void => {
    if (!LicenseManager.validateLicense()) {
        return;
    }
    handleSequence(parser, message);
    log(`FIXServer (${parser.protocol.toUpperCase()}): << received ${message.description} ${message.encode('|')}`);

    if (parser.messageCounter === 0 && !handleFirstMessage(parser, message)) {
        logError(`FIXServer (${parser.protocol.toUpperCase()}): First message not a logon!`);
        return;
    } else if (message.messageType === MessageEnum.SequenceReset) {
        handleSequenceReset(parser, message);
    } else if (message.messageType === MessageEnum.TestRequest) {
        handleTestRequest(parser, message);
    } else if (message.messageType === MessageEnum.Logon) {
        handleLogon(parser, parser.messageBufferOut, message);
    } else if (message.messageType === MessageEnum.Logout) {
        handleLogout(parser, message);
    } else if (message.messageType === MessageEnum.ResendRequest) {
        handleResendRequest(parser, parser.messageBufferOut, message);
    }
    parser.nextNumIn++;
    parser.messageCounter++;
};
