from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import mysql.connector

try:
    # (1) MYSQL 연결 
    connection = mysql.connector.connect(
        host='pickpick.store',
        database='prismpick',
        user='prismpick',
        password='prismpick1!'
    )

    if connection.is_connected():
        cursor = connection.cursor()

        class MyHTTPRequestHandler(BaseHTTPRequestHandler):
            def do_POST(self):
                content_length = int(self.headers['Content-Length'])
                body = self.rfile.read(content_length)
                data = json.loads(body)

                test_input = data['give_test_input']

                sql = "INSERT INTO inputdata (input) VALUES (%s)"
                val = (test_input,)
                cursor.execute(sql, val)
                connection.commit()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'result': 'success'}
                self.wfile.write(json.dumps(response).encode())

        def run():
            server_address = ('', 8000)
            httpd = HTTPServer(server_address, MyHTTPRequestHandler)
            httpd.serve_forever()

        if __name__ == '__main__':
            run()

except mysql.connector.Error as e:
    print('Database Error:', e)

finally:
    # (5) 데이터베이스 커서와 커넥션을 모두 닫음 
    cursor.close()
    connection.close()
    print('MySQL Connection Closed')

# db = mysql.connector.connect(
#     host='pickpick.store',
#     user='yihyunk',
#     password='prismpick1!',
#     database='prismpick'
# )

# class MyHTTPRequestHandler(BaseHTTPRequestHandler):
#     def do_POST(self):
#         content_length = int(self.headers['Content-Length'])
#         body = self.rfile.read(content_length)
#         data = json.loads(body)

#         test_input = data['give_test_input']

#         cursor = db.cursor()
#         sql = "INSERT INTO inputdata (input) VALUES (%s)"
#         val = (test_input,)
#         cursor.execute(sql, val)
#         db.commit()

#         self.send_response(200)
#         self.send_header('Content-type', 'application/json')
#         self.end_headers()
#         response = {'result': 'success'}
#         self.wfile.write(json.dumps(response).encode())

# def run():
#     server_address = ('', 8000)
#     httpd = HTTPServer(server_address, MyHTTPRequestHandler)
#     httpd.serve_forever()

# if __name__ == '__main__':
#     run()


# import mysql.connector
# from http.server import HTTPServer, BaseHTTPRequestHandler
# import json

# class MyHTTPRequestHandler(BaseHTTPRequestHandler):
#     def do_POST(self):
#         content_length = int(self.headers['Content-Length'])
#         body = self.rfile.read(content_length)
#         data = json.loads(body)
        
#         # Get the data from the request
#         name = data['name']
#         age = data['age']
#         gender = data['gender']
        
#         # Connect to the database
#         db = mysql.connector.connect(
#             host='pickpick.store',
#             user='yihyunk',
#             password='prismpick1!',
#             database='prismpick'
#         )
        
#         # Insert the data into the database
#         cursor = db.cursor()
#         sql = "INSERT INTO users (name, age, gender) VALUES (%s, %s, %s)"
#         val = (name, age, gender)
#         cursor.execute(sql, val)
#         db.commit()
        
#         # Send the response
#         self.send_response(200)
#         self.send_header('Content-type', 'application/json')
#         self.end_headers()
#         response = {'status': 'success'}
#         self.wfile.write(json.dumps(response).encode())
        
# def run():
#     server_address = ('', 8000)
#     httpd = HTTPServer(server_address, MyHTTPRequestHandler)
#     httpd.serve_forever()

# if __name__ == '__main__':
#     run()
