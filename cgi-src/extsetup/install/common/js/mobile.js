// JavaScript Document
// ================================Define===============================
var MAIN_HEADER = 0;
var SUBMAIN_HEADER = 1;
var LEFT_HEADER = 2;
var RIGHT_HEADER = 3;

var VAL_ID = 0;
var VAL_ARTICLE = 1;
var VAL_TAGNAME = 2;

//======================================================================
var article = [];
var config_data = null;
var status_data = null;

var submit_timeout_control = null;

var regExp_kor = /^([가-힣]|[0-9a-zA-Z]|[_# \[\]]){1,32}$/;
var regExp_port =  /^(6553[0-5]|655[0-2]\d|65[0-4]\d\d|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}|0)$/;
var regExp_passwd = /^([a-zA-Z]|[!@#$%^*+=-]|[0-9]){1,32}$/;
var regExp_ip = /^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;

var confirm_popup = false;
var rightpanelclose = true; 
var errorcode = 0;
var confirmactname;

var pagefirstload = true;

var connectfailalert = true;
var historyEvents;

var panelsync_opened = false;

var RightPanelEvent = (function()
{
        var $panel, $dismissDiv;
        function _init() {
                _cache();
                _bindEvents();
        }
        function _cache() {
                $panel = $("#right_panel");
                $dismissDiv = $("#right_panel_dismiss");
        }
        function _bindEvents() {
                $panel.on( "swiperight", _tryClosePanel );
                $dismissDiv.on("click", _tryClosePanel );
                $(document).on("panelbeforeopen", "#right_panel", _show );
                $(document).on("panelbeforeclose", "#right_panel", _hide );
        }
        function _tryClosePanel() {
                if( _shouldConfirmBeforeClose() )
                        _confirmBeforeClose();
                else {
                        if( history.state && history.state.page === 2 )
                                history.go(-1);
                        else
                                $panel.panel("close");
                }
        }
        function _shouldConfirmBeforeClose() {
                return check_change_value( "#right_panel" ) && !confirm_popup;
        }
        function _confirmBeforeClose() {
                confirmactname = "";
                confirm(M_lang['S_POPUP_CLOSED_CONENT'], M_lang['S_POPUP_CLOSED_TITLE']);
        }
        function _hide()        {
                $("#right_panel_dismiss").hide();
        }
        function _show() {
                var maxSize = Math.max( window.innerWidth, document.body.clientWidth, window.innerHeight, document.body.clientHeight )
                $("#right_panel_dismiss").show().height( maxSize ).width( maxSize );
        }
        return {
                init : _init,
                tryClose : _tryClosePanel
        }
})();

$(document).on("panelbeforeopen", "#right_panel", function () {
        panelsync_opened = true;
	$('.ui-page').css("overflow","hidden");
	$('#right_panel').css("overflow","auto");
        $('#right_panel').css("position","fixed");
});

$(document).on("panelbeforeclose", "#right_panel", function () {
        $('.ui-page').css("overflow","auto").off('touchmove');
        panelsync_opened = false;
});

$(document).on("panelopen", "#right_panel", function() {
        makeFocusEvent();
});

$(document).on("panelclose", "#right_panel", function() {
        if(!panelsync_opened){
                $("#right_content").children().remove();
                $("#right_header p").text("");
        }
});

function load_header(_themenumber, _article_name){
	$.ajaxSetup({async : true, timeout : 10000});
	switch(_themenumber)
	{
	case RIGHT_HEADER:
		$("#right_header").load("/common/html/header.html #header_content_theme3", function(responseTxt,statusTxt,xhr)
		{
    			if(statusTxt=="success"){
				$("[sid='SUBTITLE']").attr('sid',"S_" + _article_name.toUpperCase() + "_TITLE");
				$("#right_title_exit").click(function() {
					$("#right_panel").panel("close");
				});
				$(this).trigger('create');
				if(window.load_header_ended)
					load_header_ended();
				historyEvents.go('right_panel');
			}	
			else
				alert("Error: "+xhr.status+"Header Page Load Fail");		
     		});
		break;
	}
}
function load_body_content(_args)
{
	$.ajaxSetup({async : true, timeout : 10000});
	$("#page").load("html/main.html", function(responseTxt,statusTxt,xhr)
	{
		$(this).trigger('create');
    		if(statusTxt=="success"){
			$(this).trigger('create');
			$('#page').hide();
			load_body_content_ended(_args);
		}
		else
			alert("Error: "+xhr.status+"content Page Load Fail");
    	}); 
}

function load_body_content_ended(_args)
{
	load_misc(_args);
}

function load_misc(_args)
{
	$.ajax({ type: "GET",   
		 url: "/common/html/misc.html",   
		 async: true,
		 timeout : 10000,
		 success : function(text)
		 {
			$("#page").append(text);
			$("#page").trigger('create');
			load_misc_ended(_args);
		 }
	});
}

function load_misc_ended(_args)
{
	//$('#intro_popup').popup('open');

	//makeFocusEvent();
	get_config(_args[0], _args[1], _args[2]);
}

function makeBackButtonEvents()
{
        var direction;

        history.pushState({ page: 1 }, '');
        window.onpopstate = _historyHasChanged;

        function _historyHasChanged( event ) {
                var state = event.state;
                if( !state || !state.page ) {
                        switch( direction ) {
                        case undefined :
                        case "needCheck" :
                                direction = "needCheck";
                                history.go(1);
                                break;
                        case "right_panel" :
                                direction = "";
                                history.go(1);
                                break;
                        case "" :
                        case "backward" :
                                direction = "backward";
                                history.go(-1);
                                break;
                        }
                        return;
                }
                if( state.page === 1 )
                {
                        switch( direction ) {
                        case "backward" :
                                direction = "";
                                if( !check_change_value() ) {
                                        history.go(-2);
                                        return;
                                }
                                setTimeout( function() {
                                        history.go( -2 );
                                }, 0);
                                break;
                        case "right_panel" :
                                direction = "backward";
                                history.go(1);
                                break;
                        case "needCheck" :
                                if( !check_change_value() ) {
                                        direction = "backward";
                                        history.go(-2);
                                        return;
                                }
                                setTimeout( function() {
                                        direction = "backward";
                                        history.go( -2 );
                                }, 0);
                                break;
                        default:
                                $("#right_panel").panel("close");
                                break;
                        }
                } else if( state.page === 2 ) {
                        if( direction !== "backward" )
                                return;
                        direction = "right_panel";
                        if( !check_change_value() ) {
                                direction = "";
                                history.go(-1);
                                $("#right_panel").panel("close");
                                return;
                        }
                        setTimeout( function() {
                                history.go( -2 );
                        }, 0);
                }
        }
	function _go( menu ) {
                if( menu === "right_panel" && history.state.page !== 2 ) {
                        setTimeout( function() {
                                direction = "right_panel";
                                history.pushState({ page: 2 }, '');
                        }, 0);
                }
        }
        return {
                go : _go
        }
}

function make_M_lang(page_S_lang, page_D_lang)
{
	M_lang = [];
	M_lang = $.extend(CS_lang, CD_lang, T_lang, page_S_lang, page_D_lang);
}	

function msetup_init(_tmenu, _smenu, _args)
{
	historyEvents = makeBackButtonEvents();
	//load page 
	var forward_args = [];
	forward_args[0] = _tmenu;
	forward_args[1] = _smenu;
	forward_args[2] = _args;
	load_body_content(forward_args);
}

function common_getconfig_result()
{
	if(pagefirstload){
		valid_update();
		default_setup();
		msetup_update("S");

		if( window.loadLocalPage )
			loadLocalPage();
		pagefirstload = false;
	}
}

function makeFocusEvent()
{
	function focusFilter()
        {
                return !$(this).prop("readonly") && !$(this).prop("disabled") && $(this).is(":visible");
        }

        function isDot( event )
        {
                var keyCode = event.keyCode || event.which;
                return keyCode == 110 || keyCode == 190;
        }
        function getValueIndex( object )
        {
                return object && object.attr("sid") && Number( object.attr("sid").replace(/[^0-9]/g,'') );
        }
        $('.ip [sid^=VALUE]').keydown(function(event) {
                if( isDot( event )) {
                        event.preventDefault();
                        var $input = $( focusTarget ).filter( focusFilter ),
                                $next = $input.eq( $input.index(this) + 1);
                        if( getValueIndex( $next ) > getValueIndex( $(this) ) )
                        {
                                $next.focus();
                        }
                }
        }).keyup( function( event ) {
                var keyCode = event.keyCode || event.which;
                if( keyCode < 48 )
                        return;
                if( $(this).val() === "" )
                        $(this).val("");
                else {
                        $(this).val( Number( $(this).val().replace(/[^0-9]/g, "").substr(0, $(this).val().length ) ));
                }
        });
        var focusTarget = ".ip input[sid^=VALUE], .mac input[sid^=VALUE]";
        $( focusTarget ).keyup( function( event ) {
                var keyCode = event.keyCode || event.which;
                if( ( keyCode > 46 || keyCode == 0 ) && !isDot( event ) && $(this).val().length >= $(this).attr('maxlength') )
                {
                        $(this).val( $(this).val().substr(0, $(this).attr("maxlength")) );
                        var $input = $( focusTarget ).filter( focusFilter ),
                                $next = $input.eq( $input.index(this) + 1);
                        if( getValueIndex( $next ) > getValueIndex( $(this) ) )
                        {
                                if( $(this).val() == "" )
                                        $(this).val("");
                                $next.focus();
                        }
                }
        }).keydown( function( event ) {
                var keyCode = event.keyCode || event.which;
                if( keyCode == 8 && $(this).val().length == 0 )
                {
                        event.preventDefault();
                        var $input = $( focusTarget ).filter( focusFilter ),
                                $prev = $input.eq( $input.index(this) - 1 );
                        if( getValueIndex( $prev ) < getValueIndex( $(this) ) )
                                $prev.focus();
                }
        });
}

function json_validate(jsonObj,querystr)
{
	if(!jsonObj)	return true;

	for(var key in jsonObj){
		if(!key.match(/^[A-Za-z0-9_\-]{0,16}$/g))
			return false;
		if(json_validate(eval('jsonObj.'+querystr?querystr:key), querystr+'.'+key) == false)
			return false;
	}
	return true;
}

function get_config(_tmenu, _smenu, _args) 
{
	if(window.result_config)
		$.ajaxSetup({async : true, timeout : 4000});
	else
		$.ajaxSetup({ async : false });

	var result = true;
	var _data = [];
	_data.push({name : "tmenu", value : eval("_tmenu")});
	_data.push({name : "smenu", value : eval("_smenu")});
	_data.push({name : "act", value : "config"});
	if(_args){
		_data.push(_args);
	}
	$.getJSON('/cgi/msetup_get.cgi',_data)
	.done(function(data) {
		if(json_validate(data, '') == true)
			config_data = data;
		common_getconfig_result();
		result = true;
		$('#loading').popup('close');
	})
	.fail(function(jqxhr, textStatus, error) {
		result = false;
		$('#loading').popup('close');
		if(connectfailalert)
			alert(M_lang['S_DISCONNECTED_STRING']);
	}).always(function(){
		if(window.result_config)
			result_config(result);
		//$('#page').show();
		setTimeout(function(){
			$('#page').show();
			makeFocusEvent();
			//$('#intro_popup').popup('close');
			$('#intro_div').remove();
		},2000);
	});
}	

function default_setup()
{
	$("li>a").removeClass("ui-btn-icon-right");
	$(".icon").css("background-size","cover");
	$(".wrap_icon_content").css("cursor","pointer");
	$(".ui-page-header-fixed").css("padding-top","4.9em");
	$("li>a:even").css("background-color","#FFFFFF");
	$("li>a:odd").css("background-color","#F9FAF5");
	$("li:even").css("background-color","#FFFFFF");
	$("li:odd").css("background-color","#F9FAF5");
}

function valid_update() 
{
	$.each( $("li"), function() 
	{
		var id = $(this).attr('id');
		if(!id)	return;
		var obj = eval("config_data."+id);
		if (id!="userlist" && (!obj || obj.valid != 1) )
			$("#" + id + "").remove();
	});
}

function msetup_submit(service_name , localpostdata, flag, configOption, formid, retime) 
{
	if(window.result_submit)
		$.ajaxSetup({async : true, timeout : 30000});	
	else
		$.ajaxSetup({ async : false });
		
	
	var formidvalue;
	if(formid)
		formidvalue = formid;
	else
		formidvalue = 'msetup_form';
	
	var PostData = [];
	var result = false;
	if(localpostdata && localpostdata[0].name == "updatedatadb") var update = true;
	if(flag)
		PostData = $("#"+formidvalue).serializeArray();
	if(localpostdata && localpostdata.length != 0 && !update)
    {
    	for(var i in localpostdata)
	   		PostData.push({name : localpostdata[i].name , value : localpostdata[i].value });
    }
	else
		PostData = $("#"+formidvalue).serializeArray();
	
	if(update)
		PostData.push({name : localpostdata[0].name , value : localpostdata[0].value });

	if(service_name)
		PostData.push({name : "service_name", value : service_name});

	$.post('/cgi/msetup_set.cgi', PostData)
	.done(function(data)
	{
		result = true;
		connectfailalert = false;
		//get_config(window.tmenu, window.smenu, configOption);
		
		errorcode = 0;
		var s_datavalue;
		var returnvalue = data.indexOf(':');
		if( returnvalue > 0 )
		{
			s_datavalue = data.split(':');
			if(s_datavalue[0] == 'fail')
			errorcode = Number(s_datavalue[1]);
			result = false;
		}
	
		if(data == 'fail')
		{
			$("#loading").popup("close");
			alert(M_lang['S_SUBMIT_FAIL_MSG']);
			result = false; 
		}
	
		if(result)
			get_config(window.tmenu, window.smenu, configOption);
	
		if(submit_timeout_control)
		{
			clearTimeout(submit_timeout_control);
			$("#loading").popup("close");
			submit_timeout_control = null;
		}
	})
	.fail(function(jqxhr, textStatus, error)
	{
		result = false;
		alert("connection fail : " + service_name);	
	})
	.always(function()
	{	
		submit_timeout_control = setTimeout(function() {
			$("#loading").popup("close");
			submit_timeout_control = null;

			if(window.result_submit)
				result_submit(service_name, result);
		}, (retime?retime:500));
	});
	return result;
}

function check_change_value(_prefix)
{
	var checkvalue, result;
        //if( $("#right_panel").hasClass("ui-panel-open") )
        //       _prefix = "#right_panel";
        //else
                _prefix = _prefix || "#content";
        $(_prefix + " [sid^='C_']," + _prefix + "[sid^='N_']").each(function()
        {
                var sid = $(this).attr("sid");
                var s_sid = sid.split("_");
                var aObj = eval("config_data." + s_sid[VAL_ARTICLE].toLowerCase());
                if(aObj)
                {
                        var value = eval("aObj." + s_sid[VAL_TAGNAME].toLowerCase());
                                var type = $(this).attr("type");
                        if( $(this).attr("disabled") != true &&
                                $(this).attr("disabled") != "disabled" &&
                                !( $(this).attr("readonly") ) &&
                                $(this).attr("display") != "none" )
                        {
                                switch(type)
                                {
                                case "text":
                                case "number" :
                                case "password":
                                        if( $(this).val() != null && $(this).val() != value )
                                        {
                                                result = true;
                                                return false;
                                        }
                                        break;
                                case "select":
                                case "slider":
                                        if( $("option:selected", this).val() != value )
                                        {
                                                result = true;
                                                return false;
                                        }
                                        break;
                                case "checkbox":
                                        checkvalue = $(this).is(":checked") ? checkvalue = 1 : checkvalue = 0 ;
                                        if(checkvalue != value )
                                        {
                                                result = true;
                                                return false;
                                        }
                                        break;
                                case "radio":
                                        checkvalue = $('[name="' + $(this).attr('name') + '"]:checked').val();
                                        if(checkvalue != value )
                                        {
                                                result = true;
                                                return false;
                                        }
                                        break;
                                }
                                if($(this).hasClass('ip'))
                                {
                                        var iparr = value.split('.');
                                        if(value == ''){iparr = ['','','',''];}
                                        $('[sid=\"'+$(this).attr('sid')+'\"] [sid^=VALUE]').each(function(){
                                                var indexnum = $(this).attr('sid').replace(/[^0-9]/g,'');
                                                if(iparr[indexnum] != $(this).val())
                                                {
                                                        result = true;
                                                        return false;
                                                }
                                        });
                                }
                        }
                }
        });
        if( !result && window.check_change_value_local )
                result = check_change_value_local();
        return result;
}

//popup func
function alert(msg, _title)
{
	var title;

	if(!_title)
		title = M_lang['S_POPUP_TITLE_NOTI'];
	else
		title = _title;
	$('[sid="ALERT_TITLE_TEXT"]').text(title);
	$('[sid="ALERT_CONTENT_TEXT"]').html(parsing_msg_to_code(msg));
	$('#alert_popup').popup('open');
}

function alert_close()
{
	$('#alert_popup').popup('close');
}

function parsing_msg_to_code(msg)
{
	if(!msg)	return '';

	var parsed_text = '';
	var arr = msg.split('\n');
	if(arr.length == 1)	return msg;
	for(var i = 0; i < arr.length; i++){
		parsed_text += ('<p>'+arr[i]+'</p>');
	}
	return parsed_text;
}

function confirm(msg, title, _rightpanelflag)
{	
	rightpanelclose = true;
	if(_rightpanelflag == false)
		rightpanelclose = _rightpanelflag;

	if(!title) $('[sid="CONFIRM_TITLE_TEXT"]').text(M_lang['S_POPUP_TITLE_NOTI']);
	else $('[sid="CONFIRM_TITLE_TEXT"]').text(title);
	$('[sid="CONFIRM_CONTENT_TEXT"]').html(parsing_msg_to_code(msg));
	$('#confirm_popup').popup('open');
}

function confirm_close(flag)
{
	$("#confirm_popup").popup("close");
	
	if(window.confirm_result_local)
		confirm_result_local(flag);
	
	if(flag)
	{
		confirm_popup = true;
		if(rightpanelclose)
			$( "#right_panel" ).panel("close");
	}
	
	confirm_popup = false;
}

function HighlightObject()
{
        var $contents, $page, $header, $body, $target, $rightPanel, $dismissDiv;
        _cacheDOM();
        _init();

        function _cacheDOM() {
                $contents = $("<div>").attr("id", "blind_div").hide();
                $page = $("#page");
                $header = $("#header");
                $body = $("body");
                $rightPanel = $("#right_panel");
                $dismissDiv = $("#right_panel_dismiss");
        }
        function _init() {
                $body.append( $contents );

                $(document).on("panelbeforeclose", "#right_panel", _close );
        }
        function _resize() {
                var height = Math.max( $body.height(), $page.height() ) + $header.outerHeight(), width = Math.max( $body.width(), $page.width() );
                $contents.height( height ).width( width );
        }
        function _open(target) {
                (typeof target === "string")? $target = $("#" + target) : $target = target;
                _resize();
                _animate();
        }
        function _close() {
                if( $target )
                        $contents.fadeOut("fast", _reset );
        }
        function _animate() {
                $rightPanel.css( "z-index", "1002" );
                $target.css({
                        "position" : "relative",
                        "z-index": "999"
                });
                $dismissDiv.css( "z-index", "1001" );
                $contents.fadeIn("fast");
        }
        function _reset() {
                $target.css( {
                        "position" : "inherit",
                        "z-index" : "inherit"
                });
                $target = null;
        }
        function _highlight( object ) {
                if( object )
                        _open( object );
                else
                        _close();
        }
        return _highlight;
}

var events = (function() {
        var eventsList = {};
        function _on( eventName, callbackFunc ) {
                eventsList[ eventName ] = eventsList[ eventName ] || [];
                eventsList[ eventName ].push( callbackFunc );
                return this;
        }
        function _off( eventName, callbackFunc ) {
                var eventList = eventsList[ eventName ];
                if( !eventList )
                        return;
                if( !callbackFunc )
                        eventList.length =  0;
                for( var i = 0; i < eventList.length; ++i ) {
                        if( eventList[i] === callbackFunc ) {
                                eventList.splice(i, 1);
                                break;
                        }
                }
                return this;
        }
        function _emit( eventName, data ) {
                if( !eventsList[eventName])
                        return;
                eventsList[eventName].forEach( function( callbackFunc, index ) {
                        callbackFunc( data );
                });
                return this;
        }
        function _confirm( object ) {
                if( !object.msg || !object.runFunc )
                        return;
                eventsList[ "confirm" ] = [];
                _on( "confirm", object.runFunc );
                confirm( object.msg, object.title, object.panelFlag );
                return this;
        }
        return {
                on : _on,
                off : _off,
                emit : _emit,
                confirm : _confirm
        }
})();

