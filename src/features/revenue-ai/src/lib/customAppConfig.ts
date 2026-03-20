export const customAppConfig = [
  {
    name: "slack",
    // service: SlackService,
    saveFunction: "saveSlackDetails",
    content:
      "Configuration settings are unavailable for archived channels. Please unarchive before configuring.",
    components: [
      {
        commonLabel: "Slack Meeting Summary",
        subLabel:
          "Automatically generate and distribute concise meeting summaries to designated Slack channels",
        tooltip:
          "Automatically create and distribute brief meeting summaries to the right Slack channels.",
        inputs: [
          {
            type: "multiselect",
            displayValue: "channel_name",
            returnValue: "channel_id",
            label: "Select Slack Channel",
            formControlName: "meetingSummary",
            options: [],
            function: "getSlackList",
            saveFunction: "saveMeetingList",
          },
        ],
      },
      {
        commonLabel: "Slack Direct Message",
        subLabel:
          "Engage directly with the Thunai channel via Slack DMs, using an integrated widget that ensures a consistent persona, robust security, and optimized language support.",
        tooltip:
          "Engage with the Thunai channel through Slack DMs using an integrated widget that ensures a consistent persona, strong security, and seamless language support.",
        inputs: [
          {
            type: "toggle",
            label: "Enable Direct Message",
            formControlName: "directMessage",
            function: "getDirectMessage",
            saveFunction: "changeDirectMessage",
          },
        ],
      },
      {
        commonLabel: "MCP",
        subLabel: "Use Slack MCP tools to enhance Ask Thunai.",
        inputs: [
          {
            type: "toggle",
            label: "Enable MCP",
            formControlName: "mcp",
            function: "getMcpStatus",
            visibleIf: {
              formControlName:"directMessage",
              value: true 
            }
          },
        ],
      },
      {
        commonLabel: "Executive Query Assistant",
        subLabel:
          "Receive intelligent responses in Slack by tagging our dedicated handle, streamlining your workflow with on-demand AI support.",
        tooltip:
          "Get intelligent responses in Slack by tagging our dedicated handle, streamlining your workflow with on-demand AI support.",
        inputs: [
          {
            type: "select",
            displayValue: "name",
            placeholder: "Please Select Chat Agent",
            returnValue: "widget_id",
            label: "Select Chat Agent",
            formControlName: "widget_id",
            options: [],
            function: "getBotWidget",
            saveFunction: "saveTagBot",
          },
          {
            type: "multiselect",
            displayValue: "channel_name",
            returnValue: "channel_id",
            label: "Select Slack Channel",
            formControlName: "channel_id",
            options: [],
            function: "getTagBotList",
            saveFunction: "saveTagBot",
          },
        ],
      },
      // {
      //   commonLabel: 'Enable Workflow',
      //   subLabel: 'Enable the ability for chat and voice agents to interact directly with applications, retrieve information, and facilitate workflows.',
      //   inputs: [
      //     {
      //       type: 'toggle',
      //       label: 'Enable Application Interactions from Chat/Voice Agents.',
      //       formControlName: 'workflow',
      //       function: 'enableWorkflow',
      //       saveFunction: ''
      //     },
      //     // { type: 'select', displayValue: 'name', placeholder:'Please Select Chat Agent', returnValue: 'widget_id', label: 'Select Chat Agent', formControlName: 'widget_id', options: [], function: 'getDirectMsgDetial', saveFunction: 'changeDirectMessage' },

      //   ]
      // },
      {
        commonLabel: "Slack Brain Notes",
        subLabel:
          "Effortlessly capture and upload your Slack Messages to Thunai Brain.",
        tooltip:
          "Seamlessly capture Slack messages and store them in Thunai Brain.",
        inputs: [
          {
            type: "multiselect",
            displayValue: "channel_name",
            returnValue: "channel_id",
            label: "Select Slack Channel",
            formControlName: "brain_channel_id",
            options: [],
            function: "getBrainNotesList",
            saveFunction: "SaveBrainNotes",
          },
        ],
      },
    ],
  },
  {
    name: "microsoft_teams",
    // service: TeamsService,
    saveFunction: "saveTeamsDetails",
    components: [
      {
        commonLabel: "Microsoft Teams Meeting Summary",
        subLabel:
          "Automatically generate and distribute concise meeting summaries to designated Teams Groups Chats",
        // valueChange: true,
        inputs: [
          // { type: 'multiselect', displayValue: 'team_name', returnValue: 'team_id', label: 'Select Teams', formControlName: 'teams', options: [], function: 'getTeamsList', saveFunction: 'saveMeetingList' },
          {
            type: "multiselect",
            displayValue: "channel_name",
            returnValue: "channel_id",
            label: "Select Groups",
            formControlName: "meetingSummary",
            options: [],
            function: "getTeamsChannelList",
            saveFunction: "saveMeetingList",
          },
        ],
      },
      {
        commonLabel: "Microsoft Teams Direct Message",
        subLabel:
          "Engage directly with the Thunai channel via Microsoft Teams DMs, using an integrated widget that ensures a consistent persona, robust security, and optimized language support.",
        inputs: [
          {
            type: "toggle",
            label: "Enable Direct Message",
            formControlName: "directMessage",

            function: "getDirectMessage",
            saveFunction: "changeDirectMessage",
          },
          // { type: 'select', displayValue: 'name', placeholder:'Please Select Chat Agent', returnValue: 'widget_id', label: 'Select Chat Agent', formControlName: 'widget_id', options: [], function: 'getDirectMsgDetial', saveFunction: 'changeDirectMessage' },
        ],
      },
      {
        commonLabel: "MCP",
        subLabel: "Use Teams MCP tools to enhance Ask Thunai.",
        inputs: [
          {
            type: "toggle",
            label: "Enable MCP",
            formControlName: "mcp",
            function: "getMcpStatus",
            visibleIf: {
              formControlName:"directMessage",
              value: true 
            }
          },
        ],
      },
      {
        commonLabel: "Executive Query Assistant",
        subLabel:
          "Receive intelligent responses in Microsoft Teams by tagging our dedicated handle, streamlining your workflow with on-demand AI support.",
        inputs: [
          {
            type: "select",
            displayValue: "name",
            placeholder: "Please Select Chat Agent",
            returnValue: "widget_id",
            label: "Select Chat Agent",
            formControlName: "widget_id",
            options: [],
            function: "getBotWidget",
            saveFunction: "saveTagBot",
          },
          // { type: 'multiselect', displayValue: 'team_name', returnValue: 'team_id', label: 'Select Teams', formControlName: 'teams_bot', options: [], function: 'getTagBotList', saveFunction: 'saveMeetingList' },
          {
            type: "multiselect",
            displayValue: "channel_name",
            returnValue: "channel_id",
            label: "Select Groups",
            formControlName: "bot_channel_id",
            options: [],
            function: "getTagBotList",
            saveFunction: "saveTagBot",
          },
        ],
      },
      {
        commonLabel: "Teams Brain Notes",
        subLabel:
          "Effortlessly capture and upload your Team chats to Thunai Brain.",
        inputs: [
          // { type: 'multiselect', displayValue: 'displayValue', returnValue: 'returnValue', label: 'Select Notes Type', formControlName: 'notes_type', options: [{displayValue:'Brain Notes', returnValue:'brain_notes'},{displayValue:'Notes', returnValue:'notes'}], function: 'getBrainNotes', saveFunction: 'SaveBrainNotes' },
          {
            type: "multiselect",
            displayValue: "channel_name",
            returnValue: "channel_id",
            label: "Select Groups",
            formControlName: "brain_channel_id",
            options: [],
            function: "getTeamsBrainNotesList",
            saveFunction: "SaveBrainNotes",
          },
        ],
      },
    ],
  },
  // {
  //   name: 'minio_storage',
  //   service: minIoService,
  //   components: [

  //     {
  //       commonLabel: 'Microsoft Teams Direct Message',
  //       subLabel: 'Engage directly with the Thunai channel via Microsoft Teams DMs, using an integrated widget that ensures a consistent persona, robust security, and optimized language support.',
  //       inputs: [
  //         { type: 'select', displayValue: 'name', returnValue: 'widget_id', label: 'Select Widget', formControlName: 'widget_id', options: [], function: 'getDirectMsgDetial', saveFunction: 'changeDirectMessage' },

  //       ]
  //     },

  //   ]
  // },
];
