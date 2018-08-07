import requests


class ServerAuth:

    def __init__(self, server_host, username, password):
        self.server_host = server_host
        self.username = username
        self.password = password
        self.user = None

    def login(self):
        if self.user is None:
            login_data = {
                'user': {
                    'username': self.username,
                    'password': self.password
                }
            }
            headers = {
                'Content-Type': 'application/json'
            }
            url = self.server_host + '/auth/login'
            response = requests.post(url=url, json=login_data, headers=headers)
            json_response = response.json()
            self.user = {
                'id': json_response['userId'],
                'username': json_response['username'],
                'role': json_response['role'],
                'token': json_response['token']
            }

    def get_server_token(self):
        if self.user is None:
            self.login()
        return self.user['token']
