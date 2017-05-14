const socket = io.connect('192.168.1.130:8080', {'forceNew': true})
var nickname = "";
var contador = "";
//var sin_leer = [];

/*********************************************  EVENTOS SOCKET  ****************************************/

// LOGIN

socket.on('existente', () =>
{
  $(".error").html("El nickname ya está en uso, por favor, elija otro");
    $(".error").removeClass("zoomOut").addClass("zoomIn").css("display","block")
})

socket.on('user_valid', () => 
{
  $("#input_wrapper").removeClass("zoomInLeft").addClass("zoomOutLeft")
  $("#select_avatar").removeClass("zoomOutRight").addClass("zoomInRight").css("display","block");
  socket.emit('used_avatars');   
})

socket.on('receive_used_avatars', function(data)
{
  $(".avatar").removeClass("selected")

  $(data).each(function(index,value)
  {
    $(".avatar[id='"+value+"']").addClass("selected")
  })
})

socket.on('registro_ok', () => 
{
  $("#select_avatar").removeClass("zoomInLeft").addClass("zoomOutLeft").css("display","block")
  setTimeout(() => 
  {
    $("#inicio").fadeOut("slow", () =>
    {
      $("#inside").fadeIn("slow");
      $("#cabecera").css("visibility", "visible")
      $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
      $("#texto").focus();
    })
  }, 300)
  
})

// ENVIO DE MENSAJES


socket.on('mensajes_general', (data) =>
{
    var soy_yo = "";

    $("#messages").empty();
    $(data).each((index, elem) =>
    {
        if (elem.nickname == nickname)
        {
           soy_yo = "soy_yo"
        }

        $("#messages").append(`<div class='mensaje ${soy_yo}'>
                               	<div class='img'>
                               		<img src='imgs/avatar/${elem.avatar}.png' class='img_avatar'>
                               	</div>
                               	<div class='cuerpo_mensaje pt_sans'>
                               		<img class='pico' src='imgs/recursos/pico.png' />
              									<p>
              										<span class='user'>${elem.nickname}:</span> 
              										<span class='texto_mensaje'>${elem.texto}</span>
              										<span class='hora'>${elem.hora}</span>
              									</p>
                               	</div>
                          	   </div>`);
    })

    $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
})

socket.on('mensajes_privados', function(data)
{
  $("#messages").empty();
  $(data).each((index, elem) =>
    {
        $("#messages").append(`<div class='mensaje' data-emisor='${elem.emisor}'>
                                <div class='img'>
                                  <img src='imgs/avatar/${elem.avatar}.png' class='img_avatar'>
                                </div>
                                <div class='cuerpo_mensaje pt_sans'>
                                  <img class='pico' src='imgs/recursos/pico.png' />
                                  <p>
                                    <span class='user'>${elem.emisor}:</span> 
                                    <span class='texto_mensaje'>${elem.texto}</span>
                                    <span class='hora'>${elem.hora}</span>
                                  </p>
                                </div>
                               </div>`);
    })

  $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
})

socket.on('mensaje_general_nuevo', (data) =>
{

    if (data.nickname == nickname)
    {
       $("#messages").append(`<div class='mensaje animated zoomIn soy_yo'>
                                <div class="cuerpo_mensaje pt_sans" style="text-align:right; margin-right:20px;">
                                  <img class='pico' src="imgs/recursos/pico2.png" />
                                    <p style="text-align:left;">
                                      <span class='user'>Tú:</span> 
                                      <span class='texto_mensaje'>${data.texto}</span>
                                      <span class='hora'>${data.hora}</span>
                                    </p>
                                </div>
                                <div class="img">
                                  <img src="imgs/avatar/${data.avatar}.png" class="img_avatar">
                                </div>
                               </div>`);
    }
    else
    {
       $("#messages").append(`<div class='mensaje animated zoomIn'>
                                <div class="img">
                                  <img src="imgs/avatar/${data.avatar}.png" class="img_avatar">
                                </div>
                                <div class="cuerpo_mensaje pt_sans">
                                  <img class='pico' src="imgs/recursos/pico.png" />
                  <p>
                    <span class='user'>${data.nickname}:</span> 
                    <span class='texto_mensaje'>${data.texto}</span>
                    <span class='hora'>${data.hora}</span>
                  </p>
                                </div>
                               </div>`);  
    }
    
    $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
});

