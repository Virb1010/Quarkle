from config import db, ma
from marshmallow_sqlalchemy import fields
import datetime
from sqlalchemy.dialects.mysql import MEDIUMTEXT


now = datetime.datetime.utcnow


class Chapters(db.Model):
    __tablename__ = "chapters"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.Text())
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    chapter_number = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=now, nullable=False)


class ChapterSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Chapters
        load_instance = True
        sqla_session = db.session
        include_fk = True


class Books(db.Model):
    __tablename__ = "books"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(64), nullable=False)
    time_posted = db.Column(db.DateTime, default=now, nullable=False)
    time_updated = db.Column(db.DateTime, default=now, nullable=False)
    chapters = db.relationship(
        Chapters,
        backref="book",
        cascade="all, delete, delete-orphan",
        single_parent=True,
    )
    category = db.Column(db.String(255))
    is_category_updated_by_user = db.Column(db.Boolean, default=False)


class BookSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Books
        load_instance = True
        sqla_session = db.session
        include_fk = True

    chapters = fields.Nested(ChapterSchema, many=True)


class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(64), nullable=False)
    auth_id = db.Column(db.String(64), nullable=True)
    books = db.relationship(
        Books, backref="user", cascade="all, delete, delete-orphan", single_parent=True
    )
    tokens_used_today = db.Column(db.Integer, default=0, nullable=False)
    accepted_terms = db.Column(db.Boolean, default=False, nullable=False)


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Users
        load_instance = True
        sqla_session = db.session
        include_relationships = True

    books = fields.Nested(BookSchema, many=True)


class Chats(db.Model):
    __tablename__ = "chats"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    message = db.Column(db.Text())
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    conversation_id = db.Column(
        db.Integer, db.ForeignKey("conversations.id"), nullable=False
    )
    is_user = db.Column(db.Boolean, nullable=False)
    sent_at = db.Column(db.DateTime, default=now, nullable=False)


class ChatsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Chats
        load_instance = True
        sqla_session = db.session
        include_fk = True


# TODO: change foreign key to chapters.id once ready
class Comments(db.Model):
    __tablename__ = "comments"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    title = db.Column(db.String(64), nullable=False)
    message = db.Column(db.Text())
    is_user = db.Column(db.Boolean, nullable=False)
    resolved = db.Column(db.Boolean, nullable=False)
    sent_at = db.Column(db.DateTime, default=now, nullable=False)
    parent_comment_id = db.Column(db.Integer, nullable=True)
    rating = db.Column(db.Integer, nullable=False)


class CommentsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Comments
        load_instance = True
        sqla_session = db.session
        include_fk = True


class Summaries(db.Model):
    __tablename__ = "summaries"
    summary_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    summary_text = db.Column(db.Text())


class SummariesSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Summaries
        load_instance = True
        sqla_session = db.session
        include_fk = True


class Conversations(db.Model):
    __tablename__ = "conversations"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, nullable=False)
    archived = db.Column(db.Boolean, default=False)
    chats = db.relationship(
        "Chats",
        backref="conversation",
        cascade="all, delete, delete-orphan",
        single_parent=True,
    )


class ConversationsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Conversations
        load_instance = True
        sqla_session = db.session
        include_fk = True


class Subscriptions(db.Model):
    __tablename__ = "subscriptions"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=now, nullable=False)
    updated_at = db.Column(db.DateTime, default=now, nullable=False)
    subscription_type = db.Column(db.String(64), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False)
    stripe_subscription_id = db.Column(db.String(64), unique=True)
    stripe_customer_id = db.Column(db.String(64))
    stripe_payment_method = db.Column(db.String(64))
    stripe_price_id = db.Column(db.String(64))
    stripe_subscription_status = db.Column(db.String(64))
    stripe_current_period_end = db.Column(db.DateTime)
    stripe_current_period_start = db.Column(db.DateTime)
    stripe_cancel_at_period_end = db.Column(db.Boolean)


class SubscriptionsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Subscriptions
        load_instance = True
        sqla_session = db.session
        include_fk = True


user_schema = UserSchema()
users_schema = UserSchema(many=True)
book_schema = BookSchema()
books_schema = BookSchema(many=True)
chat_schema = ChatsSchema()
chats_schema = ChatsSchema(many=True)
chapter_schema = ChapterSchema()
chapters_schema = ChapterSchema(many=True)
comment_schema = CommentsSchema()
comments_schema = CommentsSchema(many=True)
summary_schema = SummariesSchema()
summaries_schema = SummariesSchema(many=True)
conversation_schema = ConversationsSchema()
subscription_schema = SubscriptionsSchema()
subscriptions_schema = SubscriptionsSchema(many=True)
