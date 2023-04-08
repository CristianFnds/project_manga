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

    $("#download").click(function(){
      
        let manga_id = $("#manga_id").val();
        let usuario = $("#usuario").val();
        let url = `${baseurl}downloadAllChapter?id=${manga_id}&usuario=${usuario}`;

        $.ajax(
            {
                url: url,
                type: 'GET',
                beforeSend: exibeLoading(false)
            })
            .done(function (mangas) {
                removeLoading(mangas)
            })
            .fail(function (error) {
                console.log("fail")
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

    function removeLoading(){
        $("#loading").remove()
    }
    
    function exibeLoading(clearContent = true) {
        if(clearContent)
            $('#conteudo').html("")
       
        var html =
            '<div class="text-center" id="loading">' +
                '<div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div>' +
            '</div>';

        $('#conteudo').prepend(html)
    }

    function exibeMensagemErro(mensagem){
        $('#conteudo').html("")
        $("#alerta").attr("hidden",false).html("").append(mensagem);
    }
});
