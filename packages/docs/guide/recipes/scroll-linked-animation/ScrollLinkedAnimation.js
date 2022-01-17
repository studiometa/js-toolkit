import { Base } from '@studiometa/js-toolkit';
import { map, damp, nextFrame, matrix } from '@studiometa/js-toolkit/utils';

export default class ScrollLinkedAnimation extends Base {
  static config = {
    name: 'ScrollLinkedAnimation',
    refs: ['cols[]', 'offsetItem'],
  };

  scrollDeltaY = 0;

  dampedScrollDeltaY = 0;

  scrollProgressY = 0;

  dampedScrollProgressY = 0;

  parallaxOffsetHeight = 100;

  mounted() {
    this.parallaxOffsetHeight = this.$refs.offsetItem.offsetHeight / 2;
  }

  resized() {
    this.parallaxOffsetHeight = this.$refs.offsetItem.offsetHeight / 2;
  }

  scrolled(props) {
    // Enable `ticked` service when it is disabled and the user scrolls
    if (props.changed.y && !this.$services.has('ticked')) {
      this.$services.enable('ticked');
    }

    this.scrollProgressY = props.progress.y;
    this.scrollDeltaY = props.delta.y;
  }

  ticked() {
    this.dampedScrollDeltaY = damp(this.scrollDeltaY, this.dampedScrollDeltaY, 0.05, 0.0001);

    this.dampedScrollProgressY = damp(
      this.scrollProgressY,
      this.dampedScrollProgressY,
      0.25,
      0.0001
    );

    this.$refs.cols.forEach((col, index) => {
      const skewY = index % 2 ? this.dampedScrollDeltaY * -0.005 : this.dampedScrollDeltaY * 0.005;

      let translateY;
      if (index % 2 === 0) {
        translateY = map(
          this.dampedScrollProgressY,
          0,
          1,
          this.parallaxOffsetHeight,
          this.parallaxOffsetHeight * -1
        );
      }

      col.style.transform = matrix({ skewY, translateY });
    });

    // Disable service when animation has ended
    if (this.dampedScrollDeltaY === this.scrollDeltaY) {
      this.$services.disable('ticked');
    }
  }
}
