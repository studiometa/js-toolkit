import type { Base, BaseProps } from './index.js';
import type {
  KeyServiceProps,
  PointerServiceProps,
  RafServiceProps,
  ResizeServiceProps,
  ScrollServiceProps,
} from '../services/index.js';
import { type EventManagerCallbackParams } from './managers/EventsManager.js';

export type BaseEventHookParams<T extends Event = Event> = EventManagerCallbackParams<T>;

export interface BaseInterface {
  /**
   * Trigger the `mounted` callback.
   * @link https://js-toolkit.studiometa.dev/api/instance-methods.html#mount
   */
  $mount?(): Promise<this>

  /**
   * Update the instance children.
   * @link https://js-toolkit.studiometa.dev/api/instance-methods.html#update
   */
  $update?(): Promise<this>;

  /**
   * Trigger the `destroyed` callback.
   * @link https://js-toolkit.studiometa.dev/api/instance-methods.html#destroy
   */
  $destroy?(): Promise<this>;

  /**
   * Terminate a child instance when it is not needed anymore.
   * @link https://js-toolkit.studiometa.dev/api/instance-methods.html#terminate
   */
  $terminate?(): Promise<void>;

  /**
   * Bind a listener function to an event.
   *
   * @param event Name of the event.
   * @param listener Function to be called.
   * @param [options] Options for the `removeEventListener` method.
   * @return A function to unbind the listener.
   * @link https://js-toolkit.studiometa.dev/api/instance-methods.html#on-event-callback-options
   */
  $on(
    event: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): () => void;

