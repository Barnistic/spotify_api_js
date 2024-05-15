$(document).ready(function() {
    $('#singles-btn').click(function() {
        $.ajax({
            url: '/getSongs',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                var list = $('#output');
                list.empty();
                data.items.forEach(function(entry) {
                    list.append('<li>' + entry.name + '</li>');
                })
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
});

