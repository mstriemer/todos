import os
import uuid

import tornado.ioloop
import tornado.web

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
        for task in self:
            if task.uuid == uuid:
                self.tasks.remove(task)
                return task
        return None

    def find(self, uuid):
        for task in self:
            if task.uuid == uuid:
                return task
        raise IndexError("no task with uuid {}".format(uuid))

    def to_json(self):
        return [task.to_json() for task in self]

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

class TasksHandler(tornado.web.RequestHandler):
    def get(self):
        accepts = self.get_argument('format', 'html')
        if accepts == 'json':
            self.write({'tasks': tasks.to_json()})
        else:
            self.write(base_html)

    def post(self):
        if self.get_argument('format', '') == 'json':
            task_name = self.get_argument('name', None)
            if task_name:
                task = tasks.create_task(task_name)
                self.write({'task': task.to_json()})
            else:
                self.write({})
        else:
            task_name = self.get_argument('task[name]', None)
            if task_name:
                task = tasks.create_task(task_name)
            self.redirect('/task/')

class TaskHandler(tornado.web.RequestHandler):
    def put(self, uuid):
        if self.get_argument('format', '') == 'json':
            task = tasks.find(uuid)
            task.name = self.get_argument('name')
            self.write({'task': task.to_json()})

    def delete(self, uuid):
        if self.get_argument('format', '') == 'json':
            task = tasks.delete_task(uuid)
            if task is None:
                self.write({
                    'status': 'error',
                    'message': 'no task with uuid {}'.format(uuid)})
            else:
                self.write({'status': 'destroyed'})

static_path = os.path.join(os.path.dirname(__file__), 'static')

application = tornado.web.Application([
        (r'/task/', TasksHandler),
        (r'/task/(.+)/', TaskHandler),
        (r'/static/(.+)', tornado.web.StaticFileHandler, dict(path=static_path)),
    ],
    debug=True)

if __name__ == '__main__':
    application.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
