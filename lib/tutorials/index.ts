import { blinkLedTutorial }           from './definitions/blink-led';
import { buttonLedTutorial }          from './definitions/button-led';
import { trafficLightTutorial }       from './definitions/traffic-light';
import { sensorDashboardTutorial }    from './definitions/sensor-dashboard';
import { pwmFadeTutorial }            from './definitions/pwm-fade';
import { rgbCycleTutorial }           from './definitions/rgb-cycle';
import { reactionTimerTutorial }      from './definitions/reaction-timer';
import { morseCodeTutorial }          from './definitions/morse-code';
import { touchscreenDashboardTutorial } from './definitions/touchscreen-dashboard';
import { smartHomeTutorial }          from './definitions/smart-home';
import { smartOfficeTutorial }        from './definitions/smart-office';
import type { TutorialDefinition } from './types';

export const tutorials: TutorialDefinition[] = [
  blinkLedTutorial,
  buttonLedTutorial,
  trafficLightTutorial,
  pwmFadeTutorial,
  rgbCycleTutorial,
  reactionTimerTutorial,
  morseCodeTutorial,
  sensorDashboardTutorial,
  touchscreenDashboardTutorial,
  smartHomeTutorial,
  smartOfficeTutorial,
];
export function getTutorial(id: string) { return tutorials.find(t => t.id === id); }
export type { TutorialDefinition, TutorialStep, CompletionCondition } from './types';
