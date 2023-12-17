from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, BLOB, Table
from sqlalchemy.orm import relationship
from database import Base

friend_association = Table('friend_association', Base.metadata,
    Column('user_id', String, ForeignKey('users.id'), primary_key=True),
    Column('friend_id', String, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    pw = Column(String, nullable=False)
    intro = Column(String, nullable = True)
    img = Column(String, nullable=True)

    # Relationship to represent a user's friends
    friends = relationship(
        'User',
        secondary=friend_association,
        primaryjoin=id == friend_association.c.user_id,
        secondaryjoin=id == friend_association.c.friend_id,
        backref='added_friends'
    )

class Chat(Base):
    __tablename__ = "chat"
    id = Column(Integer,primary_key=True,autoincrement=True,nullable=True)
    who = Column(String)
    chatroomid = Column(Integer,ForeignKey('chatrooms.id'))
    time = Column(DateTime)
    text = Column(String,nullable=True)
    img = Column(String, nullable=True)

    

class ChatRoom(Base):
    __tablename__ = "chatrooms"
    id = Column(Integer,nullable=False,primary_key=True,autoincrement=True)
    user1 = Column(String)
    user2 = Column(String)
    preview = Column(String,nullable=True)