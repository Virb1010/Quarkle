import { Mark, mergeAttributes } from "@tiptap/core";

const SpanMark = Mark.create({
  name: "spanMark",

  addOptions: {
    HTMLAttributes: {
      class: "default-class-name", // default class name for the span
    },
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-mark-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return { "data-mark-id": attributes.id };
        },
      },
      class: {
        default: "default-class-name",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          if (!attributes.class) {
            return {};
          }
          return { class: attributes.class };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-mark-id]",
        getAttrs: (element) => ({
          id: element.getAttribute("data-mark-id"),
          class: element.getAttribute("class"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setSpanMark:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetSpanMark:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      deleteSpanMark:
        (id) =>
        ({ tr, state, dispatch }) => {
          const { doc, selection } = state;
          let { from, to } = selection;

          // Find the range of the span with the specific id
          doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (mark.type.name === this.name && mark.attrs.id === id) {
                from = Math.min(pos, from);
                to = Math.max(pos + node.nodeSize, to);
              }
            });
          });

          // Dispatch transaction to delete the range and remove the mark
          if (dispatch) {
            tr.removeMark(from, to, this.type).delete(from, to);
            dispatch(tr);
          }

          // Return true to indicate that this command can be performed
          return true;
        },
    };
  },
});

export default SpanMark;
