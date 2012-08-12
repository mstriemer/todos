(function() {
    var tasks = [];

    var handleError = function(jqHXR, textStatus, errorThrown) {
        alert('ajax error');
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    };

    var handleSuccess = function(data, textStatus, jqXHR) {
        console.log(data);
        tasks = data.tasks;
        renderHtml();
    };

    var renderHtml = function() {
        $('#content').html(templates.tasks.render({tasks: tasks}, templates));
        var initDestroy, initEdit;
        (initDestroy = function() {
            $('[data-remote="true"]').click(function(e) {
                $this = $(this);
                var url = $this.attr('href'),
                    method = $this.data('method');
                if (typeof(method) == 'undefined') method = 'get';
                $.ajax({
                    url: url,
                    type: method,
                    success: function(data, textStatus, jqXHR) {
                        console.log(data);
                        $this.parents('.task').remove();
                    },
                    error: handleError,
                });
                e.preventDefault();
                return false;
            });
        })();
        (initEdit = function() {
            $('.task').on('click', function() {
                $(this).addClass('edit');
                $(this).find('.task-form .task-name').focus();
            });
            $('.task .task-form').on('submit', function(e) {
                var $form = $(this);
                $form.parent().removeClass('edit');
                $.ajax({
                    url: $form.attr('action'),
                    type: $form.attr('method'),
                    data: {name: $form.find('.task-name').val()},
                    error: handleError,
                    success: function(data, textStatus, jqXHR) {
                        console.log(data);
                        $form.parent().replaceWith(templates.task.render(data.task));
                        initDestroy();
                        initEdit();
                    }
                });
                e.preventDefault();
            });
        })();
        $('#task-form').submit(function() {
            $.ajax({
                url: '/task/?format=json',
                type: 'post',
                data: {name: $('#task-name').val()},
                success: function(data, textStatus, jqXHR) {
                    console.log(data);
                    if (data.task) {
                        $('#task-list').append(templates.task.render(data.task));
                        $('#task-name').val('');
                        initDestroy();
                        initEdit();
                    }
                },
                error: handleError,
            });
            return false;
        });
    };

    var loadTasks = function() {
        $.ajax({
            url: '/task/?format=json',
            type: 'get',
            success: handleSuccess,
            error: handleError,
        });
    };

    jQuery(function($) {
        renderHtml();
        loadTasks();
    });
})();
