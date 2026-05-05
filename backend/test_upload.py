import requests

url = "http://localhost:8080/api/filesystem/files/add"
files = {'file': ('test.txt', 'hello world', 'text/plain')}
data = {'folderId': 1, 'userId': 0}

try:
    response = requests.post(url, files=files, data=data)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.text)
except Exception as e:
    print(e)
