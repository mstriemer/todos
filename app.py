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

    def to_json(self):
        return [task.to_json() for task in self]

tasks = TaskList()
tasks.create_task('Learn Tornado')
tasks.create_task('Do something cool')

base_html = '''<!DOCTYPE html>
<html>
    <head>
        <title>Tasks</title>
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
        <script src="http://twitter.github.com/hogan.js/builds/2.0.0/hogan-2.0.0.js"></script>
        <script type="text/javascript" src="/static/js/templates.js"></script>
        <script type="text/javascript" src="/static/js/app.js"></script>
    </head>
    <body>
        <div id="content">
            <h1>Tasks</h1>
            <div id="tasks">
            </div>
        </div>
    </body>
</html>
'''

class TaskHandler(tornado.web.RequestHandler):
    def get(self):
        accepts = self.get_argument('format', 'html')
        if accepts == 'json':
            self.write({'tasks': tasks.to_json()})
        else:
            self.write(base_html)

    def post(self):
        if self.get_argument('format', 'html') == 'json':
            task_name = self.get_argument('name', None)
            if task_name:
                task = tasks.create_task(task_name)
                self.write({'task': {'name': task.name}})
            else:
                self.write({})
        else:
            task_name = self.get_argument('task[name]', None)
            if task_name:
                task = tasks.create_task(task_name)
            self.redirect('/task/')

static_path = os.path.join(os.path.dirname(__file__), 'static')

application = tornado.web.Application([
        (r'/task/', TaskHandler),
        (r'/static/(.+)', tornado.web.StaticFileHandler, dict(path=static_path)),
    ],
    debug=True)

if __name__ == '__main__':
    application.listen(8000)
    tornado.ioloop.IOLoop.instance().start()
