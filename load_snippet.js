function load_snippet(snippet_url, target_id) {

    var request = new XMLHttpRequest();

    request.open('GET', snippet_url, true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var resp = request.responseText;

            document.querySelector(target_id).innerHTML = resp;
        }
    };

    request.send();

}

