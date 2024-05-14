from locust import User, task, between, events
import websocket
from websocket import WebSocketConnectionClosedException
import threading
import time
import json


class WebSocketClient:
    def __init__(self, host):
        self.host = host
        self.ws = websocket.WebSocket()

    def connect(self, path="/"):
        self.ws.connect(self.host + path)

    def send(self, message):
        start_time = time.time()
        try:
            self.ws.send(message)
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="websocket",
                name="send",
                response_time=total_time,
                response_length=len(message),
                exception=None,
                context={},
            )
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="websocket",
                name="send",
                response_time=total_time,
                response_length=0,
                exception=e,
                context={},
            )

    def receive(self):
        start_time = time.time()
        try:
            message = self.ws.recv()
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="websocket",
                name="receive",
                response_time=total_time,
                response_length=len(message),
                exception=None,
                context={},
            )
            return message
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="websocket",
                name="receive",
                response_time=total_time,
                response_length=0,
                exception=e,
                context={},
            )
            return None

    def close(self):
        self.ws.close()


class MyWebSocketUser(User):
    wait_time = between(1, 3)  # Simulate human reading time
    host = "wss://sockets.quarkle.ai"
    path = "/"
    abstract = True  # This should be an abstract class as it doesn't represent a user on its own

    def on_stop(self):
        self.client.close()

    @task
    def my_task(self):
        self.client = WebSocketClient(self.host)
        self.client.connect(self.path)

        msg = json.dumps(
            {
                "action": "LoadTest",
                "data": "Hello Quarkle!",
                "book_id": "123",
                "token": "token123",
                "conversation_id": "123",
                "open_expression": "false",
            }
        )

        # Send a message
        self.client.send(msg)

        # Wait for the full stream from the server
        full_response = ""
        while True:
            response = self.client.receive()
            full_response += response + " "
            if "DONE!" in response:
                break  # Assuming None is returned when the stream is complete

        print("Received full message stream from server:", full_response)

        self.client.close()


# Run the test with:
# locust -f locustfile.py MyWebSocketUser
