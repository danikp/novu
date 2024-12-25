import { useEffect, useState } from 'react';
import { useBootIntercom } from '@/hooks/use-boot-intercom';
import { RiQuestionFill } from 'react-icons/ri';
import { HeaderButton } from './header-button';
import { PLAIN_SUPPORT_CHAT_APP_ID } from '@/config';
import { useAuth } from '@/context/auth/hooks';
import * as Sentry from '@sentry/react';

// Add type declaration for Plain chat widget
declare global {
  interface Window {
    Plain?: {
      init: (config: any) => void;
      open: () => void;
    };
  }
}

export const CustomerSupportButton = () => {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { currentUser } = useAuth();

  const isLiveChatVisible = currentUser?.servicesHashes?.plain && PLAIN_SUPPORT_CHAT_APP_ID !== undefined;

  useBootIntercom();

  useEffect(() => {
    if (isFirstRender && isLiveChatVisible) {
      try {
        window?.Plain?.init({
          appId: PLAIN_SUPPORT_CHAT_APP_ID,
          hideLauncher: true,
          hideBranding: true,
          title: 'Chat with us',
          customerDetails: {
            email: currentUser?.email,
            emailHash: currentUser?.servicesHashes?.plain,
            externalId: currentUser?._id,
          },
          links: [
            {
              icon: 'book',
              text: 'Documentation',
              url: 'https://docs.novu.co?utm_campaign=in_app_live_chat',
            },
            {
              icon: 'integration',
              text: 'Roadmap',
              url: 'https://roadmap.novu.co/roadmap?utm_campaign=in_app_live_chat',
            },
            {
              icon: 'link',
              text: 'Changelog',
              url: 'https://roadmap.novu.co/changelog?utm_campaign=in_app_live_chat',
            },
            {
              icon: 'email',
              text: 'Contact Sales',
              url: 'https://notify.novu.co/meetings/novuhq/novu-discovery-session-rr?utm_campaign=in_app_live_chat',
            },
          ],
          entryPoint: 'default',
          theme: 'light',

          style: {
            brandColor: '#DD2450',
            launcherBackgroundColor: '#FFFFFF',
            launcherIconColor: '#FFFFFF',
          },

          logo: {
            url: 'https://dashboard.novu.co/static/images/novu.png',
            alt: 'Novu Logo',
          },
          chatButtons: [
            {
              icon: 'chat',
              text: 'Ask a question',
              threadDetails: {
                // "Question"
                labelTypeIds: ['lt_01JCJ36RM5P6QSYWXPB3FNC3QF'],
              },
            },
            {
              icon: 'bulb',
              text: 'Share Feedback',
              threadDetails: {
                // "Insight"
                labelTypeIds: ['lt_01JCKS50M6D1568DSJ1Q9CHFF2'],
              },
              form: {
                fields: [
                  {
                    type: 'dropdown',
                    placeholder: 'How important is this to you?',
                    options: [
                      {
                        icon: 'error',
                        text: 'Critical - Blocking my work',
                        threadDetails: {
                          labelTypeIds: ['lt_01JFYNG7N05VF956CABF23N3N8'],
                        },
                      },
                      {
                        icon: 'bulb',
                        text: 'Important - Should be addressed soon',
                        threadDetails: {
                          labelTypeIds: ['lt_01JFYNGRPEJ4CNA3GMYSRCRCYB'],
                        },
                      },
                      {
                        icon: 'chat',
                        text: 'Nice to have - Suggestion for improvement',
                        threadDetails: {
                          labelTypeIds: ['lt_01JFYNGE0EYWSE1GKAM3MTBDMC'],
                        },
                      },
                    ],
                  },
                ],
              },
            },
            {
              icon: 'bug',
              text: 'Report a bug',
              form: {
                fields: [
                  {
                    type: 'dropdown',
                    placeholder: 'Severity of the bug..',
                    options: [
                      {
                        icon: 'integration',
                        text: 'Unable to access the application',
                        threadDetails: {
                          // "Critical Severity, Bug"
                          labelTypeIds: ['lt_01JA88XK1N11JBBV55ZMYMEH85', 'lt_01JA88XK1N11JBBV55ZMYMEH85'],
                        },
                      },
                      {
                        icon: 'error',
                        text: 'Significant functionality impacted',
                        threadDetails: {
                          // "High Severity, Bug"
                          labelTypeIds: ['lt_01JE5V8FK3SHPR6N7XMDW8N005', 'lt_01JA88XK1N11JBBV55ZMYMEH85'],
                        },
                      },
                      {
                        icon: 'bug',
                        text: 'Minor inconvenience or issue',
                        threadDetails: {
                          // "Low Severity, Bug"
                          labelTypeIds: ['lt_01JE5V7R152BN3A9Z1R2251F1A', 'lt_01JA88XK1N11JBBV55ZMYMEH85'],
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        });
      } catch (error) {
        console.error('Error initializing plain chat: ', error);
        Sentry.captureException(error);
      }
    }
    setIsFirstRender(false);
  }, [isLiveChatVisible, currentUser, isFirstRender]);

  const showPlainLiveChat = () => {
    if (isLiveChatVisible) {
      try {
        console.log('Opening plain chat', window?.Plain);
        window?.Plain?.open();
      } catch (error) {
        console.error('Error opening plain chat: ', error);
        Sentry.captureException(error);
      }
    }
  };
  return (
    <button tabIndex={-1} className="flex items-center justify-center" onClick={showPlainLiveChat}>
      <HeaderButton label="Help">
        <RiQuestionFill className="text-foreground-600 size-4" />{' '}
      </HeaderButton>
    </button>
  );
};
