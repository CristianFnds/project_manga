const baseurl = "http://localhost:3333/"

$('document').ready(function () {

    $("body").delegate(".manga", "click", function () {
        $(location).prop('href', `${baseurl}show?manga_id=${$(this).attr('id')}`);
    });

    $("#buscar").click(function () {
        var texto_busca = document.getElementById("texto_busca").value;
        var url = `${baseurl}manga?title=${texto_busca}`;

        $.ajax(
            {
                url: url,
                type: 'GET',
                beforeSend: exibeLoading()
            })
            .done(function (mangas) {
                exibirMangasPesquisa(mangas)
            })
            .fail(function (error) {
                exibeMensagemErro(error.responseText)
            });
    });

    function exibirMangasPesquisa(data) {
        $("#alerta").attr("hidden",true);
  
        var content = '<div class="row">';

        for (var i = 0; i < data.length; i++) {
            content +=
                '<div class="col-md-3 manga" id="' + data[i].id + '">' +
                '<img src=" https://uploads.mangadex.org/covers/' + data[i].id + '/' + data[i].cover_art_file_name + '.256.jpg" alt="icone_manga" height="150" width="100">' +
                '<div><strong>' + data[i].name + '</strong></div>' +
                '</div>';
        }
        content += '</div>';

        $('#conteudo').html(content);
    }

    function exibeLoading() {
        $('#conteudo').html("")
        var html =
            '<div class="text-center" id="loading">' +
                '<div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div>' +
            '</div>';

        $('#conteudo').append(html)
    }

    function exibeMensagemErro(mensagem){
        $('#conteudo').html("")
        $("#alerta").attr("hidden",false).html("").append(mensagem);
    }

});
