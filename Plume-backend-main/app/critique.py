from flask import make_response, _request_ctx_stack

from AI.AI_helper import token_counter
from AI.read_text import provide_editorial_report
from auth import requires_auth
from models import db, Books, Users, Chapters
from users import is_pro_user
import re

DAILY_TOKEN_LIMIT = 60000


@requires_auth
def analyze(chapter_id):
    auth_id = _request_ctx_stack.top.current_user["sub"]
    user = Users.query.filter(Users.auth_id == auth_id).one_or_none()

    use_pro_model = is_pro_user(user)

    chapter = Chapters.query.filter(Chapters.id == chapter_id).one_or_none()

    if chapter is None:
        return make_response(["No chapter found"], 200)

    if chapter.book.user_id != user.id:
        return make_response(["User does not own book"], 401)

    chapter_content = f"{chapter.chapter_number} {chapter.title}\n{chapter.content}"

    tokens_used_input = token_counter(chapter_content)
    user.tokens_used_today += tokens_used_input
    db.session.commit()

    critique = provide_editorial_report(chapter_content, use_pro_model)

    response_dict = dict(
        chunk_id=critique.chunk_id,
        summary=critique.summary,
        criticism=critique.criticism,
        strength1=critique.strength1,
        strength2=critique.strength2,
        strength3=critique.strength3,
        aoi1=critique.aoi1,
        aoi2=critique.aoi2,
        aoi3=critique.aoi3,
        rating=critique.rating,
    )
    print(response_dict)
    return response_dict, 200
