import { Mark, mergeAttributes, Range } from "@tiptap/core";

const Comment = Mark.create({
  name: "comment",

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentActivated: () => {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: function (el) {
          return el.getAttribute("data-comment-id");
        },
        renderHTML: function (attrs) {
          return { "data-comment-id": attrs.commentId };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-comment-id]",
        getAttrs: function (el) {
          return !!el.getAttribute("data-comment-id")?.trim() && null;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  onSelectionUpdate() {
    const { $from } = this.editor.state.selection;

    const marks = $from.marks();
    const commentMark = this.editor.schema.marks.comment;
    const commentImplementationMark = this.editor.schema.marks.commentImplementation;

    const activeCommentMark = marks.find((mark) => [commentMark, commentImplementationMark].includes(mark.type));
    if (activeCommentMark) {
      this.storage.activeCommentId = activeCommentMark?.attrs.commentId || null;
      this.options.onCommentActivated(this.storage.activeCommentId);
      this.options.switchToCommentTab();
    } else {
      this.storage.activeCommentId = null;
      this.options.onCommentActivated(this.storage.activeCommentId);
      return;
    }
  },

  addStorage() {
    return {
      activeCommentId: null,
    };
  },

  addCommands() {
    return {
      setComment: function (commentId) {
        return function ({ commands }) {
          if (!commentId) return false;

          commands.setMark("comment", { commentId });
        };
      },
      unsetComment: function (commentId) {
        return function ({ tr, dispatch }) {
          if (!commentId) return false;

          const commentMarksWithRange = [];

          tr.doc.descendants((node, pos) => {
            const commentMark = node.marks.find((mark) => mark.type.name === "comment" && mark.attrs.commentId === commentId);

            if (!commentMark) return;

            commentMarksWithRange.push({
              mark: commentMark,
              range: {
                from: pos,
                to: pos + node.nodeSize,
              },
            });
          });

          commentMarksWithRange.forEach(({ mark, range }) => {
            tr.removeMark(range.from, range.to, mark);
          });

          return dispatch?.(tr);
        };
      },
      getCommentTextRange: function (commentId) {
        return function ({ tr }) {
          if (!commentId) return false;

          const commentMarksWithRange = [];

          tr.doc.descendants((node, pos) => {
            const commentMark = node.marks.find((mark) => mark.type.name === "comment" && mark.attrs.commentId === commentId);

            if (!commentMark) return;

            commentMarksWithRange.push({
              mark: commentMark,
              range: {
                from: pos,
                to: pos + node.nodeSize,
              },
            });
          });

          // If multiple comment marks are found, then range would be lowest and highest positions of the comment marks
          if (commentMarksWithRange.length > 0) {
            const from = commentMarksWithRange.reduce((min, range) => Math.min(min, range.range.from), Infinity);
            const to = commentMarksWithRange.reduce((max, range) => Math.max(max, range.range.to), -Infinity);
            return { from, to };
          }

          return null; // Return null if no comment marks are found
        };
      },
      toggleCommentStrikethrough: function (commentId) {
        return ({ tr, dispatch, editor }) => {
          if (!commentId) return false;

          const { strike, italic } = editor.schema.marks; // Assuming 'strike' is the correct name of the strikethrough mark

          const applyItalicsStrikethrough = (range) => {
            tr.addMark(range.from, range.to, strike.create());
            tr.addMark(range.from, range.to, italic.create());
          };

          tr.doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (mark.type.name === "comment" && mark.attrs.commentId === commentId) {
                applyItalicsStrikethrough({ from: pos, to: pos + node.nodeSize });
              }
            });
          });

          if (dispatch) dispatch(tr);
          return true;
        };
      },
    };
  },
});

export default Comment;
