var templates = {};
templates.task = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div class=\"task row\">");_.b("\n" + i);_.b("    <form method=\"put\" class=\"task-form form-inline\" action=\"/task/");_.b(_.v(_.f("uuid",c,p,0)));_.b("/?format=json\">");_.b("\n" + i);_.b("        <input type=\"text\" class=\"task-name span6\" value=\"");_.b(_.v(_.f("name",c,p,0)));_.b("\">");_.b("\n" + i);_.b("    </form>");_.b("\n" + i);_.b("    <div class=\"show\">");_.b("\n" + i);_.b("        ");_.b(_.v(_.f("name",c,p,0)));_.b("\n" + i);_.b("        <a href=\"/task/");_.b(_.v(_.f("uuid",c,p,0)));_.b("/?format=json\" rel=\"destroy\" data-method=\"delete\" data-remote=\"true\">&times;</a>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("</div>");return _.fl();;});
templates.tasks = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("<div id=\"tasks\" class=\"span6\">");_.b("\n" + i);_.b("    <div class=\"row\">");_.b("\n" + i);_.b("        <form action=\"/task/\" method=\"post\" id=\"task-form\" class=\"form-inline\">");_.b("\n" + i);_.b("            <input type=\"text\" name=\"task[name]\" placeholder=\"Task Name\" id=\"task-name\" class=\"span6\">");_.b("\n" + i);_.b("        </form>");_.b("\n" + i);_.b("    </div>");_.b("\n" + i);_.b("    <div id=\"task-list\">");_.b("\n" + i);if(_.s(_.f("tasks",c,p,1),c,p,0,306,337,"{{ }}")){_.rs(c,p,function(c,p,_){_.b(_.rp("task",c,p,"            "));});c.pop();}_.b("    </div>");_.b("\n" + i);_.b("</div>");return _.fl();;});
