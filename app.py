import os
import uuid

import simplejson as json

import tornado.ioloop
import tornado.web
import tornado.websocket

def make_uuid():
    return str(uuid.uuid4())

class Task(object):
    def __init__(self, name):
        self.name = name
        self.uuid = make_uuid()

    def to_json(self):
        return {'name': self.name, 'uuid': self.uuid}

class TaskList(object):
    def __init__(self):
        self.tasks = []

    def __iter__(self):
        return iter(self.tasks)

    def create_task(self, name):
        task = Task(name)
        self.tasks.append(task)
        return task

    def delete_task(self, uuid):
        task = self.find(uuid)
        self.tasks.remove(task)
        return task

    def find(self, uuid):
        for task in self:
            if task.uuid == uuid:
                return task
        raise IndexError("no task with uuid {}".format(uuid))

    def to_json(self):
        return [task.to_json() for task in self]

connected = []

tasks = TaskList()
tasks.create_task('Learn Tornado')
tasks.create_task('Do something cool')

base_html = '''<!DOCTYPE html>
<html>
    <head>
        <title>Tasks</title>
        <script type="text/javascript" src="/static/js/jquery-1.8.0.min.js"></script>
        <script type="text/javascript" src="/static/js/hogan-2.0.0.js"></script>
        <script type="text/javascript" src="/static/js/templates.js"></script>
        <script type="text/javascript" src="/static/js/app.js"></script>
        <link rel="stylesheet" type="text/css" href="/static/css/bootstrap.css">
        <link rel="stylesheet" type="text/css" href="/static/css/app.css">
    </head>
    <body>
        <div class="container">
            <div id="content">
            </div>
        </div>
    </body>
</html>
'''

class TasksWebsocketHandler(tornado.websocket.WebSocketHandler):
    def send_task_updates(self, task, status):
        for handler in connected:
            handler.task_updated(task, status)

    def open(self):
        connected.append(self)
        print('updates subscribed')

    def on_close(self):
        connected.remove(self)
        print('updates unsubscribed')

    def on_message(self, message):
        print('handling "{}"'.format(message))
        data = json.loads(message)
        method = data['type']
        if method == 'get':
            self.write_message({'tasks': tasks.to_json()})
        elif method == 'post':
            task_name = data['task']['name']
            task = tasks.create_task(task_name)
            self.send_task_updates(task, 'created')
        elif method == 'put':
            uuid = data['task']['uuid']
            task = tasks.find(uuid)
            task.name = data['task']['name']
            self.send_task_updates(task, 'updated')
        elif method == 'delete':
            uuid = data['task']['uuid']
            task = tasks.delete_task(uuid)
            self.send_task_updates(task, 'deleted')
        else:
            self.write_message({'error': 'unspecified method'})

    def task_updated(self, task, status):
        self.write_message({'task': task.to_json(), 'status': status})

class AppHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(base_html)

static_path = os.path.join(os.path.dirname(__file__), 'static')

application = tornado.web.Application([
        (r'/', AppHandler),
        (r'/task/', TasksWebsocketHandler),
        (r'/static/(.+)', tornado.web.StaticFileHandler, dict(path=static_path)),
    ],
    debug=True)

if __name__ == '__main__':
    application.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
