import Vue from 'vue';

import ListenersMixin from '../../mixins/listeners.js';

import { slot } from '../../utils/slot.js';

export default Vue.extend({
  name: 'QItemLabel',

  mixins: [ListenersMixin],

  props: {
    overline: Boolean,
    caption: Boolean,
    header: Boolean,
    lines: [Number, String]
  },

  computed: {
    classes() {
      return {
        'q-item__label--overline text-overline': this.overline,
        'q-item__label--caption text-caption': this.caption,
        'q-item__label--header': this.header,
        ellipsis: parseInt(this.lines, 10) === 1
      };
    },

    style() {
      if (this.lines !== void 0 && parseInt(this.lines, 10) > 1) {
        return {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': this.lines
        };
      } else return null;
    }
  },

  render(h) {
    return h(
      'div',
      {
        staticClass: 'q-item__label',
        style: this.style,
        class: this.classes,
        on: { ...this.qListeners }
      },
      slot(this, 'default')
    );
  }
});
