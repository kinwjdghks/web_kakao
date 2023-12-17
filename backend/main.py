from fastapi import Depends, FastAPI, Response, HTTPException, WebSocket
from database import SessionLocal, engine
from sqlalchemy.orm import Session
from schema import *
from fastapi.middleware.cors import CORSMiddleware
from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException
from model import Base, friend_association, Chat, ChatRoom, User
from sqlalchemy.exc import IntegrityError
from sqlalchemy import insert

class NotAuthenticatedException(Exception):
    pass

app = FastAPI()
origins = ["http://localhost:5173","localhost:5173"]



app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

socket_manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await socket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await socket_manager.broadcast("new chat")
    except Exception as e:
        pass
    finally:
        await socket_manager.disconnect(websocket)



SECRET = "mySecretKey"
manager = LoginManager(SECRET, '/login', use_cookie=True, custom_exception=NotAuthenticatedException)

Base.metadata.create_all(bind=engine)


def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


@manager.user_loader()
def get_user(id: str, db: Session = None):
    if not db:        
        with SessionLocal() as db:
            return db.query(User).filter(User.id == id).first()    
    return db.query(User).filter(User.id == id).first()

@app.post('/login')
def login(response: Response, data: LoginData):
    username = data.username
    password = data.password
    user = get_user(username)

    if not user:
        print("No user found")
        raise InvalidCredentialsException
    if user.pw != password:
        print("Password incorrect")
        raise InvalidCredentialsException
    access_token = manager.create_access_token(
        data = {'sub': username}
    )
    manager.set_cookie(response, access_token)
    return {'access_token': access_token, 'user':user}

# @app.get('/getuser')
# def getuser(id: str, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == id).first()
#     return user

@app.get('/idvalid')
def idvalid(id: str):
    user = get_user(id)

    if not user:
        # If user is not found, return False
        return {'isValid': False}
    # If user is found, return True
    return {'isValid': True}

@app.get('/get_friendList')
def get_friendList(id: str, db: Session = Depends(get_db)):
    # Retrieve the user by id
    user = db.query(User).filter(User.id == id).first()
    # Retrieve the list of friends
    friends_list = user.friends

    # Convert User objects to a suitable format for JSON response
    friends_data = []
    for friend in friends_list:
        # print(friend)
        friend_data = {
            "id": friend.id,
            "intro" : friend.intro,
            "img" : friend.img
        }
        friends_data.append(friend_data)
        # print(friends_data)
    return friends_data


@app.get('/get_chatroomList')
def get_chatroomList(id: str, db: Session = Depends(get_db)):
    # Query the database for chat rooms involving the user
    chatrooms = db.query(ChatRoom).filter(
        (ChatRoom.user1 == id) | (ChatRoom.user2 == id)
    ).all()

    if not chatrooms:
        # raise HTTPException(status_code=404, detail="No chatrooms found for this user")
        return []
    # Format the chat rooms for the response
    chatrooms_data = [
        {
            "id": room.id,
            "user1": room.user1,
            "user2": room.user2,
            "preview": room.preview
            # You can add more fields here as needed
        } 
        for room in chatrooms
    ]

    return chatrooms_data




@app.get('/get_chatList')
def get_chatList(roomId: int, db: Session = Depends(get_db)):
    # Query the database for chat messages in the given room
    chatList = db.query(Chat).filter(Chat.chatroomid == roomId).all()

    if not chatList:
        # raise HTTPException(status_code=404, detail="No chat messages found for this room")
        return []

    # Format the chat messages for the response
    formatted_chatList = [
        {
            "id": chat.id,
            "who": chat.who,
            "chatroomid": chat.chatroomid,
            "time": chat.time.isoformat(),  # Format time to ISO format string
            "text": chat.text,
            "img": None if not chat.img else chat.img  # Handle image data appropriately
        } 
        for chat in chatList
    ]

    return formatted_chatList

@app.post('/add_friend')
def add_friend(request: FriendRequest, db: Session = Depends(get_db)):
    user1 = request.user1
    user2 = request.user2

    if user1 == user2:
        raise HTTPException(status_code=400, detail="Cannot add self as friend")

    # Check if the friendship already exists
    existing_friendship = db.query(friend_association).filter(
        (friend_association.c.user_id == user1) & (friend_association.c.friend_id == user2)
    ).first()
    if existing_friendship:
        raise HTTPException(status_code=400, detail="friend already exists")

    try:
        # Prepare insert statements for the association table
        insert_stmt = insert(friend_association).values([
            {"user_id": user1, "friend_id": user2},
            {"user_id": user2, "friend_id": user1}
        ])
        db.execute(insert_stmt)
        db.commit()
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to add friend")

    return {"message": "Friend added successfully"}

def db_register(db:Session,name, password):
    new_user = User(id = name, pw = password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post('/register')
def register(response:Response, data: RegisterData, db: Session = Depends(get_db)):
    username = data.username
    password = data.password
    print(f"username: {username} password: {password}")

    user = db_register(db, username, password)
    if user:
        access_token = manager.create_access_token(
            data={'sub': username}
        )
        manager.set_cookie(response, access_token)
        return {"message": "User created"}
    else:
        response.status_code = 400
        return {"message": "User creation failed"}
    

def db_createChatroom(db: Session, users: ChatRoomSchemaAdd):
    # Check if a chatroom with the same pair of users already exists
    existing_chatroom = db.query(ChatRoom).filter(
        ((ChatRoom.user1 == users.user1) & (ChatRoom.user2 == users.user2)) |
        ((ChatRoom.user1 == users.user2) & (ChatRoom.user2 == users.user1))
    ).first()

    # If such a chatroom exists, return None or some indication of duplicate
    if existing_chatroom:
        return None

    # Create a new chatroom since it doesn't exist
    chatroom = ChatRoom(
        user1=users.user1,
        user2=users.user2,
    )
    db.add(chatroom)
    db.commit()
    db.refresh(chatroom)
    return chatroom

@app.post('/createChatRoom')
def createChatRoom(response: Response, data: ChatRoomSchemaAdd, db: Session = Depends(get_db)):
    result = db_createChatroom(db, data)
    if result:
        return {"message": "Chatroom created"}
    else:
        response.status_code = 400
        return {"message": "Chatroom creation failed or chatroom already exists"}

@app.post('/addChat')
def addChat(response: Response, data: ChatSchemaAdd, db: Session = Depends(get_db)):
    # print(data)
    new_chat = Chat(who=data.who,
                    time=data.time,
                    text=data.text,
                    img=data.img,
                    chatroomid = data.chatroomid)
    db.add(new_chat)

    room = db.query(ChatRoom).filter(ChatRoom.id == data.chatroomid).first()
    if not data.img:
        print(data.text)
        room.preview = data.text
    else:
        room.preview = '사진을 보냈습니다'

    db.commit()
    db.refresh(new_chat)



@app.post('/setIntro')
def setIntro(data: IntroAddSchema, db: Session = Depends(get_db)):
    # Fetch the user by id
    print(data)
    user = db.query(User).filter(User.id == data.id).first()

    # Check if the user exists
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update the intro field
    user.intro = data.intro
    # Commit the changes to the database
    db.commit()

    return {"message": "User intro updated successfully"}


@app.post('/setImg')
def setImg(data: ImgAddSchema, db: Session = Depends(get_db)):
    # Fetch the user by id
    # print(data)
    user = db.query(User).filter(User.id == data.id).first()

    # Check if the user exists
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update the intro field
    user.img = data.img
    # Commit the changes to the database
    db.commit()

    return {"message": "User img updated successfully"}
    