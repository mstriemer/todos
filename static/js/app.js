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
        $('#tasks').html(templates.tasks.render({tasks: tasks}, templates));
        $('#task-form').on('submit', function() {
            $.ajax({
                url: '/task/?format=json',
                type: 'post',
                data: {name: $('#task-name').val()},
                success: function(data, textStatus, jqXHR) {
                    console.log(data);
                    if (data.task) {
                        $('#task-list').append(templates.task.render(data.task));
                        $('#task-name').val('');
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
