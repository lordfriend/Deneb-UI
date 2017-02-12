import {EventEmitter, AnimationTransitionEvent} from '@angular/core';
/**
 * Animation handler for toast component which has enter and leave animations.
 */
export interface UIToastAnimation {
    animationEvent: EventEmitter<any>;
    uiLeaveAnimationDone(event: AnimationTransitionEvent);
}
