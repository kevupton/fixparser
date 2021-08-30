export interface ISpecSections {
    SectionID: string;
    Name: string;
    DisplayOrder: number;
    Volume: string;
    NotReqXML: number;
    FIXMLFileName: string;
    Description: string;
}

export const SECTIONS: ISpecSections[] = [
    {
        DisplayOrder: 0,
        Description: 'Session level messages to establish and control a FIX session',
        Volume: 'FIXT.1.1',
        FIXMLFileName: 'session',
        NotReqXML: 1,
        SectionID: 'Session',
        Name: 'Session',
    },
    {
        DisplayOrder: 1,
        Description:
            'Pre trade messages including reference data, market data, quoting, news and email, indication of interest',
        Volume: '3',
        FIXMLFileName: 'pretrade',
        NotReqXML: 0,
        SectionID: 'PreTrade',
        Name: 'PreTrade',
    },
    {
        DisplayOrder: 2,
        Description: 'Order handling and execution messages',
        Volume: '4',
        FIXMLFileName: 'trade',
        NotReqXML: 0,
        SectionID: 'Trade',
        Name: 'Trade',
    },
    {
        DisplayOrder: 3,
        Description:
            'Post trade messages including trade reporting, allocation, collateral, confirmation, position maintenance, registration instruction, and settlement instructions',
        Volume: '5',
        FIXMLFileName: 'posttrade',
        NotReqXML: 0,
        SectionID: 'PostTrade',
        Name: 'PostTrade',
    },
    {
        DisplayOrder: 4,
        Description: 'Infrastructure messages for application sequencing, business reject, network and user management',
        Volume: '1',
        FIXMLFileName: 'infrastructure',
        NotReqXML: 0,
        SectionID: 'Infrastructure',
        Name: 'Infrastructure',
    },
];
