(function() {
    var initDestroy
      , initEdit
      , ws = new WebSocket("ws://" + window.location.host + "/task/");

    (initDestroy = function(sel) {
        sel = typeof(sel) != 'undefined' ? sel + ' ' : '';
        sel +=  '[data-remote="true"]';
        $(sel).on('click', function(e) {
            var $this = $(this)
              , type = $this.data('method')
              , json;
            if (typeof(type) == 'undefined') type = 'get';
            json = JSON.stringify({type: type, task: {uuid: $this.data('uuid')}});
            ws.send(json);
            e.preventDefault();
            return false;
        });
    })();

    (initEdit = function(sel) {
        if (typeof(sel) == 'undefined') sel = '.task';

        $(sel).on('click', function() {
            $(this).addClass('edit');
            $(this).find('.task-form .task-name').focus();
        });
        $(sel + ' .task-form').on('submit', function(e) {
            var $form = $(this);
            ws.send(JSON.stringify({type: 'put', task: {uuid: $form.data('uuid'), name: $form.find('.task-name').val()}}));
            $form.parent().removeClass('edit');
            e.preventDefault();
        });
    })();

    var setHooks = function(sel) {
        initDestroy(sel);
        initEdit(sel);
    };

    var renderHtml = function(tasks) {
        $('#content').html(templates.tasks.render({tasks: tasks}, templates));
        $('#task-form').on('submit', function(e) {
            ws.send(JSON.stringify({type: 'post', task: {name: $('#task-name').val()}}));
            e.preventDefault();
        });
    };

    var handleUpdates = function() {
        ws.onopen = loadTasks;
        ws.onmessage = function(e) {
            var data = JSON.parse(e.data), uuid;
            if (data.status == 'updated') {
                uuid = data.task.uuid;
                $('#task-' + uuid).replaceWith(templates.task.render(data.task));
                setHooks('#task-' + uuid);
            } else if (data.status == 'created') {
                uuid = data.task.uuid;
                $('#task-list').append(templates.task.render(data.task));
                $('#task-name').val('');
                setHooks('#task-' + uuid);
            } else if (data.status == 'deleted') {
                uuid = data.task.uuid;
                $('#task-' + uuid).remove();
            } else if (typeof(data.tasks) != 'undefined') {
                renderHtml(data.tasks);
                setHooks();
            }
        };
    };

    var loadTasks = function() {
        ws.send(JSON.stringify({type: 'get'}));
    };

    jQuery(function($) {
        renderHtml([]);
        handleUpdates();
    });
})();
