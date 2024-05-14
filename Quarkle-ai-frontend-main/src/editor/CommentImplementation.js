import { Mark, mergeAttributes, Range } from "@tiptap/core";

const CommentImplementation = Mark.create({
  name: "commentImplementation",

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
          return el.getAttribute("data-implementation-id");
        },
        renderHTML: function (attrs) {
          return { "data-implementation-id": attrs.commentId };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-implementation-id]",
        getAttrs: function (el) {
          return !!el.getAttribute("data-implementation-id")?.trim() && null;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  onSelectionUpdate() {
    // Taken care of by Comment.js
  },

  addStorage() {
    return {
      activeCommentId: null,
    };
  },

  addCommands() {
    return {
      setCommentImplementation: function (commentId) {
        return function ({ commands }) {
          if (!commentId) return false;

          commands.setMark("commentImplementation", { commentId });
        };
      },
      acceptCommentImplementation: function (commentId) {
        return function ({ tr, dispatch }) {
          if (!commentId) return false;

          const commentMarksWithRange = [];

          tr.doc.descendants((node, pos) => {
            const commentMarks = node.marks.filter(
              (mark) => mark.type.name === "commentImplementation" && mark.attrs.commentId === commentId,
            );
            commentMarks.forEach((commentMark) => {
              commentMarksWithRange.push({
                mark: commentMark,
                from: pos,
                to: pos + node.nodeSize,
              });
            });
          });

          commentMarksWithRange.forEach(({ mark, from, to }) => {
            tr.removeMark(from, to, mark.type);
            // remove italics
            tr.removeMark(from, to, tr.doc.type.schema.marks.em);
            // remove color styling
            tr.removeMark(from, to, tr.doc.type.schema.marks.textColor);
          });

          // Dispatch the transaction if there are changes
          if (dispatch && tr.steps.length) {
            dispatch(tr);
          }

          // Return true to indicate that this command can be performed
          return true;
        };
      },

      rejectCommentImplementation: function (commentId) {
        return function ({ tr, dispatch }) {
          if (!commentId) return false;

          let hasDeletions = false;
          const deletions = [];

          tr.doc.descendants((node, pos) => {
            const commentMarks = node.marks.filter(
              (mark) => mark.type.name === "commentImplementation" && mark.attrs.commentId === commentId,
            );

            if (commentMarks.length) {
              // Remove the comment marks from the node.
              commentMarks.forEach((mark) => {
                tr.removeMark(pos, pos + node.nodeSize, mark);
              });
              // Mark the node for deletion
              deletions.push({ from: pos, to: pos + node.nodeSize });
              hasDeletions = true;
            }
          });

          // Sort deletions by 'from' position in descending order to delete from the end
          deletions.sort((a, b) => b.from - a.from);

          // Perform deletions after iteration
          deletions.forEach(({ from, to }) => tr.delete(from, to));

          // Dispatch the transaction if deletions were made
          if (hasDeletions && dispatch) {
            dispatch(tr);
          }

          // Return true to indicate that this command can be performed
          return hasDeletions;
        };
      },
    };
  },
});

export default CommentImplementation;
