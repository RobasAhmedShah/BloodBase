import os
import requests
from flask import Flask, request

app = Flask(__name__)

# IPFS API endpoint (default for a local node)
IPFS_API_URL = "http://127.0.0.1:5001/api/v0/add"
TEMP_FILE_PATH = "userdata.txt"

@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>IPFS Form</title>
    </head>
    <body>
        <h1>Send Data to IPFS</h1>
        <form action="/submit" method="post">
            <label for="data">Enter your data:</label><br>
            <textarea name="data" id="data" rows="10" cols="30"></textarea><br><br>
            <input type="submit" value="Submit">
        </form>
    </body>
    </html>
    '''

@app.route('/submit', methods=['POST'])
def submit():
    user_data = request.form['data']

    # Check if the file exists, create it if not
    if not os.path.exists(TEMP_FILE_PATH):
        with open(TEMP_FILE_PATH, "w") as temp_file:
            temp_file.write("")  # Create an empty file if it doesn't exist

    # Append the new data to the file
    with open(TEMP_FILE_PATH, "a") as temp_file:
        temp_file.write(user_data + "\n")

    # Upload the file to IPFS
    try:
        with open(TEMP_FILE_PATH, "rb") as temp_file:
            files = {"file": temp_file}
            response = requests.post(IPFS_API_URL, files=files)

        if response.status_code == 200:
            ipfs_hash = response.json()["Hash"]
            return f"<p>Data successfully uploaded to IPFS!</p><p>IPFS Hash: {ipfs_hash}</p>"
        else:
            return f"<p>Failed to upload to IPFS. Status code: {response.status_code}</p><p>{response.text}</p>"
    except Exception as e:
        return f"<p>An error occurred: {str(e)}</p>"

if __name__ == "__main__":
    app.run(debug=True)
