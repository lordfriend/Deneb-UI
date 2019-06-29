import {EventEmitter} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
/**
 * Animation handler for toast component which has enter and leave animations.
 */
export interface UIToastAnimation {
    animationEvent: EventEmitter<any>;
    uiLeaveAnimationDone(event: AnimationEvent);
}
