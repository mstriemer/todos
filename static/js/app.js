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
        var initDestroy;
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
                        $this.parent().remove();
                    },
                    error: handleError,
                })
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
