from locust import User, task, between, events
import time
import requests


class HttpClient:
    def __init__(self, host):
        self.host = host

    def send(self, path):
        url = self.host + path
        start_time = time.time()
        try:
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception(
                    f"Invalid response code: {response.status_code} for url: {url}"
                )
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="http",
                name=url,
                response_time=total_time,
                response_length=len(response.content),
                exception=None,
                context={},
            )
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            events.request.fire(
                request_type="http",
                name=url,
                response_time=total_time,
                response_length=0,
                exception=e,
                context={},
            )


class MyHttpClientUser(User):
    wait_time = between(1, 3)
    host = "http://localhost:5001"
    simple_path = "/tests_api/simple_test"
    db_user_path = "/tests_api/db_test"

    @task(3)
    def simple_task(self):
        self.client = HttpClient(self.host)

        # Send an HTTP GET request
        self.client.send(self.simple_path)

    @task(1)
    def db_user_task(self):
        self.client = HttpClient(self.host)

        # Send an HTTP GET request
        self.client.send(self.db_user_path)
