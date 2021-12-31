/* eslint-ignore */
// @ts-nocheck

import { Request, Response } from 'express';
import Twilio from 'twilio';

const client = new Twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const saveForm = async (req: Request, res: Response): void => {
// Create variables to store the options that our customer wants in their IVR
    const { formResponse } = req.body;
    const {
        businessName,
        phoneNumber,
        isStoreHours,
        storeHoursResponse,
        isServices,
        servicesSayResponse,
        servicesTextResponse,
        isEmployeeNumber,
        employeeNumberResponse,
    } = formResponse;

    // Placeholder array to store which keypad number represent an IVR option.
    const mainMenuVariables: string[] = [];

    // Determine which IVR options we'll need for this IVR
    let hoursKeypadOption = 0;
    let servicesKeypadOption = 0;
    let employeeKeypadOption = 0;
    if (isStoreHours) {
        mainMenuVariables.push('for operating hours, or say "hours".');
        hoursKeypadOption = mainMenuVariables.length;
    }

    if (isServices) {
        mainMenuVariables.push('for services, or say "Services".');
        servicesKeypadOption = mainMenuVariables.length;
    }

    if (isEmployeeNumber) {
        mainMenuVariables.push('to talk to a human, or say "Human".');
        employeeKeypadOption = mainMenuVariables.length;
    }

    // Concatenate the various IVR options to build our main menu message.
    let mainMenuMessage = '';
    if (mainMenuVariables.length === 0) {
        mainMenuMessage = 'Sorry, this IVR has not been set up correctly. Please try again later.';
    } else {
        for (let i = 0; i < mainMenuVariables.length; i += 1) {
            const menuOption = i + 1;
            if (mainMenuMessage) {
                mainMenuMessage = mainMenuMessage.concat(` or Press ${menuOption} ${mainMenuVariables[i]}`);
            } else {
                mainMenuMessage = `Press ${menuOption} ${mainMenuVariables[i]}`;
            }
        }
    }

    let studioDefinition = {};

    function createStudioFlow() {
        studioDefinition = {
            commitMessage: 'Initial Templated IVR',
            // Replace business name with customer's business name
            friendlyName: `${businessName} Main IVR`,
            status: 'published',
            definition: {
                description: 'Initial Template IVR Flow',
                states: [
                    {
                        transitions: [
                            {
                                event: 'incomingMessage',
                            },
                            {
                                event: 'incomingCall',
                                next: 'Say_Intro',
                            },
                            {
                                event: 'incomingRequest',
                            },
                        ],
                        type: 'trigger',
                        name: 'Trigger',
                        properties: {
                            offset: {
                                y: -40,
                                x: -160,
                            },
                        },
                    },
                    {
                        transitions: [
                            {
                                event: 'audioComplete',
                                next: 'Gather_Input',
                            },
                        ],
                        type: 'say-play',
                        name: 'Say_Intro',
                        properties: {
                            // Replace business name with customer's business name
                            say: `Welcome to ${businessName}. Please listen for the following options`,
                            voice: 'man',
                            language: 'en-US',
                            loop: 1,
                            offset: {
                                y: 220,
                                x: -370,
                            },
                        },
                    },
                    {
                        transitions: [
                            {
                                event: 'keypress',
                                next: 'split_key_press',
                            },
                            {
                                event: 'speech',
                                next: 'split_speech_result',
                            },
                            {
                                event: 'timeout',
                            },
                        ],
                        type: 'gather-input-on-call',
                        name: 'Gather_Input',
                        properties: {
                            stop_gather: true,
                            number_of_digits: 1,
                            language: 'en',
                            gather_language: 'en-US',
                            // Replace value with custom build main menu message
                            say: mainMenuMessage,
                            loop: 1,
                            timeout: 5,
                            offset: {
                                y: 220,
                                x: 240,
                            },
                            voice: 'man',
                            speech_timeout: 'auto',
                            finish_on_key: '',
                            profanity_filter: 'true',
                        },
                    },
                    {
                        transitions: [
                            {
                                event: 'noMatch',
                                next: 'Gather_Input',
                            },
                            {
                                conditions: [
                                    {
                                        type: 'equal_to',
                                        friendly_name: 'talkToHumanKeyPress',
                                        arguments: ['{{widgets.Gather_Input.Digits}}'],
                                        // replace with keypad number to forward call to employee
                                        value: employeeKeypadOption,
                                    },
                                ],
                                event: 'match',
                                next: 'Connect_To_Human',
                            },
                        ],
                        type: 'split-based-on',
                        name: 'split_key_press',
                        properties: {
                            input: '{{widgets.Gather_Input.Digits}}',
                            offset: {
                                y: 480,
                                x: -310,
                            },
                        },
                    },
                    {
                        transitions: [
                            {
                                event: 'noMatch',
                                next: 'Gather_Input',
                            },
                            {
                                conditions: [
                                    {
                                        type: 'matches_any_of',
                                        friendly_name: 'human',
                                        arguments: ['{{widgets.Gather_Input.SpeechResult}}'],
                                        value: 'Human., Person.',
                                    },
                                ],
                                event: 'match',
                                next: 'Connect_To_Human',
                            },
                        ],
                        type: 'split-based-on',
                        name: 'split_speech_result',
                        properties: {
                            input: '{{widgets.Gather_Input.SpeechResult}}',
                            offset: {
                                y: 510,
                                x: 510,
                            },
                        },
                    },
                    {
                        transitions: [
                            {
                                event: 'callCompleted',
                            },
                        ],
                        type: 'connect-call-to',
                        name: 'Connect_To_Human',
                        properties: {
                            to: employeeNumberResponse,
                            noun: 'number',
                            timeout: 30,
                            caller_id: '{{trigger.call.From}}',
                            offset: {
                                y: 1020,
                                x: 800,
                            },
                        },
                    },
                ],
                initial_state: 'Trigger',
                flags: {
                    allow_concurrent_calls: true,
                },
            },
        };

        if (isStoreHours) {
            // add condition for KeyPressHours
            studioDefinition.definition.states[3].transitions.push({
                conditions: [
                    {
                        type: 'equal_to',
                        friendly_name: 'hoursKeyPress',
                        arguments: ['{{widgets.Gather_Input.Digits}}'],
                        // replace with keypad number for Hours of Operation
                        value: hoursKeypadOption,
                    },
                ],
                event: 'match',
                next: 'Say_Hours',
            });
            // add condition for Speech_Hours
            studioDefinition.definition.states[4].transitions.push({
                conditions: [
                    {
                        type: 'matches_any_of',
                        friendly_name: 'hours',
                        arguments: ['{{widgets.Gather_Input.SpeechResult}}'],
                        value: 'Hours.',
                    },
                ],
                event: 'match',
                next: 'Say_Hours',
            });
            // Add widgets for Say_Hours and Say_Play_Store_Outro
            studioDefinition.definition.states.push(
                {
                    transitions: [
                        {
                            event: 'audioComplete',
                            next: 'say_play_store_outro',
                        },
                    ],
                    type: 'say-play',
                    name: 'Say_Hours',
                    properties: {
                        // Replace with Customer's hours of operation
                        say: storeHoursResponse,
                        voice: 'man',
                        language: 'en-US',
                        loop: 1,
                        offset: {
                            y: 1060,
                            x: -320,
                        },
                    },
                },
                {
                    transitions: [
                        {
                            event: 'audioComplete',
                        },
                    ],
                    type: 'say-play',
                    name: 'say_play_store_outro',
                    properties: {
                        say: 'Thank you for calling, Goodbye.',
                        voice: 'man',
                        language: 'en-US',
                        loop: 1,
                        offset: {
                            y: 1420,
                            x: -310,
                        },
                    },
                },
            );
        }
        if (isServices) {
            // add condition for KeyPressServices
            studioDefinition.definition.states[3].transitions.push({
                conditions: [
                    {
                        type: 'equal_to',
                        friendly_name: 'servicesKeyPress',
                        arguments: ['{{widgets.Gather_Input.Digits}}'],
                        value: servicesKeypadOption,
                    },
                ],
                event: 'match',
                next: 'Say_Services',
            });
            // add condition for Speech_Services
            studioDefinition.definition.states[4].transitions.push({
                conditions: [
                    {
                        type: 'matches_any_of',
                        friendly_name: 'services',
                        arguments: ['{{widgets.Gather_Input.SpeechResult}}'],
                        value: 'Services.',
                    },
                ],
                event: 'match',
                next: 'Say_Services',
            });
            // Add widgets for SayServicess and Say_Play_Store_Outro
            studioDefinition.definition.states.push(
                {
                    transitions: [
                        {
                            event: 'audioComplete',
                            next: 'say_play_outro',
                        },
                    ],
                    type: 'say-play',
                    name: 'Say_Services',
                    properties: {
                        // Replace with Customer's hours of operation
                        say: servicesSayResponse,
                        voice: 'man',
                        language: 'en-US',
                        loop: 1,
                        offset: {
                            y: 1000,
                            x: 260,
                        },
                    },
                },
                {
                    transitions: [
                        {
                            event: 'audioComplete',
                        },
                    ],
                    type: 'say-play',
                    name: 'say_play_outro',
                    properties: {
                        say: 'Thank you for calling.',
                        voice: 'man',
                        language: 'en-US',
                        loop: 1,
                        offset: {
                            y: 1450,
                            x: 290,
                        },
                    },
                },
            );
        }
        console.log(studioDefinition);
        return studioDefinition;
    }

    try {
        const flowSID = await client.studio.flows
            .create(createStudioFlow())
            .then((flow) => {
                client.incomingPhoneNumbers('PNecb475e6a9df8b3b3c35243216db0e6c').update({
                    voiceMethod: 'GET',
                    voiceUrl: `https://webhooks.twilio.com/v1/Accounts/${process.env.ACCOUNT_SID}/Flows/${flow.sid}`,
                });
                return flow.sid;
            });
        res.json({
            flowSID,
        });
    } catch (err) {
        console.log(err);
    }
};

export { saveForm as default };