  /**
   * Unbind a listener function from an event.
   *
   * @param event Name of the event.
   * @param listener Function to be removed.
   * @param [options] Options for the `removeEventListener` method.
   * @link https://js-toolkit.studiometa.dev/api/instance-methods.html#off-event-callback-options
   */
  $off(
    event: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void

  /**
   * Emits an event.
   *
   * @param event Name of the event.
   * @param args The arguments to apply to the functions bound to this event.
   * @link https://js-toolkit.studiometa.dev/api/instance-methods.html#emit-event-args
   */
  $emit(event: string | Event, ...args: unknown[]): void;

  /**
   * Mounted hook.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-lifecycle.html#mounted
   */
  mounted?(): void;

  /**
   * Updated hook.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-lifecycle.html#updated
   */
  updated?(): void;

  /**
   * Destroyed hook.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-lifecycle.html#destroyed
   */
  destroyed?(): void;

  /**
   * Terminated hook.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-lifecycle.html#terminated
   */
  terminated?(): void;

  /**
   * Key service, executed when a keyboard key is pressed or released.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-services.html#keyed
   */
  keyed?(props: KeyServiceProps): void;

  /**
   * Pointer service, executed when the pointer is moving, pressed or released.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-services.html#moved
   */
  moved?(props: PointerServiceProps): void;

  /**
   * Raf service, executed on each rendered frame.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-services.html#ticked
   * @returns A callback function that will be called on the "write" step of the DOM scheduler.
   * @link https://js-toolkit.studiometa.dev/utils/domScheduler.html
   */
  ticked?(props: RafServiceProps): void | (() => void);

  /**
   * Resize service, executed when the window is resized.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-services.html#resized
   */
  resized?(props: ResizeServiceProps): void;

  /**
   * Scroll service, executed when the document is scrolled.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-services.html#scrolled
   */
  scrolled?(props: ScrollServiceProps): void;

  /**
   * Hook for the `abort` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onAbort?(context: BaseEventHookParams<UIEvent>): void;

  /**
   * Hook for the `animationcancel` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onAnimationcancel?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onAnimationend?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationiteration` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onAnimationiteration?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onAnimationstart?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `auxclick` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onAuxclick?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `beforeinput` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onBeforeinput?(context: BaseEventHookParams<InputEvent>): void;

  /**
   * Hook for the `beforematch` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onBeforematch?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `beforetoggle` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onBeforetoggle?(context: BaseEventHookParams<ToggleEvent>): void;

  /**
   * Hook for the `blur` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onBlur?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `cancel` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCancel?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `canplay` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCanplay?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `canplaythrough` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCanplaythrough?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `change` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onChange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `click` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onClick?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `close` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onClose?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `compositionend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCompositionend?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `compositionstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCompositionstart?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `compositionupdate` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCompositionupdate?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `contextlost` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onContextlost?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `contextmenu` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onContextmenu?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `contextrestored` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onContextrestored?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `copy` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCopy?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `cuechange` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCuechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `cut` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onCut?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `dblclick` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDblclick?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `drag` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDrag?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDragend?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragenter` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDragenter?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragleave` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDragleave?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragover` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDragover?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDragstart?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `drop` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDrop?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `durationchange` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDurationchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `emptied` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onEmptied?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `ended` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onEnded?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `error` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onError?(context: BaseEventHookParams<ErrorEvent>): void;

  /**
   * Hook for the `focus` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onFocus?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `focusin` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onFocusin?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `focusout` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onFocusout?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `formdata` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onFormdata?(context: BaseEventHookParams<FormDataEvent>): void;

  /**
   * Hook for the `gotpointercapture` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onGotpointercapture?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `input` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onInput?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `invalid` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onInvalid?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `keydown` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onKeydown?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `keypress` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onKeypress?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `keyup` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onKeyup?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `load` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onLoad?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadeddata` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onLoadeddata?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadedmetadata` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onLoadedmetadata?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onLoadstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `lostpointercapture` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onLostpointercapture?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `mousedown` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onMousedown?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseenter` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onMouseenter?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseleave` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onMouseleave?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mousemove` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onMousemove?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseout` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onMouseout?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseover` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onMouseover?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseup` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onMouseup?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `paste` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPaste?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `pause` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPause?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `play` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPlay?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `playing` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPlaying?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `pointercancel` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointercancel?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerdown` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointerdown?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerenter` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointerenter?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerleave` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointerleave?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointermove` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointermove?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerout` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointerout?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerover` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointerover?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerrawupdate` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointerrawupdate?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `pointerup` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onPointerup?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `progress` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onProgress?(context: BaseEventHookParams<ProgressEvent>): void;

  /**
   * Hook for the `ratechange` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onRatechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `reset` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onReset?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `resize` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onResize?(context: BaseEventHookParams<UIEvent>): void;

  /**
   * Hook for the `scroll` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onScroll?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `scrollend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onScrollend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `securitypolicyviolation` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSecuritypolicyviolation?(context: BaseEventHookParams<SecurityPolicyViolationEvent>): void;

  /**
   * Hook for the `seeked` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSeeked?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `seeking` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSeeking?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `select` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSelect?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `selectionchange` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSelectionchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `selectstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSelectstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `slotchange` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSlotchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `stalled` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onStalled?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `submit` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSubmit?(context: BaseEventHookParams<SubmitEvent>): void;

  /**
   * Hook for the `suspend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onSuspend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `timeupdate` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTimeupdate?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `toggle` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onToggle?(context: BaseEventHookParams<ToggleEvent>): void;

  /**
   * Hook for the `touchcancel` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTouchcancel?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTouchend?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchmove` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTouchmove?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTouchstart?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `transitioncancel` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTransitioncancel?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTransitionend?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionrun` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTransitionrun?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onTransitionstart?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `volumechange` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onVolumechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `waiting` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWaiting?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWebkitanimationend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationiteration` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWebkitanimationiteration?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationstart` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWebkitanimationstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkittransitionend` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWebkittransitionend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `wheel` event.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWheel?(context: BaseEventHookParams<WheelEvent>): void;

  /**
   * Hook for the `abort` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentAbort?(context: BaseEventHookParams<UIEvent>): void;

  /**
   * Hook for the `animationcancel` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentAnimationcancel?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentAnimationend?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationiteration` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentAnimationiteration?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentAnimationstart?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `auxclick` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentAuxclick?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `beforeinput` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentBeforeinput?(context: BaseEventHookParams<InputEvent>): void;

  /**
   * Hook for the `beforematch` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentBeforematch?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `beforetoggle` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentBeforetoggle?(context: BaseEventHookParams<ToggleEvent>): void;

  /**
   * Hook for the `blur` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentBlur?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `cancel` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCancel?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `canplay` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCanplay?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `canplaythrough` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCanplaythrough?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `change` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentChange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `click` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentClick?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `close` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentClose?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `compositionend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCompositionend?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `compositionstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCompositionstart?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `compositionupdate` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCompositionupdate?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `contextlost` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentContextlost?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `contextmenu` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentContextmenu?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `contextrestored` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentContextrestored?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `copy` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCopy?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `cuechange` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCuechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `cut` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentCut?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `dblclick` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDblclick?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `drag` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDrag?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDragend?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragenter` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDragenter?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragleave` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDragleave?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragover` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDragover?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDragstart?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `drop` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDrop?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `durationchange` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentDurationchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `emptied` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentEmptied?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `ended` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentEnded?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `error` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentError?(context: BaseEventHookParams<ErrorEvent>): void;

  /**
   * Hook for the `focus` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentFocus?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `focusin` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentFocusin?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `focusout` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentFocusout?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `formdata` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentFormdata?(context: BaseEventHookParams<FormDataEvent>): void;

  /**
   * Hook for the `gotpointercapture` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentGotpointercapture?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `input` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentInput?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `invalid` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentInvalid?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `keydown` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentKeydown?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `keypress` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentKeypress?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `keyup` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentKeyup?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `load` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentLoad?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadeddata` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentLoadeddata?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadedmetadata` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentLoadedmetadata?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentLoadstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `lostpointercapture` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentLostpointercapture?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `mousedown` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentMousedown?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseenter` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentMouseenter?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseleave` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentMouseleave?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mousemove` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentMousemove?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseout` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentMouseout?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseover` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentMouseover?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseup` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentMouseup?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `paste` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPaste?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `pause` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPause?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `play` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPlay?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `playing` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPlaying?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `pointercancel` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointercancel?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerdown` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointerdown?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerenter` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointerenter?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerleave` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointerleave?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointermove` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointermove?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerout` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointerout?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerover` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointerover?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerrawupdate` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointerrawupdate?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `pointerup` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentPointerup?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `progress` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentProgress?(context: BaseEventHookParams<ProgressEvent>): void;

  /**
   * Hook for the `ratechange` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentRatechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `reset` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentReset?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `resize` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentResize?(context: BaseEventHookParams<UIEvent>): void;

  /**
   * Hook for the `scroll` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentScroll?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `scrollend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentScrollend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `securitypolicyviolation` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSecuritypolicyviolation?(context: BaseEventHookParams<SecurityPolicyViolationEvent>): void;

  /**
   * Hook for the `seeked` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSeeked?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `seeking` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSeeking?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `select` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSelect?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `selectionchange` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSelectionchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `selectstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSelectstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `slotchange` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSlotchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `stalled` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentStalled?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `submit` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSubmit?(context: BaseEventHookParams<SubmitEvent>): void;

  /**
   * Hook for the `suspend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentSuspend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `timeupdate` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTimeupdate?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `toggle` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentToggle?(context: BaseEventHookParams<ToggleEvent>): void;

  /**
   * Hook for the `touchcancel` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTouchcancel?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTouchend?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchmove` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTouchmove?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTouchstart?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `transitioncancel` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTransitioncancel?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTransitionend?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionrun` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTransitionrun?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentTransitionstart?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `volumechange` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentVolumechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `waiting` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentWaiting?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentWebkitanimationend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationiteration` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentWebkitanimationiteration?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationstart` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentWebkitanimationstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkittransitionend` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentWebkittransitionend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `wheel` event emitted on `document`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onDocumentWheel?(context: BaseEventHookParams<WheelEvent>): void;

     /**
   * Hook for the `abort` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowAbort?(context: BaseEventHookParams<UIEvent>): void;

  /**
   * Hook for the `animationcancel` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowAnimationcancel?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowAnimationend?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationiteration` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowAnimationiteration?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `animationstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowAnimationstart?(context: BaseEventHookParams<AnimationEvent>): void;

  /**
   * Hook for the `auxclick` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowAuxclick?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `beforeinput` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowBeforeinput?(context: BaseEventHookParams<InputEvent>): void;

  /**
   * Hook for the `beforematch` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowBeforematch?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `beforetoggle` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowBeforetoggle?(context: BaseEventHookParams<ToggleEvent>): void;

  /**
   * Hook for the `blur` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowBlur?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `cancel` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCancel?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `canplay` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCanplay?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `canplaythrough` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCanplaythrough?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `change` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowChange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `click` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowClick?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `close` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowClose?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `compositionend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCompositionend?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `compositionstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCompositionstart?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `compositionupdate` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCompositionupdate?(context: BaseEventHookParams<CompositionEvent>): void;

  /**
   * Hook for the `contextlost` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowContextlost?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `contextmenu` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowContextmenu?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `contextrestored` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowContextrestored?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `copy` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCopy?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `cuechange` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCuechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `cut` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowCut?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `dblclick` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDblclick?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `drag` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDrag?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDragend?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragenter` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDragenter?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragleave` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDragleave?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragover` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDragover?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `dragstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDragstart?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `drop` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDrop?(context: BaseEventHookParams<DragEvent>): void;

  /**
   * Hook for the `durationchange` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowDurationchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `emptied` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowEmptied?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `ended` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowEnded?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `error` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowError?(context: BaseEventHookParams<ErrorEvent>): void;

  /**
   * Hook for the `focus` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowFocus?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `focusin` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowFocusin?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `focusout` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowFocusout?(context: BaseEventHookParams<FocusEvent>): void;

  /**
   * Hook for the `formdata` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowFormdata?(context: BaseEventHookParams<FormDataEvent>): void;

  /**
   * Hook for the `gotpointercapture` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowGotpointercapture?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `input` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowInput?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `invalid` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowInvalid?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `keydown` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowKeydown?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `keypress` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowKeypress?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `keyup` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowKeyup?(context: BaseEventHookParams<KeyboardEvent>): void;

  /**
   * Hook for the `load` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowLoad?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadeddata` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowLoadeddata?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadedmetadata` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowLoadedmetadata?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `loadstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowLoadstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `lostpointercapture` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowLostpointercapture?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `mousedown` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowMousedown?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseenter` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowMouseenter?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseleave` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowMouseleave?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mousemove` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowMousemove?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseout` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowMouseout?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseover` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowMouseover?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `mouseup` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowMouseup?(context: BaseEventHookParams<MouseEvent>): void;

  /**
   * Hook for the `paste` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPaste?(context: BaseEventHookParams<ClipboardEvent>): void;

  /**
   * Hook for the `pause` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPause?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `play` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPlay?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `playing` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPlaying?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `pointercancel` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointercancel?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerdown` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointerdown?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerenter` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointerenter?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerleave` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointerleave?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointermove` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointermove?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerout` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointerout?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerover` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointerover?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `pointerrawupdate` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointerrawupdate?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `pointerup` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowPointerup?(context: BaseEventHookParams<PointerEvent>): void;

  /**
   * Hook for the `progress` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowProgress?(context: BaseEventHookParams<ProgressEvent>): void;

  /**
   * Hook for the `ratechange` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowRatechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `reset` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowReset?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `resize` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowResize?(context: BaseEventHookParams<UIEvent>): void;

  /**
   * Hook for the `scroll` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowScroll?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `scrollend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowScrollend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `securitypolicyviolation` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSecuritypolicyviolation?(context: BaseEventHookParams<SecurityPolicyViolationEvent>): void;

  /**
   * Hook for the `seeked` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSeeked?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `seeking` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSeeking?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `select` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSelect?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `selectionchange` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSelectionchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `selectstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSelectstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `slotchange` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSlotchange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `stalled` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowStalled?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `submit` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSubmit?(context: BaseEventHookParams<SubmitEvent>): void;

  /**
   * Hook for the `suspend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowSuspend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `timeupdate` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTimeupdate?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `toggle` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowToggle?(context: BaseEventHookParams<ToggleEvent>): void;

  /**
   * Hook for the `touchcancel` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTouchcancel?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTouchend?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchmove` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTouchmove?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `touchstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTouchstart?(context: BaseEventHookParams<TouchEvent>): void;

  /**
   * Hook for the `transitioncancel` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTransitioncancel?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTransitionend?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionrun` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTransitionrun?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `transitionstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowTransitionstart?(context: BaseEventHookParams<TransitionEvent>): void;

  /**
   * Hook for the `volumechange` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowVolumechange?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `waiting` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowWaiting?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowWebkitanimationend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationiteration` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowWebkitanimationiteration?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkitanimationstart` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowWebkitanimationstart?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `webkittransitionend` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowWebkittransitionend?(context: BaseEventHookParams<Event>): void;

  /**
   * Hook for the `wheel` event emitted on `window`.
   * @link https://js-toolkit.studiometa.dev/api/methods-hooks-events.html#on-event
   */
  onWindowWheel?(context: BaseEventHookParams<WheelEvent>): void;
}

export type BaseDecorator<
  S extends BaseInterface,
  T extends Base,
  U extends BaseProps = BaseProps,
> = {
  new <W extends BaseProps = BaseProps>(...args: unknown[]): S & T & Base<W & U>;
} & Partial<Pick<T, keyof T>> &
  Pick<typeof Base, keyof typeof Base>;
