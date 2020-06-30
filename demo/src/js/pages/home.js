import { Base } from '../../../../src';

class Home extends Base {
  get config() {
    return {
      // debug: true,
      name: 'Home',
      components: {
        Cursor: () => import(/* webpackChunkName: "async/Cursor" */ '../components/Cursor'),
      },
    };
  }

  mounted() {
    this.$log('Mounted 🎉');
  }

  resized(props) {
    this.$log('resized', props);
  }

  scrolled(props) {
    this.$log('scrolled', props);
  }
}

export default new Home(document.documentElement);
