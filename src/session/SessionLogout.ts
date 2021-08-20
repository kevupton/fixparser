/*
 * fixparser
 * https://gitlab.com/logotype/fixparser.git
 *
 * Copyright 2021 fixparser.io
 * Released under Commercial license. Check LICENSE.md
 */
import { IFIXParser } from '../IFIXParser';
import { Message } from '../message/Message';
import { FieldEnum } from '../fieldtypes/FieldEnum';
import { log } from '../util/util';
import { Field } from '../fields/Field';
import { MessageEnum } from '../fieldtypes/MessageEnum';

export const handleLogout = (parser: IFIXParser, message: Message): void => {
    const logoutAcknowledge = parser.createMessage(
        new Field(FieldEnum.MsgType, MessageEnum.Logout),
        new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
        new Field(
            FieldEnum.SenderCompID,
            message.getField(FieldEnum.SenderCompID)
                ? message.getField(FieldEnum.SenderCompID)!.value.toString()
                : parser.sender,
        ),
        new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
        new Field(
            FieldEnum.TargetCompID,
            message.getField(FieldEnum.TargetCompID)
                ? message.getField(FieldEnum.TargetCompID)!.value.toString()
                : parser.target,
        ),
        new Field(FieldEnum.Text, 'Logout acknowledgement'),
    );
    parser.send(logoutAcknowledge);
    log(`FIXServer (${parser.protocol!.toUpperCase()}): >> sent Logout acknowledge`);
    parser.stopHeartbeat();
    parser.close();
};
