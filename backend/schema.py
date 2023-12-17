from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserSchema(BaseModel):
    id:str

class regUserSchema(BaseModel):
    id: str
    pw: str

class ChatSchema(BaseModel):
    who: str
    time: datetime
    content: str

class ChatRoomSchema(BaseModel):
    chatroomid: int

class ChatSchemaAdd(BaseModel):
    who: str
    time: datetime
    text: Optional[str] = None
    img: Optional[str] = None
    chatroomid: int

class ChatSchemaGet(BaseModel):
    chatroomid: int

class ChatRoomSchemaAdd(BaseModel):
    user1: str
    user2: str

class FriendRequest(BaseModel):
    user1: str
    user2: str
    
class RegisterData(BaseModel):
    username: str
    password: str

class LoginData(BaseModel):
    username: str
    password: str

class IntroAddSchema(BaseModel):
    id: str
    intro: str

class ImgAddSchema(BaseModel):
    id: str
    img: str

class RedirectResponseModel(BaseModel):
    redirect: str