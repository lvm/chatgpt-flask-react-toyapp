from os import environ as env
from typing import Dict, List, Tuple

import jwt
import openai
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

openai.api_key = env.get("CHATGPT_API_KEY", "s3cr3t")
client = MongoClient(env.get("MONGODB_URL", "mongodb://localhost:27017"))
db = client["chat_app"]


Conversation = Dict[str, str]
UserConversations = Dict[str, List[Conversation]]

conversations: UserConversations = {}


def authorization(request: request) -> Tuple[jsonify, int] | None:
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({"message": "Missing token"}), 401

    try:
        decoded = jwt.decode(
            token, env.get("JWT_SECRET_KEY", "s3cr3t"), algorithms=["HS256"]
        )
        print(decoded)
    except jwt.DecodeError:
        return jsonify({"message": "Invalid token"}), 401

    return None


@app.route("/login", methods=["POST"])
def login() -> Dict[str, str]:
    username = request.json.get("username")
    password = request.json.get("password")

    user = db.users.find_one({"username": username})
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    if user["password"] != password:
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode(
        {"username": username}, env.get("JWT_SECRET_KEY", "s3cr3t"), algorithm="HS256"
    )
    return jsonify({"token": token})


@app.route("/register/check", methods=["POST"])
def check_username() -> Dict[str, str]:
    username = request.json.get("username")

    if db.users.find_one({"username": username}):
        return jsonify({"message": "User exists"}), 200

    return jsonify({"message": "User not found"}), 404


@app.route("/register/create", methods=["POST"])
def register() -> Dict[str, str]:
    username = request.json.get("username")
    password = request.json.get("password")

    if db.users.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 409

    db.users.insert_one({"username": username, "password": password})
    return jsonify({"message": "User created successfully"}), 201


@app.route("/chat", methods=["POST"])
async def chat() -> Dict[str, str]:
    auth_err = authorization(request)
    if auth_err:
        return auth_err

    username = jwt.decode(
        request.headers["Authorization"],
        env.get("JWT_SECRET_KEY", "s3cr3t"),
        algorithms=["HS256"],
    )["username"]
    if username not in conversations:
        conversations[username] = []

    message = request.json["message"]
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=message,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.7,
    )
    response_text = response.choices[0].text.strip()

    conversations[username].append({"input": message, "output": response_text})

    db_conversation = db.conversations.find_one({"username": username})
    if db_conversation is None:
        db.conversations.insert_one(
            {
                "username": username,
                "conversations": [{"input": message, "output": response_text}],
            }
        )
    else:
        db.conversations.update_one(
            {"username": username},
            {"$push": {"conversations": {"input": message, "output": response_text}}},
        )

    return jsonify({"response": response_text})


@app.route("/export/<username>", methods=["GET"])
def export(username: str) -> Dict[str, List[Conversation]]:
    auth_err = authorization(request)
    if auth_err:
        return auth_err

    conversation = db.conversations.find_one({"username": username})
    if not conversation:
        return (
            jsonify({"message": f"No conversations found for user '{username}'"}),
            404,
        )

    return jsonify({"conversations": conversation["conversations"]})


if __name__ == "__main__":
    host = env.get("FLASK_HOST", "0.0.0.0")
    port = int(env.get("FLASK_PORT", 8080))
    app.run(host=host, port=port, threaded=True)
