import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noWriteInReadPhase } from './no-write-in-read-phase.ts';

describe('no-write-in-read-phase', () => {
  it('passes and fails correctly', () => {
    tester.run('no-write-in-read-phase', noWriteInReadPhase as any, {
      valid: [
        // The shape `Carousel` arrived at: measure in the hook, return the write.
        `class Carousel extends Base {
           ticked() {
             const { progress } = this;
             if (progress === this.previous) return;
             this.previous = progress;
             this.$emit('progress', { progress });
             return () => {
               this.$el.style.setProperty('--carousel-progress', String(progress));
             };
           }
         }`,
        // A write hopped explicitly onto the write lane.
        `class Foo extends Base {
           ticked() {
             const width = this.$el.offsetWidth;
             this.$write(() => {
               this.$el.style.width = width + 'px';
             });
           }
         }`,
        // Emitting is not a DOM write.
        `class Foo extends Base {
           ticked() {
             this.$emit('tick');
             this.$el.dispatchEvent(new CustomEvent('tick'));
           }
         }`,
        // Reading scrollLeft is the whole point of the read phase.
        `class Foo extends Base {
           scrolled() {
             const x = this.$refs.wrapper.scrollLeft;
             return x;
           }
         }`,
        // mounted() is not a read-phase context.
        `class Foo extends Base {
           mounted() {
             this.$el.style.transform = 'none';
           }
         }`,
        // resize and pointer emit from their observer, in no phase at all.
        `class Foo extends Base {
           resized() {
             this.$el.style.transform = 'none';
           }
           moved() {
             this.$el.classList.add('is-moving');
           }
         }`,
        // An unanchored receiver is not a DOM root the component owns.
        `class Foo extends Base {
           ticked() {
             this.state.value = 3;
             this.cache.remove();
           }
         }`,
        // Only the read-phase services arm the rule.
        `class Foo extends Base {
           mounted() {
             return useResize().subscribe(() => {
               this.$el.style.transform = 'none';
             });
           }
         }`,
        // A helper which schedules its own write is correct at one level down.
        // The `@write` spelling of the same exemption cannot be written here —
        // espree parses no decorators — and is covered by ast.spec.ts.
        `class Cursor extends Base {
           ticked() {
             this.render(1);
           }
           render(x) {
             this.$write(() => {
               this.$el.style.transform = 'translate(' + x + 'px)';
             });
           }
         }`,
        // A plain class with a `ticked` method is not a component.
        `class Timer {
           ticked() {
             document.body.style.color = 'red';
           }
         }`,
        // Extending something is not enough. A `ticked` method cannot be its
        // own proof of being a component, or the test would be circular.
        `class Store extends Error {
           ticked() {
             document.body.style.color = 'red';
           }
         }`,
        // Nor does an unrelated subclass become one by holding a scheduler.
        `class Queue extends Array {
           scrolled() {
             document.body.classList.add('x');
           }
         }`,
      ],
      invalid: [
        {
          code: `class Foo extends Base {
                   ticked() {
                     this.$el.style.transform = 'none';
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          code: `class Foo extends Base {
                   scrolled() {
                     this.$el.style.setProperty('--y', '1');
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          code: `class Foo extends Base {
                   scrolledInView() {
                     this.$refs.inner.textContent = 'hello';
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          code: `class Foo extends Base {
                   mounted() {
                     return useRaf().subscribe(() => {
                       this.$el.classList.add('is-ticking');
                     });
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          code: `class Foo extends Base {
                   mounted() {
                     this.$read(() => {
                       this.$refs.inner.innerHTML = '';
                     });
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          code: `class Foo extends Base {
                   mounted() {
                     defaultScheduler.read(() => {
                       document.body.setAttribute('data-x', '1');
                     });
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          // A local const initialised from an anchored root stays anchored.
          code: `class Foo extends Base {
                   ticked() {
                     const el = this.$refs.wrapper;
                     el.scrollTop = 0;
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          // A smoothTo subscriber fans out inside the raf read phase.
          code: `class Cursor extends Base {
                   motion = smoothTo({ x: 0 });
                   mounted() {
                     return this.motion.subscribe((values) => {
                       this.$el.style.transform = 'translateX(' + values.x + 'px)';
                     });
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          // One level of `this.<name>()` resolution, because the write is real.
          code: `class Foo extends Base {
                   ticked() {
                     this.paint();
                   }
                   paint() {
                     this.$el.style.opacity = '1';
                   }
                 }`,
          errors: [{ messageId: 'writeInHelper' }],
        },
        {
          code: `class Foo extends Base {
                   scrolled() {
                     this.$el.scrollTo(0, 0);
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          // A subclass of a local abstract component, with no decorator and no
          // static config: the framework surface it reaches for is the proof.
          // The base lives in another file, so nothing else could be.
          code: `class CarouselItem extends AbstractCarouselChild {
                   ticked() {
                     this.$el.style.transform = 'none';
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
        {
          // The surface may be anywhere in the body, not only in the hook.
          code: `class SliderItem extends Indexable {
                   mounted() {
                     this.$emit('ready');
                   }
                   scrolled() {
                     document.body.style.color = 'red';
                   }
                 }`,
          errors: [{ messageId: 'writeInReadPhase' }],
        },
      ],
    });
  });
});
