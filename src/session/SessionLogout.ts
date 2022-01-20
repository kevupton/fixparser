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
import { log } from '../util/util';

export const handleLogout = (parser: IFIXParser, message: Message): void => {
    parser.isLoggedIn = false;

    const logoutAcknowledge = parser.createMessage(
        new Field(FieldEnum.MsgType, MessageEnum.Logout),
        new Field(FieldEnum.MsgSeqNum, parser.getNextTargetMsgSeqNum()),
        new Field(
            FieldEnum.SenderCompID,
            message.getField(FieldEnum.SenderCompID)
                ? message.getField(FieldEnum.SenderCompID)!.value!.toString()
                : parser.sender,
        ),
        new Field(FieldEnum.SendingTime, parser.getTimestamp(new Date())),
        new Field(
            FieldEnum.TargetCompID,
            message.getField(FieldEnum.TargetCompID)
                ? message.getField(FieldEnum.TargetCompID)!.value!.toString()
                : parser.target,
        ),
        new Field(FieldEnum.Text, 'Logout acknowledgement'),
    );
    parser.send(logoutAcknowledge);
    log(`FIXServer (${parser.protocol!.toUpperCase()}): >> sent Logout acknowledge`);
    parser.stopHeartbeat();
    parser.close();
};
