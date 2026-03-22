// Import all dashboard icons
import gettingStartedGray from '../assets/images/dashboard/getting-started-gray.svg';
import meetingFeedGray from '../assets/images/dashboard/meeting_feed_gray.svg';
import revenueAiGray from '../assets/images/dashboard/revenue_ai_gray.svg';
import reflectAiGray from '../assets/images/dashboard/reflect_ai_gray.svg';
import commonAgent from '../assets/images/dashboard/common-agent.svg';
import omniGray from '../assets/images/dashboard/omni_gray.svg';
import brainGray from '../assets/images/dashboard/brain_gray.svg';
import applicationsGray from '../assets/images/dashboard/applications_gray.svg';
import streamsGray from '../assets/images/dashboard/streams_gray.svg';

export const menu = [
   {
    name: 'OVERVIEW',
    isOpen: true,
    subfolders: [
      { name: 'Getting Started', link: '/getting-started', icon: gettingStartedGray },
    ]
  },
  {
    name: 'COMPANION',
    isOpen: true,
    subfolders: [
      { name: 'Meeting Feed', link: '/meeting-feed', icon: meetingFeedGray },
      { name: 'Revenue AI', link: '/companion/revai', icon: revenueAiGray },
      { name: 'Reflect AI', link: '/salesEnablement/calldetail', icon: reflectAiGray },

    ]
  },
   {
    name: 'AGENTS',
    isOpen: true,
    subfolders: [
      { name: 'Agents', link: '/common-agent', icon: commonAgent },
      { name: 'Omni', link: '/omni', icon: omniGray },
    ]
  },
   {
    name: 'KNOWLEDGE BASE',
    isOpen: true,
    subfolders: [
      { name: 'Brain', link: '/brain', icon: brainGray },
    ]
  },
   {
    name: 'INTEGRATIONS',
    isOpen: true,
    subfolders: [
      { name: 'Applications', link: '/applications', icon: applicationsGray },
      { name: 'Streams', link: '/streams', icon: streamsGray },
    ]
  },
];