socket.on('mensaje_privado_nuevo', (data) =>
{
  if ($(".window.active").attr('id') == data.emisor || data.emisor == nickname)
  {
    if (data.emisor == nickname)
    {
      $("#messages").append(`<div class='mensaje animated zoomIn soy_yo' data-emisor='${data.emisor}'>
                                <div class="cuerpo_mensaje pt_sans" style="text-align:right; margin-right:20px;">
                                  <img class='pico' src="imgs/recursos/pico2.png" />
                                  <p style="text-align:left;">
                                    <span class='user'>Tú:</span> 
                                    <span class='texto_mensaje'>${data.texto}</span>
                                    <span class='hora'>${data.hora}</span>
                                  </p>
                                </div>
                                <div class="img">
                                  <img src="imgs/avatar/${data.avatar}.png" class="img_avatar">
                                </div>
                               </div>`);
    }
    else
    {
      $("#messages").append(`<div class='mensaje animated zoomIn' data-emisor='${data.emisor}'>
                                <div class="img">
                                  <img src="imgs/avatar/${data.avatar}.png" class="img_avatar">
                                </div>
                                <div class="cuerpo_mensaje pt_sans">
                                  <img class='pico' src="imgs/recursos/pico.png" />
                                  <p>
                                    <span class='user'>${data.emisor}:</span> 
                                    <span class='texto_mensaje'>${data.texto}</span>
                                    <span class='hora'>${data.hora}</span>
                                  </p>
                                </div>
                               </div>`);
    }
      
    $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
  }
  // Ya tiene la pestaña abierta
  else if ($(`.window#${data.emisor}`).length > 0)
  {
    var sin_leer = $(`.window#${data.emisor} span`).html()
    $(`.window#${data.emisor} span`).html(parseInt(sin_leer) + 1)
    $(`.window#${data.emisor} span`).css("visibility", "visible")
  }
  else
  {
    $("#open_windows").append(`<div class="window" id="${data.emisor}" >
                                    ${data.emisor}
                                    <span>1</span>
                                    <i class='fa fa-times'></i>
                                   </div>`)
    cambiar_active();
    $(`.window#${data.emisor} span`).css("visibility", "visible")
  }
    
});


// UPDATES DE USUARIOS

socket.on('usuarios', function(users)  
{
	$("#users").html(users.length)
  $("#listado_usuarios ul").empty();
  soy_yo = "";

  $(users.sort()).each(function(index, value)
  {
    if (value.nickname == nickname)
      soy_yo = "<span style='color:lightgreen'>( tú )</span>";
    else
      soy_yo = "<img src='http://www.linkingarts.com/img/icon/animat-pencil-color.gif' class='writting'/>";

    $("#listado_usuarios ul").append(`<li data-id="${value.nickname}">
                                        <div class="redondo">
                                          <img src="imgs/avatar/${value.avatar}.png" />
                                        </div>
                                      </i>
                                      <span class="user_nick">${value.nickname}&nbsp;${soy_yo}</span>
                                      </li>`)  
  })

  seleccionar_privado()
  quitar_windows_caducas()
  
})

socket.on('updateWritting', function(users_writting)
{
  $("#listado_usuarios .writting").css("visibility","hidden")
  $(users_writting).each(function(index, value)
  {
    $("#listado_usuarios li[data-id='"+value.nickname+"'] .writting").css("visibility","visible")
  })
})

/**********************************************  EVENTOS  *********************************************/

$(document).ready(() =>
{
  // Seleccionamos el Nickname

  $("#boton_circular").click(() =>
  {
  	login();
  })

  $("#nickname").keypress(function(e)
  {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13')
    {
      login();
    }
  })

  // Enviamos el avatar seleccionado

  $(".avatar").click(function() 
  {	
    if ($(this).hasClass("selected") == false)
  	   socket.emit('seleccion_avatar', {avatar: $(this).attr("id"), nickname: nickname})
  })

  // Enviamos un mensaje

  $("#enviar_mensaje").click(() =>
  {
  	enviar_mensaje();
  })

  $("#texto").keypress(function(e)
  {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13')
    {
      e.preventDefault();
      enviar_mensaje();
    }
  })

  $("#texto").keyup(function()
  {
  	escribiendo_o_no($(this));
  })

  $("#enviar_mensaje").click(function()
  {
  	escribiendo_o_no($(this));
  })

  seleccionar_privado();
  cambiar_active()
})

