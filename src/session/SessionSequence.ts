/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright © 2022 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { Field } from '../fields/Field';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { MessageEnum } from '../fieldtypes/MessageEnum';
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { log, logWarning } from '../util/util';

export const handleSequence = (parser: IFIXParser, message: Message): boolean => {
    if (
        message.messageSequence !== parser.nextNumIn &&
        !(parser.connectionType === 'acceptor' && message.messageType === MessageEnum.Logon)
    ) {
        logWarning(
            `FIXServer (${parser.protocol!.toUpperCase()}): Expected MsgSeqNum ${parser.nextNumIn}, but got ${
                message.messageSequence
            }`,
        );

        // Message has wrong sequence, respond with ResendRequest
        const resendRequest = parser.createMessage(
            new Field(FieldEnum.MsgType, MessageEnum.ResendRequest),
            new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
            new Field(FieldEnum.SenderCompID, parser.sender),
            new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
            new Field(FieldEnum.TargetCompID, parser.target),
            new Field(FieldEnum.BeginSeqNo, parser.getNextTargetMsgSeqNum()),
            new Field(FieldEnum.EndSeqNo, 0),
        );
        log(
            `FIXServer (${parser.protocol!.toUpperCase()}): Sending ResendRequest from ${parser.getNextTargetMsgSeqNum()} to 0`,
        );
        parser.send(resendRequest);
        return false;
    }
    return true;
};
