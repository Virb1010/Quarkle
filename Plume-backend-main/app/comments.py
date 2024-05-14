from models import db, Comments, comment_schema
from auth import requires_auth
from flask import abort, request, jsonify


@requires_auth
def get_multiple_comments():
    # Retrieve the 'ids' query parameter
    ids = request.args.get("ids")

    if not ids:
        abort(400, description="No IDs provided")

    # Split the string by commas to get a list of IDs
    try:
        comment_ids = [int(id) for id in ids.split(",")]
    except ValueError:
        abort(400, description="Invalid IDs format")

    # Query the database for the comments
    comments = Comments.query.filter(Comments.id.in_(comment_ids)).all()

    if not comments:
        abort(404, description="Comments not found")

    # Serialize the comments using the schema
    result = comment_schema.dump(comments, many=True)
    return jsonify(result), 200


@requires_auth
def resolve(comment_id):
    existing_comment = Comments.query.filter(Comments.id == comment_id).one_or_none()

    if existing_comment is None:
        abort(404, f"Comment not found")

    existing_comment.resolved = True
    db.session.commit()

    return comment_schema.dump(existing_comment), 200


@requires_auth
def activate(comment_id):
    existing_comment = Comments.query.filter(Comments.id == comment_id).one_or_none()

    if existing_comment is None:
        abort(404, f"Comment not found")

    existing_comment.resolved = False
    db.session.commit()

    return comment_schema.dump(existing_comment), 200


@requires_auth
def thumbs_up(comment_id):
    existing_comment = Comments.query.filter(Comments.id == comment_id).one_or_none()

    if existing_comment is None:
        abort(404, f"Comment not found")

    existing_comment.rating = 1
    db.session.commit()

    return comment_schema.dump(existing_comment), 200


@requires_auth
def thumbs_down(comment_id):
    existing_comment = Comments.query.filter(Comments.id == comment_id).one_or_none()

    if existing_comment is None:
        abort(404, f"Comment not found")

    existing_comment.rating = -1
    db.session.commit()

    return comment_schema.dump(existing_comment), 200