/************************************   FUNCIONES   *************************************************/

	function escribiendo_o_no(e)
	{
		if ($(e).val() == "")
	  {
	  	socket.emit('stop_writting')
	  }
	  else
	  {
      if (contador != "")
        clearTimeout(contador)
	  	socket.emit('start_writting')
      contador = setTimeout(function()
      {
        socket.emit('stop_writting')
      },2000)
	  }
	}

  function login()
  {
    nickname = $("#nickname").val()

     if ($(".error").css("display") == "block")
     {
       $(".error").removeClass("zoomIn").addClass("zoomOut")
     }
     if ($("#nickname").val().trim() != "")
     {
      socket.emit('check_user', {nickname: $("#nickname").val()});  
     }
     else
     {
      $(".error").html("El nickname es obligatorio");
      $(".error").removeClass("zoomOut").addClass("zoomIn").css("display","block")
     }
  }

  function enviar_mensaje()
  {
    if ($("#texto").val() != "")
    {
      if ($(".window.active").attr('id') == 'general')
      {
        enviar_mensaje_general()
      }
      else
      {
        enviar_mensaje_privado()
      }
    }
  }

  function seleccionar_privado()
  {
    $("#listado_usuarios .user_nick").click(function()
    {
      var user_selected = $(this).parent().data('id');

      if ($("#open_windows #"+user_selected).length == 0 && user_selected != nickname)
      {
        $(".window").removeClass('active')
        $("#open_windows").append(`<div class="window animated lightSpeedIn" id="${user_selected}">
                                    ${user_selected}
                                    <span style="visibility:hidden;">0</span>
                                    <i class='fa fa-times'></i>
                                   </div>`)
        cambiar_active();
        $(`#open_windows #${user_selected}`).trigger("click")   
      }
      else
      {
        $(".window#"+user_selected).trigger('click')
      }

      $("#texto").val("").focus()
    })

  }

  function cambiar_active()
  {
    $(".window").click(function()
    {
      if (!$(this).hasClass('active'))
      {
        $(".window.active").removeClass('active')
        $(this).addClass('active')
        cambiar_active() 
        if ($(this).attr('id') == 'general')
        {
          socket.emit('cargar_general')  
        }
        else
        {
          socket.emit('cargar_privado', {nickEmisor: nickname, nickReceptor: $(this).attr('id')})  
          leer_mensajes_user($(this).attr('id'))
        }
      }

      $(".window i").click(function()
      {
        var window_del = $(this).parent()
        $(window_del).removeClass('lightSpeedIn').addClass('zoomOut')
        setTimeout(function()
        {
          $(window_del).remove();
        },1000)
        
        $(".window#general").trigger("click")
      })
    })
  }

  function quitar_windows_caducas()
  {
    $(".window").each(function(index, value)
    {
      var id_window = $(value).attr("id")

       if ($("#listado_usuarios [data-id='"+id_window+"']").length == 0 && id_window != "general" )
       {
          $(this).remove();
          if ($(".window.active").length == 0)
          {
            $(".window#general").trigger("click")
          }
       }
    })
  }

  function enviar_mensaje_general()
  {
      horas = (new Date().getHours() > 9) ? new Date().getHours(): "0"+new Date().getHours()
      minutos = (new Date().getMinutes() > 9) ? new Date().getMinutes(): "0"+new Date().getMinutes()
      socket.emit('anadir_mensaje_general',
      {
        mensaje : $("#texto").val(),
        hora : horas+":"+minutos
      })
      $("#texto").val("").focus()
  }

  function enviar_mensaje_privado()
  {
    horas = (new Date().getHours() > 9) ? new Date().getHours(): "0"+new Date().getHours()
    minutos = (new Date().getMinutes() > 9) ? new Date().getMinutes(): "0"+new Date().getMinutes()
    socket.emit('anadir_mensaje_privado',
    {
      mensaje : $("#texto").val(),
      hora : horas+":"+minutos,
      nickEmisor: nickname,
      nickReceptor: $(".window.active").attr('id')
    })
    $("#texto").val("").focus() 
  }

  function leer_mensajes_user(nickname)
  {
    $(`.window#${nickname} span`).html(0)
    $(`.window#${nickname} span`).css("visibility", "hidden")
  }
