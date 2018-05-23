//local-global variables
var msetup_update_local_func = [];
var add_listener_local_func = [];
var submit_local_func = [];

var regExp_hex = /[0-9a-fA-F]{64}/
var regExp_admin = /^[0-9a-zA-Z]*$/g

var current_mode = null;
var data_local = null;
var smode = null;
var rmode = null;
var selectedObj2g = null;
var selectedObj5g = null;
var extcheckObj = null;
var connfailcount_2g = 0;
var connfailcount_5g = 0;
//local-global variables end

//local utility functions
function ByteLenUTF8CharCode(charCode)
{
    if (charCode <= 0x00007F) {
          return 1;
        } else if (charCode <= 0x0007FF) {
          return 2;
        } else if (charCode <= 0x00FFFF) {
          return 3;
        } else {
          return 4;
        }
}

function StrLenUTF8CharCode(val)
{
        var len=0, i=0;

        for(i=0;val.charCodeAt(i);i++)
                len+=ByteLenUTF8CharCode(val.charCodeAt(i));
        return len;
}

function submit_button_event_add(rule_type)
{
	$('[sid="S_MODIFY_BTN"]').unbind('click').click(function(){
		submit_local(rule_type, make_local_postdata());
	});
}

function make_local_wldata(mode, localdata)
{
	var wssidval = $('[sid=\"C_MSETUP_WSSID'+mode.toUpperCase()+'\"]').val();
	var wpassval = $('[sid=\"C_MSETUP_WPASSWORD'+mode.toUpperCase()+'\"]').val();
	var wpasschk = $('[sid=\"L_MSETUP_WPASSUSE'+mode.toUpperCase()+'\"]').is(':checked');

	localdata.push({'name':'wssid'+mode, 'value' : wssidval});
	if(wpasschk){
		localdata.push({'name':'wpasswd'+mode, 'value' : wpassval});
	}
	if(mode == '2g'){
		if(selectedObj2g){
			var authval = 'nouse';
			if(wssidval != selectedObj2g.essid){
				if(wpasschk)	authval = 'wpapskwpa2psk_tkipaes';
				else		authval = 'nouse';
			}
			else if(wpasschk && selectedObj2g.authencval == 'nouse'){
				authval = 'wpapskwpa2psk_tkipaes';
			}
			else if(!wpasschk && selectedObj2g.authencval != 'nouse'){
				authval = 'nouse';
			}
			else if(selectedObj2g.authencval){
				authval = selectedObj2g.authencval;
			}
			localdata.push({'name':'wauth2g', 'value' : authval});
		}else{
			if(wpasschk){
				if(config_data.wbcc.wssid2g != '' && config_data.wbcc.wssid2g == wssidval && config_data.wbcc.wpassword2g != '')
					localdata.push({'name':'wauth2g', 'value' : config_data.wbcc.wauth2g});
				else
					localdata.push({'name':'wauth2g', 'value' : 'wpapskwpa2psk_tkipaes'});
			}
			else
				localdata.push({'name':'wauth2g', 'value' : 'nouse'});
		}
	}
	else{
		if(selectedObj5g){
			var authval = 'nouse';
			if(wssidval != selectedObj5g.essid){
				if(wpasschk)	authval = 'wpapskwpa2psk_tkipaes';
				else		authval = 'nouse';
			}
			else if(wpasschk && selectedObj5g.authencval == 'nouse'){
				authval = 'wpapskwpa2psk_tkipaes';
			}
			else if(!wpasschk && selectedObj5g.authencval != 'nouse'){
				authval = 'nouse';
			}
			else if(selectedObj5g.authencval){
				authval = selectedObj5g.authencval;
			}
			localdata.push({'name':'wauth5g', 'value' : authval});
		}else{
			if(wpasschk){
				if(config_data.wbcc.wssid5g != '' && config_data.wbcc.wssid5g == wssidval && config_data.wbcc.wpassword5g != '')
					localdata.push({'name':'wauth5g', 'value' : config_data.wbcc.wauth2g});
				else
					localdata.push({'name':'wauth5g', 'value' : 'wpapskwpa2psk_tkipaes'});
			}
			else
				localdata.push({'name':'wauth5g', 'value' : 'nouse'});
		}
	}
}

function make_local_postdata()
{
	localdata = [];
	localdata.push({'name':'ip', 'value' : make_ip_string()});
	localdata.push({'name':'extselect', 'value' : config_data.msetup.extendselect});
	if(config_data.msetup.usedualext == '1'){
		switch(config_data.msetup.extendselect){
			case "PURE_2G_ONLY":
			case "CROSS_2G_ONLY":
			case "DUAL_2G_ONLY":
				make_local_wldata('2g', localdata);
				break;
			case "PURE_5G_ONLY":
			case "CROSS_5G_ONLY":
			case "DUAL_5G_ONLY":
				make_local_wldata('5g', localdata);
				break;
			case "PURE_ALL_MODE":
			case "CROSS_ALL_MODE":
				make_local_wldata('2g', localdata);
				make_local_wldata('5g', localdata);
				break;
		}
	}else{
		make_local_wldata('2g', localdata);
	}
	
	if($('[sid=\"L_MSETUP_AADMINUSE\"]').is(':checked')){
		localdata.push({'name':'aid', 'value' : $('[sid=\"C_MSETUP_AID\"]').val()});
		localdata.push({'name':'apasswd', 'value' : $('[sid=\"C_MSETUP_APASSWORD\"]').val()});
	}

	return localdata;
}

function make_ip_string()
{
        var result = '';

        result += $('[sid=\"C_MSETUP_IP\"] [sid=\"VALUE0\"]').val();  result += '.';
        result += $('[sid=\"C_MSETUP_IP\"] [sid=\"VALUE1\"]').val();  result += '.';
        result += $('[sid=\"C_MSETUP_IP\"] [sid=\"VALUE2\"]').val();  result += '.';
        result += $('[sid=\"C_MSETUP_IP\"] [sid=\"VALUE3\"]').val();

        return result;
}

function locking_obj(sid, proptype ,defval)
{
	if(defval || defval == ''){
		$('[sid="'+sid+'"]').val(defval).prop(proptype, true);	$('[sid="'+sid+'"]').parent().addClass('ui-state-disabled');
	}else{
		$('[sid="'+sid+'"]').prop(proptype, true);		$('[sid="'+sid+'"]').parent().addClass('ui-state-disabled');
	}
}

function unlocking_obj(sid, proptype ,defval)
{
	if(defval || defval == ''){
		$('[sid="'+sid+'"]').val(defval).prop(proptype, false);		$('[sid="'+sid+'"]').parent().removeClass('ui-state-disabled');
	}else{
		$('[sid="'+sid+'"]').prop(proptype, false);			$('[sid="'+sid+'"]').parent().removeClass('ui-state-disabled');
	}
}

function validate_string(str, regExp, type)
{
	if(type == 'unpermitted'){if(str.match(regExp))	return false;}
	else if(!type || type == 'match'){if(!str.match(regExp)) return false;}
	return true;
}

/*function footerbtn_view_control()
{
	var wval = $('[sid=\"L_MSETUP_WPASSUSE2G\"]').is(':checked');
	var aval = $('[sid=\"L_MSETUP_AADMINUSE\"]').is(':checked');
	var wval5g = false;
	if(wval != config_data.msetup.wpassuse2g)	wval = true;
	else						wval = false;
	if(config_data.msetup.usedualext == '1'){
		wval5g = $('[sid=\"L_MSETUP_WPASSUSE5G\"]').is(':checked');
		if(wval5g != config_data.msetup.wpassuse5g)	wval5g = true;
		else						wval5g = false;
	}
	if(aval != config_data.msetup.aadminuse)	aval = true;
	else						aval = false;
	if(check_change_value() || wval || aval || wval5g){unlocking_obj('S_MODIFY_BTN', 'disabled');}
	else{	locking_obj('S_MODIFY_BTN', 'disabled');}
}

function btncontrol_event_add(sid, type)
{
	switch(type){
		case "click":	$('[sid="'+sid+'"]').click(function(){footerbtn_view_control();});break;
		case "keyup":	$('[sid="'+sid+'"]').keyup(function(){footerbtn_view_control();});break;
		case "change":	$('[sid="'+sid+'"]').change(function(){footerbtn_view_control();});break;
	}
}*/

function set_passview_by_check(target, checked)
{
	if(checked){$('[sid=\"'+target+'\"]').attr('type','text');}
	else{$('[sid=\"'+target+'\"]').attr('type','password');}
}

function set_usepass_by_check(target_tbox, target_check, checked)
{
	if(checked){
		unlocking_obj(target_tbox, 'disabled');
		unlocking_obj(target_check, 'disabled');
	}else{
		locking_obj(target_tbox, 'disabled');
		locking_obj(target_check, 'disabled');
	}
	//footerbtn_view_control();
}

function set_useadmin_by_check(checked)
{
	if(checked){
		unlocking_obj('C_MSETUP_AID', 'disabled');
		unlocking_obj('C_MSETUP_APASSWORD', 'disabled');
		unlocking_obj('L_MSETUP_APASSVIEW', 'disabled');
	}else{
		locking_obj('C_MSETUP_AID', 'disabled');
		locking_obj('C_MSETUP_APASSWORD', 'disabled');
		locking_obj('L_MSETUP_APASSVIEW', 'disabled');
	}
	//footerbtn_view_control();
}

function set_extinputview_by_extcheck(mode, stat)
{
	mode = mode.toUpperCase();
	switch(stat)
	{
		case 'WAITING':
			locking_obj('C_MSETUP_WSSID'+mode, 'disabled');
			locking_obj('C_MSETUP_WPASSWORD'+mode, 'disabled');
			locking_obj('L_MSETUP_WPASSUSE'+mode, 'disabled');
			locking_obj('L_MSETUP_WPASSVIEW'+mode, 'disabled');
			locking_obj('L_SEARCH_DIV'+mode, 'disabled');
			break;
		case 'PLEASE':
		case 'BADPASS':
		case 'SUCCESS':
		case 'FAILED':
		default:
			unlocking_obj('C_MSETUP_WSSID'+mode, 'disabled');
			unlocking_obj('C_MSETUP_WPASSWORD'+mode, 'disabled');
			unlocking_obj('L_MSETUP_WPASSUSE'+mode, 'disabled');
			unlocking_obj('L_MSETUP_WPASSVIEW'+mode, 'disabled');
			unlocking_obj('L_SEARCH_DIV'+mode, 'disabled');
			set_usepass_by_check('C_MSETUP_WPASSWORD'+mode, 'L_MSETUP_WPASSVIEW'+mode, $('[sid=\"L_MSETUP_WPASSUSE'+mode+'\"]').is(':checked'));
			break;
	}
}

function set_extcheckview_by_status(mode)
{
	if(mode == '2g'){
		if(!extcheckObj.obj2g.stat || extcheckObj.obj2g.stat == 'PLEASE'){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj2g.stat == 'BADPASS'){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_BADPASS_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj2g.stat == 'SUCCESS'){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_SUCCESS_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj2g.stat == 'FAILED'){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_FAILED_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj2g.stat == 'WAITING'){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_WAITING_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','');
		}
		set_extinputview_by_extcheck('2g', extcheckObj.obj2g.stat);
	}else{
		if(!extcheckObj.obj5g.stat || extcheckObj.obj5g.stat == 'PLEASE'){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj5g.stat == 'BADPASS'){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_BADPASS_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj5g.stat == 'SUCCESS'){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_SUCCESS_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj5g.stat == 'FAILED'){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_FAILED_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}
		else if(extcheckObj.obj5g.stat == 'WAITING'){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_WAITING_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','');
		}
		set_extinputview_by_extcheck('5g', extcheckObj.obj5g.stat);
	}
}

function set_maindisplay_by_extselect(val)
{
	switch(val){
		case "PURE_2G_ONLY":
		case "CROSS_2G_ONLY":
		case "DUAL_2G_ONLY":
			$('[sid=\"WIRELESS_2G_TITLE\"] p, [sid=\"WIRELESS_2G_TITLE\"] img').css('opacity', '');
			$('[sid=\"WIRELESS_5G_TITLE\"] p, [sid=\"WIRELESS_5G_TITLE\"] img').css('opacity', '0.4');
			$('[sid=\"WIRELESS_2G_LINE\"]').css('display', '');
			$('[sid=\"WIRELESS_2G_DISABLED\"]').css('display', 'none');
			$('[sid=\"WIRELESS_5G_LINE\"]').css('display', 'none');
			$('[sid=\"WIRELESS_5G_DISABLED\"]').css('display', '');
			break;
		case "PURE_5G_ONLY":
		case "CROSS_5G_ONLY":
		case "DUAL_5G_ONLY":
			$('[sid=\"WIRELESS_2G_TITLE\"] p, [sid=\"WIRELESS_2G_TITLE\"] img').css('opacity', '0.4');
			$('[sid=\"WIRELESS_5G_TITLE\"] p, [sid=\"WIRELESS_5G_TITLE\"] img').css('opacity', '');
			$('[sid=\"WIRELESS_2G_LINE\"]').css('display', 'none');
			$('[sid=\"WIRELESS_2G_DISABLED\"]').css('display', '');
			$('[sid=\"WIRELESS_5G_LINE\"]').css('display', '');
			$('[sid=\"WIRELESS_5G_DISABLED\"]').css('display', 'none');
			break;
		case "PURE_ALL_MODE":
		case "CROSS_ALL_MODE":
			$('[sid=\"WIRELESS_2G_TITLE\"] p, [sid=\"WIRELESS_2G_TITLE\"] img').css('opacity', '');
			$('[sid=\"WIRELESS_5G_TITLE\"] p, [sid=\"WIRELESS_5G_TITLE\"] img').css('opacity', '');
			$('[sid=\"WIRELESS_2G_LINE\"]').css('display', '');
			$('[sid=\"WIRELESS_2G_DISABLED\"]').css('display', 'none');
			$('[sid=\"WIRELESS_5G_LINE\"]').css('display', '');
			$('[sid=\"WIRELESS_5G_DISABLED\"]').css('display', 'none');
			break;
	}
}

function set_imgline_by_extselect(val)
{
	switch(val){
		case "PURE_2G_ONLY":
			$('[sid=\"IMGLINE_LEFT2\"], [sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_2g');
			$('[sid=\"IMGLINE_LEFT5\"], [sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_disable');
			$('[sid=\"IMGLINE_LEFT5_SUB1\"], [sid=\"IMGLINE_RIGHT5_SUB1\"]').text('');
			$('[sid=\"IMGLINE_LEFT2_IMG\"], [sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/2g_dot.png');
			$('[sid=\"IMGLINE_LEFT5_IMG\"], [sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/disable_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/pure_2g.png');
			break;
		case "CROSS_2G_ONLY":
			$('[sid=\"IMGLINE_LEFT2\"]').removeClass().addClass('lc_imgline_2g');
			$('[sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_5g');
			$('[sid=\"IMGLINE_LEFT5\"], [sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_disable');
			$('[sid=\"IMGLINE_LEFT5_SUB1\"], [sid=\"IMGLINE_RIGHT2_SUB1\"]').text('');
			$('[sid=\"IMGLINE_LEFT2_IMG\"]').attr('src', 'images/2g_dot.png');
			$('[sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/5g_dot.png');
			$('[sid=\"IMGLINE_LEFT5_IMG\"], [sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/disable_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/cross_2g.png');
			break;
		case "DUAL_2G_ONLY":
			$('[sid=\"IMGLINE_LEFT2\"], [sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_2g');
			$('[sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_5g');
			$('[sid=\"IMGLINE_LEFT5\"]').removeClass().addClass('lc_imgline_disable');
			$('[sid=\"IMGLINE_LEFT5_SUB1\"]').text('');
			$('[sid=\"IMGLINE_LEFT2_IMG\"], [sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/2g_dot.png');
			$('[sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/5g_dot.png');
			$('[sid=\"IMGLINE_LEFT5_IMG\"]').attr('src', 'images/disable_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/all_2g.png');
			break;
		case "PURE_5G_ONLY":
			$('[sid=\"IMGLINE_LEFT2\"], [sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_disable');
			$('[sid=\"IMGLINE_LEFT5\"], [sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_5g');
			$('[sid=\"IMGLINE_LEFT2_SUB1\"], [sid=\"IMGLINE_RIGHT2_SUB1\"]').text('');
			$('[sid=\"IMGLINE_LEFT2_IMG\"], [sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/disable_dot.png');
			$('[sid=\"IMGLINE_LEFT5_IMG\"], [sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/5g_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/pure_5g.png');
			break;
		case "CROSS_5G_ONLY":
			$('[sid=\"IMGLINE_LEFT5\"]').removeClass().addClass('lc_imgline_5g');
			$('[sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_2g');
			$('[sid=\"IMGLINE_LEFT2\"], [sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_disable');
			$('[sid=\"IMGLINE_LEFT2_SUB1\"], [sid=\"IMGLINE_RIGHT5_SUB1\"]').text('');
			$('[sid=\"IMGLINE_LEFT5_IMG\"]').attr('src', 'images/5g_dot.png');
			$('[sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/2g_dot.png');
			$('[sid=\"IMGLINE_LEFT2_IMG\"], [sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/disable_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/cross_5g.png');
			break;
		case "DUAL_5G_ONLY":
			$('[sid=\"IMGLINE_LEFT5\"], [sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_5g');
			$('[sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_2g');
			$('[sid=\"IMGLINE_LEFT2\"]').removeClass().addClass('lc_imgline_disable');
			$('[sid=\"IMGLINE_LEFT2_SUB1\"]').text('');
			$('[sid=\"IMGLINE_LEFT5_IMG\"], [sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/5g_dot.png');
			$('[sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/2g_dot.png');
			$('[sid=\"IMGLINE_LEFT2_IMG\"]').attr('src', 'images/disable_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/all_5g.png');
			break;
		case "PURE_ALL_MODE":
			$('[sid=\"IMGLINE_LEFT2\"], [sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_2g');
			$('[sid=\"IMGLINE_LEFT5\"], [sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_5g');
			$('[sid=\"IMGLINE_LEFT2_IMG\"], [sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/2g_dot.png');
			$('[sid=\"IMGLINE_LEFT5_IMG\"], [sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/5g_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/pure_all.png');
			break;
		case "CROSS_ALL_MODE":
			$('[sid=\"IMGLINE_LEFT2\"], [sid=\"IMGLINE_RIGHT2\"]').removeClass().addClass('lc_imgline_2g');
			$('[sid=\"IMGLINE_LEFT5\"], [sid=\"IMGLINE_RIGHT5\"]').removeClass().addClass('lc_imgline_5g');
			$('[sid=\"IMGLINE_LEFT2_IMG\"], [sid=\"IMGLINE_RIGHT2_IMG\"]').attr('src', 'images/2g_dot.png');
			$('[sid=\"IMGLINE_LEFT5_IMG\"], [sid=\"IMGLINE_RIGHT5_IMG\"]').attr('src', 'images/5g_dot.png');
			$('[sid=\"IMGLINE_CENTER_IMG\"]').attr('src', 'images/cross_all.png');
			break;
	}
}

function set_imgtext_by_ssid()
{
	switch(config_data.msetup.extendselect){
		case "PURE_2G_ONLY":
			$('[sid=\"IMGLINE_LEFT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());	
			break;
		case "CROSS_2G_ONLY":
			$('[sid=\"IMGLINE_LEFT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val() + '_5G');	
			break;
		case "DUAL_2G_ONLY":
			$('[sid=\"IMGLINE_LEFT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val() + '_5G');	
			break;
		case "PURE_5G_ONLY":
			$('[sid=\"IMGLINE_LEFT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());	
			break;
		case "CROSS_5G_ONLY":
			$('[sid=\"IMGLINE_LEFT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val() + '_2G');	
			break;
		case "DUAL_5G_ONLY":
			$('[sid=\"IMGLINE_LEFT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val() + '_2G');	
			$('[sid=\"IMGLINE_RIGHT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());	
			break;
		case "PURE_ALL_MODE":
			$('[sid=\"IMGLINE_LEFT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());
			$('[sid=\"IMGLINE_LEFT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());
			$('[sid=\"IMGLINE_RIGHT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());	
			$('[sid=\"IMGLINE_RIGHT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());	
			break;
		case "CROSS_ALL_MODE":
			$('[sid=\"IMGLINE_LEFT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val());
			$('[sid=\"IMGLINE_LEFT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val());
			$('[sid=\"IMGLINE_RIGHT2_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID5G\"]').val() + '_2G');	
			$('[sid=\"IMGLINE_RIGHT5_SUB1\"]').text($('[sid=\"C_MSETUP_WSSID2G\"]').val() + '_5G');	
			break;
	}
}

function basic_control_event_add(ruletype)
{
	/*$('[sid^="C_"]').each(function(){
		var type=$(this).attr('type');
		if(!type)	return;
		var sid=$(this).attr('sid');
		var etype;

		switch(type){
			case 'radio':
			case 'checkbox':
			case 'slider':
			case 'select':	etype='change';	break;
			case 'text':	case 'password':	etype='keyup';	break;
			default:	return;
		}
		btncontrol_event_add(sid,etype);
	});*/

	//$('[sid=\"C_MSETUP_IP\"] [sid^=\"VALUE\"]').unbind('keyup').keyup(function(){footerbtn_view_control();});

	$('[sid=\"L_SEARCH_DIV2G\"]').unbind('click').click(function(){
		$('[sid=\"L_CUSTOM_MSG1\"]').text(M_lang['S_NOW_SEARCH1']);
                $('[sid=\"L_CUSTOM_MSG2\"]').text(M_lang['S_NOW_SEARCH2']);
                $('#loading_msg').popup('open');
		smode = '2g';
                get_apsearch_data(true);
	});

	$('[sid=\"L_SEARCH_DIV5G\"]').unbind('click').click(function(){
		$('[sid=\"L_CUSTOM_MSG1\"]').text(M_lang['S_NOW_SEARCH1']);
                $('[sid=\"L_CUSTOM_MSG2\"]').text(M_lang['S_NOW_SEARCH2']);
                $('#loading_msg').popup('open');
		smode = '5g';
                get_apsearch_data(true);
	});

	$('[sid=\"L_SELECT_EXTSELECT\"]').unbind('click').click(function(){
		rmode = 'extselect';
                $('#loading').popup('open');
		$('#right_panel').panel('open');
		load_rightpanel();
	});

	$('[sid=\"L_EXTENDSELECT_VALUE\"]').unbind('change').change(function(){
		if(config_data.msetup.usedualext != '1')	return;
		set_maindisplay_by_extselect(config_data.msetup.extendselect);
		set_imgline_by_extselect(config_data.msetup.extendselect);
		set_imgtext_by_ssid();
	}).trigger('change');

	$('[sid=\"L_MSETUP_WPASSUSE2G\"]').unbind('change').change(function(){
		var val = $(this).is(':checked');
		set_usepass_by_check('C_MSETUP_WPASSWORD2G', 'L_MSETUP_WPASSVIEW2G', val);
	}).trigger('change');
	
	$('[sid=\"C_MSETUP_WSSID2G\"]').unbind('change').change(function(){
		if(!check_wbcc_status('2g')){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('2g');
		}
		if(config_data.msetup.usedualext == '1')
			set_imgtext_by_ssid();
	}).unbind('keyup').keyup(function(){
		if(!check_wbcc_status('2g')){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('2g');
		}
		if(config_data.msetup.usedualext == '1')
			set_imgtext_by_ssid();
		//footerbtn_view_control();
	});

	$('[sid=\"C_MSETUP_WPASSWORD2G\"]').unbind('change').change(function(){
		if(!check_wbcc_status('2g')){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('2g');
		}
	}).unbind('keyup').keyup(function(){
		if(!check_wbcc_status('2g')){
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('2g');
		}
		//footerbtn_view_control();
	});

	$('[sid=\"C_MSETUP_WSSID5G\"]').unbind('change').change(function(){
		if(!check_wbcc_status('5g')){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('5g');
		}
		if(config_data.msetup.usedualext == '1')
			set_imgtext_by_ssid();
	}).unbind('keyup').keyup(function(){
		if(!check_wbcc_status('5g')){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('5g');
		}
		if(config_data.msetup.usedualext == '1')
			set_imgtext_by_ssid();
		//footerbtn_view_control();
	});
	
	$('[sid=\"C_MSETUP_WPASSWORD5G\"]').unbind('change').change(function(){
		if(!check_wbcc_status('5g')){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('5g');
		}
	}).unbind('keyup').keyup(function(){
		if(!check_wbcc_status('5g')){
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text(M_lang['S_CCHECK_PLEASE_STRING']);
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_IMG\"]').css('display','none');
		}else{
			set_extcheckview_by_status('5g');
		}
		//footerbtn_view_control();
	});

	$('[sid=\"L_MSETUP_WPASSVIEW2G\"]').unbind('change').change(function(){
		var val = $(this).is(':checked');
		set_passview_by_check('C_MSETUP_WPASSWORD2G',val);
	});
	
	$('[sid=\"L_MSETUP_WPASSUSE5G\"]').unbind('change').change(function(){
		var val = $(this).is(':checked');
		set_usepass_by_check('C_MSETUP_WPASSWORD5G', 'L_MSETUP_WPASSVIEW5G', val);
	}).trigger('change');

	$('[sid=\"L_MSETUP_WPASSVIEW5G\"]').unbind('change').change(function(){
		var val = $(this).is(':checked');
		set_passview_by_check('C_MSETUP_WPASSWORD5G',val);
	});

	$('[sid=\"L_MSETUP_APASSVIEW\"]').unbind('change').change(function(){
		var val = $(this).is(':checked');
		set_passview_by_check('C_MSETUP_APASSWORD',val);
	});
	
	$('[sid=\"L_MSETUP_AADMINUSE\"]').unbind('change').change(function(){
		var val = $(this).is(':checked');
		set_useadmin_by_check(val);
	}).trigger('change');
	
	$('[sid=\"L_GOTO_MANAGEMENT\"]').unbind('click').click(function(){
		location.href = '/login/login.cgi?noredirect=1';
	});
	
	$('[sid=\"L_CCHECK_2G\"]').unbind('click').click(function(){
		if($('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text() == M_lang['S_CCHECK_WAITING_STRING'])	return;
		if($('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text() == M_lang['S_CCHECK_SUCCESS_STRING'])	return;
		if(config_data.msetup.usedualext == '1' && 
			$('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text() == M_lang['S_CCHECK_WAITING_STRING']){
				alert(M_lang['S_CCHECK_OTHERCHECK_STRING1'] + '5GHz' + M_lang['S_CCHECK_OTHERCHECK_STRING2']);
				return;
		}
		if(!wlsetup_validate('2g'))	return;
		var localdata = [];
		connfailcount_2g = 0;
		make_local_wldata('2g', localdata);
		localdata.push({'name':'ip', 'value' : make_ip_string()});
		localdata.push({'name':'extselect', 'value' : config_data.msetup.extendselect});
		if($('[sid=\"L_MSETUP_AADMINUSE\"]').is(':checked')){
			localdata.push({'name':'aid', 'value' : $('[sid=\"C_MSETUP_AID\"]').val()});
		}
		msetup_part_submit(localdata, '2g');
		extcheckObj.obj2g.ssid = $('[sid=\"C_MSETUP_WSSID2G\"]').val();
		extcheckObj.obj2g.pass = $('[sid=\"C_MSETUP_WPASSWORD2G\"]').val();
		extcheckObj.obj2g.stat = 'WAITING';
		set_extcheckview_by_status('2g');
		setTimeout(function(){get_status_local('2g');},15000);
	});
	
	$('[sid=\"L_CCHECK_5G\"]').unbind('click').click(function(){
		if($('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text() == M_lang['S_CCHECK_WAITING_STRING'])	return;
		if($('[sid=\"L_CCHECK_5G\"] [sid=\"L_CCHECK_TEXT\"]').text() == M_lang['S_CCHECK_SUCCESS_STRING'])	return;
		if(config_data.msetup.usedualext == '1' && 
			$('[sid=\"L_CCHECK_2G\"] [sid=\"L_CCHECK_TEXT\"]').text() == M_lang['S_CCHECK_WAITING_STRING']){
				alert(M_lang['S_CCHECK_OTHERCHECK_STRING1'] + '2.4GHz' + M_lang['S_CCHECK_OTHERCHECK_STRING2']);
				return;
		}
		if(!wlsetup_validate('5g'))	return;
		var localdata = [];
		connfailcount_5g = 0;
		make_local_wldata('5g', localdata);
		localdata.push({'name':'ip', 'value' : make_ip_string()});
		localdata.push({'name':'extselect', 'value' : config_data.msetup.extendselect});
		if($('[sid=\"L_MSETUP_AADMINUSE\"]').is(':checked')){
			localdata.push({'name':'aid', 'value' : $('[sid=\"C_MSETUP_AID\"]').val()});
		}
		msetup_part_submit(localdata, '5g');
		extcheckObj.obj5g.ssid = $('[sid=\"C_MSETUP_WSSID5G\"]').val();
		extcheckObj.obj5g.pass = $('[sid=\"C_MSETUP_WPASSWORD5G\"]').val();
		extcheckObj.obj5g.stat = 'WAITING';
		set_extcheckview_by_status('5g');
		setTimeout(function(){get_status_local('5g');},15000);
	});

	submit_button_event_add(ruletype);
}

function msetup_part_submit(localpostdata, mode)
{
        $.ajaxSetup({async : true, timeout : 30000});

        var PostData = [];
        for(var i in localpostdata)
                PostData.push({name : localpostdata[i].name , value : localpostdata[i].value });

        PostData.push({name : "act", value : 'wbcc'});
        PostData.push({name : "wlmode", value : mode});
        $.post('/cgi/msetup_set.cgi', PostData);
}

function reboot_timer(remaining)
{
        if(remaining == 0){
		$('[sid=\"REBOOTDESC_STRING1\"]').text(M_lang['S_REBOOT_COMPLETE_STRING1']);
		$('[sid=\"REBOOTDESC_STRING2\"]').text(M_lang['S_REBOOT_COMPLETE_STRING2']);
		$('[sid=\"REBOOT_MSG\"]').text(M_lang['S_REBOOT_REMAINING_MSG3']);
		$('[sid=\"REBOOT_IMG\"]').css('display','none');
        }
        else{
                $('[sid="REBOOT_MSG"]').text(M_lang['S_REBOOT_REMAINING_MSG1'] + remaining + M_lang['S_REBOOT_REMAINING_MSG2']);
                remaining --;
                setTimeout("reboot_timer("+remaining+")",1000);
        }
}

function reboot_submit(service_name, localdata)
{
	$('[sid=\"REBOOT_IMG\"]').css('display','inline-block;');
	$('[sid=\"REBOOTDESC_STRING1\"]').text(M_lang['S_REBOOT_ING_STRING1']);
	$('[sid=\"REBOOTDESC_STRING2\"]').text(M_lang['S_REBOOT_ING_STRING2']);
	$('[sid=\"REBOOT_VALUES\"]').remove();
	$('[sid=\"REBOOT_VALUEFIELD\"]').append(
		'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
		'<div class=\"rebootleft\"><p>'+M_lang['S_REBOOT_SYSTEMIP_STRING']+'</p></div>' +
		'<div class=\"rebootright\"><p>'+make_ip_string()+'</p></div>' +
		'</div>'
	).trigger('create');
	if(config_data.msetup.usedualext == '1'){
		switch(config_data.msetup.extendselect){
			case "PURE_2G_ONLY":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>2.4GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID2G\"]').val()+'</p></div></div>'
				).trigger('create');
				break;
			case "CROSS_2G_ONLY":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>5GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID2G\"]').val()+'_5G</p></div></div>'
				).trigger('create');
				break;
			case "DUAL_2G_ONLY":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>2.4GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID2G\"]').val()+'</p></div></div>' +
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>5GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID2G\"]').val()+'_5G</p></div></div>'
				).trigger('create');
				break;
			case "PURE_5G_ONLY":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>5GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID5G\"]').val()+'</p></div></div>'
				).trigger('create');
				break;
			case "CROSS_5G_ONLY":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>2.4GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID5G\"]').val()+'_2G</p></div></div>'
				).trigger('create');
				break;
			case "DUAL_5G_ONLY":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>2.4GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID5G\"]').val()+'_2G</p></div></div>' +
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>5GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID5G\"]').val()+'</p></div></div>'
				).trigger('create');
				break;
			case "PURE_ALL_MODE":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>2.4GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID2G\"]').val()+'</p></div></div>' +
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>5GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID5G\"]').val()+'</p></div></div>'
				).trigger('create');
				break;
			case "CROSS_ALL_MODE":
				$('[sid=\"REBOOT_VALUEFIELD\"]').append(
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>2.4GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID5G\"]').val()+'_2G</p></div></div>' +
					'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
					'<div class=\"rebootleft\"><p>5GHz '+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
					'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID2G\"]').val()+'_5G</p></div></div>'
				).trigger('create');
				break;
		}
	}else{
		$('[sid=\"REBOOT_VALUEFIELD\"]').append(
			'<div class=\"rebootline\" sid=\"REBOOT_VALUES\">' + 
			'<div class=\"rebootleft\"><p>'+M_lang['S_REBOOT_GWL_STRING']+'</p></div>' +
			'<div class=\"rebootright\"><p>'+$('[sid=\"C_MSETUP_WSSID2G\"]').val()+'</p></div>' +
			'</div>'
		).trigger('create');
	}
	$('#loading').popup('open');
	msetup_submit(service_name, localdata, false);
}

function result_config(result)
{
	if(result){
                msetup_update('C');
        }
}

function result_submit(service_name, result)
{
	//if(result){
		var remaining = parseInt(eval('config_data.'+service_name+'.rebootsec'));
		reboot_timer(remaining);
		$('#loading_reboot').popup('open');
	//}
}

function check_wbcc_status(mode)
{
	var ssidval = $('[sid=\"C_MSETUP_WSSID'+mode.toUpperCase()+'\"]').val();
	var passval = $('[sid=\"C_MSETUP_WPASSWORD'+mode.toUpperCase()+'\"]').val();
	if(mode == '2g'){
		if(config_data.msetup.usedualext == '1'){
			switch(config_data.msetup.extendselect){
				case "PURE_5G_ONLY":
				case "CROSS_5G_ONLY":
				case "DUAL_5G_ONLY":	
					break;
				case "PURE_2G_ONLY":
				case "CROSS_2G_ONLY":
				case "DUAL_2G_ONLY":	
				case "PURE_ALL_MODE":
				case "CROSS_ALL_MODE":
					if(extcheckObj.obj2g.stat != 'SUCCESS')	return false;
					break;
			}
		}else{
			if(extcheckObj.obj2g.stat != 'SUCCESS')	return false;
		}
		if(ssidval != extcheckObj.obj2g.ssid)	return false;
		if(passval != extcheckObj.obj2g.pass)	return false;
	}else{
		if(config_data.msetup.usedualext == '1'){
			switch(config_data.msetup.extendselect){
				case "PURE_2G_ONLY":
				case "CROSS_2G_ONLY":
				case "DUAL_2G_ONLY":	
					break;
				case "PURE_5G_ONLY":
				case "CROSS_5G_ONLY":
				case "DUAL_5G_ONLY":	
				case "PURE_ALL_MODE":
				case "CROSS_ALL_MODE":
					if(extcheckObj.obj5g.stat != 'SUCCESS')	return false;
					break;
			}
		}else{
			if(extcheckObj.obj5g.stat != 'SUCCESS')	return false;
		}
		if(ssidval != extcheckObj.obj5g.ssid)	return false;
		if(passval != extcheckObj.obj5g.pass)	return false;
	}

	return true;
}

function wbcc_validate(mode)
{
	/*if(!check_wbcc_status(mode)){
		if(config_data.msetup.usedualext == '1'){
			alert(((mode == '2g')?'2.4GHz ':'5GHz ') + M_lang['S_CCHECK_NEEDCHECK_STRING']);
		}else{
			alert(M_lang['S_CCHECK_NEEDCHECK_STRING']);
		}
		return false;
	}*/
	return true;
}

function wlsetup_validate(mode)
{
	val = $('[sid=\"C_MSETUP_WSSID'+mode.toUpperCase()+'\"]').val();
	if(val == ''){
		if(config_data.msetup.usedualext == '1')
			alert(M_lang['S_SSID_BLANKED_'+mode.toUpperCase()]);
		else
			alert(M_lang['S_SSID_BLANKED']);
		return false;
	}
	if((slen = StrLenUTF8CharCode(val)) > 32){
		if(config_data.msetup.usedualext == '1')
			alert((mode == '2g'?'2.4GHz ':'5GHz ')+M_lang['S_SSID_OVERFLOW'] + slen + 'bytes');	
		else
			alert(M_lang['S_SSID_OVERFLOW'] + slen + 'bytes');

		return false;
	}
	
	val = $('[sid=\"C_MSETUP_WPASSWORD'+mode.toUpperCase()+'\"]').val();
	if($('[sid=\"L_MSETUP_WPASSUSE'+mode.toUpperCase()+'\"]').is(':checked')){
		if(val == ''){
			alert(M_lang['S_WPAPSK_BLANKED']);	return false;
		}
		if(val.length < 8){
			alert(M_lang['S_WPAPSK_INVALID']);	return false;
		}
	}
	return true;
}

function msetup_validate()
{
	var val = '';
	var slen = 0;

	if(!validate_string(make_ip_string(), regExp_ip, 'match')){
		alert(M_lang['S_IPADDR_INVALID']);        return false;
        }

	if(config_data.msetup.usedualext == '1'){
		switch(config_data.msetup.extendselect){
			case "PURE_2G_ONLY":
			case "CROSS_2G_ONLY":
			case "DUAL_2G_ONLY":
				if(!wlsetup_validate('2g'))	return false;
				break;
			case "PURE_5G_ONLY":
			case "CROSS_5G_ONLY":
			case "DUAL_5G_ONLY":
				if(!wlsetup_validate('5g'))	return false;
				break;
			case "PURE_ALL_MODE":
			case "CROSS_ALL_MODE":
				if(!wlsetup_validate('2g'))	return false;
				if(!wlsetup_validate('5g'))	return false;
				break;
		}
		if(!wbcc_validate('2g'))	return false;
		if(!wbcc_validate('5g'))	return false;
	}else{
		if(!wlsetup_validate('2g'))	return false;
		if(!wbcc_validate('2g'))	return false;
	}
		
	val = $('[sid=\"C_MSETUP_AID\"]').val();
	if($('[sid=\"L_MSETUP_AADMINUSE\"]').is(':checked')){
		if(val.length == 0){
			alert(M_lang['S_ADMINID_TOOSHORT']);	return false;
		}
		if(val.length > 32){
			alert(M_lang['S_ADMINID_TOOLONG']);	return false;
		}
		if(!validate_string(val, regExp_admin, 'match')){
			alert(M_lang['S_ADMINID_INVALID']);	return false;
		}
	}

	return true;
}

function get_apsearch_data(firstsearch)
{
	data_local = null;
	$.ajaxSetup({async : true, timeout:60000});
	if(firstsearch){
		$.getJSON('/cgi/msetup_get.cgi', {tmenu : window.tmenu,smenu : window.smenu, act : 'data', 'firstsearch' : 'true', 'wlmode' : smode})
		.done(function(data){
			if(json_validate(data, '') == true){
				data_local = data;
				$('#right_panel').panel('open');
				rmode = 'chanlist';
				load_rightpanel();
			}
		}).always(function(){
			$('.ui-panel-dismiss').css('display','');
			//$('#right_panel').panel('option','dismissible',true).trigger('updatelayout');
		});
	}
	else{
		$.getJSON('/cgi/msetup_get.cgi', {tmenu : window.tmenu,smenu : window.smenu, act : 'data', 'wlmode' : smode})
		.done(function(data){
			if(json_validate(data, '') == true){
				data_local = data;
				rmode = 'chanlist';
				load_rightpanel();
			}
		}).always(function(){
			$('.ui-panel-dismiss').css('display','');
			//$('#right_panel').panel('option','dismissible',true).trigger('updatelayout');
		});
	}
}

function onclick_searchlist(dataidx)
{
	if(data_local){
		var dataObj = data_local.aplist[dataidx];
		if(dataObj){
			if(dataObj.auth == 'WPA2-ENTERPRISE' || dataObj.auth == 'WPA-ENTERPRISE' || dataObj.auth == 'WEP' || dataObj.auth == 'UNKNOWN'){
                                alert(M_lang['S_UNSUPPORTED_STRING']);  return;
                        }
			if(smode == '2g'){
				$('[sid=\"C_MSETUP_WSSID2G\"]').val(dataObj.essid).trigger('change');
				selectedObj2g = dataObj;
				$('[sid=\"C_MSETUP_WPASSWORD2G\"]').val('');
				if(selectedObj2g.auth == 'OPEN')
					$('[sid=\"L_MSETUP_WPASSUSE2G\"]').removeAttr('checked').checkboxradio('refresh', 'true').trigger('change');
				else
					$('[sid=\"L_MSETUP_WPASSUSE2G\"]').prop('checked', true).checkboxradio('refresh', 'true').trigger('change');
			}else if(smode == '5g'){
				$('[sid=\"C_MSETUP_WSSID5G\"]').val(dataObj.essid).trigger('change');
				selectedObj5g = dataObj;
				$('[sid=\"C_MSETUP_WPASSWORD5G\"]').val('');
				if(selectedObj5g.auth == 'OPEN')
					$('[sid=\"L_MSETUP_WPASSUSE5G\"]').removeAttr('checked').checkboxradio('refresh', 'true').trigger('change');
				else
					$('[sid=\"L_MSETUP_WPASSUSE5G\"]').prop('checked', true).checkboxradio('refresh', 'true').trigger('change');
			}
				
                        //footerbtn_view_control();
		}
		$('#right_panel').panel('close');
	}
}

function onclick_extsellist(seldata)
{
	config_data.msetup.extendselect = seldata;
	$('[sid=\"L_EXTENDSELECT_VALUE\"]').val(M_lang['S_'+seldata]).trigger('change');
	$('#right_panel').panel('close');
}

function onclick_research()
{
	$('.ui-panel-dismiss').css('display','none');
	//$('#right_panel').panel('option','dismissible', false).trigger('updatelayout');
	$('#loading_msg').popup('open');
	get_apsearch_data();
}
//local utility functions end

//local functions start

msetup_update_local_func['extselect'] = function()
{
	$('[sid=\"S_TEMP_TITLE\"]').text(M_lang['S_EXTSELECT_HEADER']);
	$("li>a").on('mousedown touchstart', function(){$(this).addClass('highlight_click');})
		.on('webkitAnimationEnd oanimationend msAnimationEnd animationend',function(){$(this).removeClass('highlight_click');});
	$("li>a:even").css("background-color","#FFFFFF");
	$("li>a:odd").css("background-color","#F9FAF5");
	$("li>a").css('padding','0');
	$('[sid=\"L_SELLIST\"]').listview('refresh');
	$("li>a").removeClass("ui-btn-icon-right");
	$('[sid=\"L_SELLIST\"]').listview('refresh');
}

msetup_update_local_func['chanlist'] = function()
{
        if(data_local != null){
                $('[sid=\"S_TEMP_TITLE\"]').text(M_lang['S_APSEARCH_HEADER']);
                $('[sid=\"L_SEARCHLIST\"]').find('li').remove();

                for(var i = 0; i < data_local.aplist.length; i++){
                        if(typeof data_local.aplist[i].essid != 'undefined'){
                        var postfix_val = parseInt(((data_local.aplist[i].power != '')?data_local.aplist[i].power:'0'));
                        if(postfix_val >= 75)   postfix_val = 100;
                        else if(postfix_val < 75 && postfix_val >= 50) postfix_val = 75;
                        else if(postfix_val < 50 && postfix_val >= 25) postfix_val = 50;
                        else    postfix_val = 0;
			$('[sid=\"L_SEARCHLIST\"]').append(
                                '<li><a class=\"lc_panel_a\" onclick=\"onclick_searchlist(\''+i+'\');\">' +
                                '<div class=\"lc_panelline\">' +
                                '<div class=\"lc_panelline_left\">' +
                                '<img src=\"images/wifi_'+postfix_val+'.png\">' +
                                '</div>' +
                                '<div class=\"lc_panelline_right\">' +
                                '<div class=\"lc_panelsub_line\">' +
                                '<div class=\"lc_panelsub_left\">' + '<span>' +
                                ((data_local.aplist[i].essid!='')?data_local.aplist[i].essid:M_lang['S_BLANK_ESSID']) +
                                '</span></div>' +
                                '<div class=\"lc_panelsub_right\"><span>' +
                                ((data_local.aplist[i].configured == '1')?M_lang['S_APSTATUS_'+data_local.aplist[i].status]:'') +
                                '</span></div></div>' +
                                '<div class=\"lc_panelsub_line\">' +
                                '<div class=\"lc_panelsub_left\">' + '<span class=\"lc_disabled_text\">' + data_local.aplist[i].mac + '</span></div>' +
                                '<div class=\"lc_panelsub_right\"><span class=\"lc_disabled_text\">'+
                                ((data_local.aplist[i].channel=='' && data_local.aplist[i].power=='')?(M_lang['S_NOSEARCHED_STRING']):
                                (((data_local.aplist[i].auth == 'UNKNOWN')?M_lang['S_AUTHMISC_STRING']:data_local.aplist[i].auth) + '/' +
                                M_lang['S_CHANNEL_STRING'] + data_local.aplist[i].channel + '/' + data_local.aplist[i].power + '%')) +
                                '</span></div>' +
                                '</div></div></div>' +
                                '</a></li>'
                        );
                        }
                }

		$("li>a").on('mousedown touchstart', function(){$(this).addClass('highlight_click');})
			.on('webkitAnimationEnd oanimationend msAnimationEnd animationend',function(){$(this).removeClass('highlight_click');});
                $("li>a:even").css("background-color","#FFFFFF");
                $("li>a:odd").css("background-color","#F9FAF5");
                $('[sid=\"L_SEARCHLIST\"]').listview('refresh');
                $("li>a").removeClass("ui-btn-icon-right");
                $('[sid=\"L_SEARCHLIST\"]').listview('refresh');
		$('[sid=\"L_RESEARCH_BTN\"]').unbind('click').click(function(){
			onclick_research();
		});
        }
}


msetup_update_local_func['msetup'] = function(identifier)
{
	//if(!identifier){
		$('[sid=\"L_PAGE_TITLE\"]').text('Extender ' + config_data.productname + ' ' + M_lang['S_PAGE_TITLE']);
		if(config_data.msetup.usedualext == '1'){
			$('[sid=\"WIRELESS_2G_TITLE\"] [sid=\"S_WIRELESS_SETUP\"]').text(M_lang['S_WIRELESS2G_STRING'] + M_lang['S_WIRELESS_SETUP']);
			$('[sid=\"WIRELESS_5G_TITLE\"] [sid=\"S_WIRELESS_SETUP\"]').text(M_lang['S_WIRELESS5G_STRING'] + M_lang['S_WIRELESS_SETUP']);
			if(!rmode){
				set_extcheckview_by_status('5g');
				set_extcheckview_by_status('2g');
			}
		}else{
			if(!rmode)	set_extcheckview_by_status('2g');
		}
	//}
	/*else */if(identifier == 'C'){
		if(config_data.msetup.aid != ''){
			$('[sid=\"L_MSETUP_AADMINUSE\"]').prop('checked', true).checkboxradio('refresh', 'true');
			config_data.msetup.aadminuse = true;
		}else{
			config_data.msetup.aadminuse = false;
		}
		if(config_data.msetup.usedualext == '1'){
			$('[sid=\"WIRELESS_2G_TITLE\"]').css('display', '');
			$('[sid=\"WIRELESS_5G_TITLE\"]').css('display', '');
			$('[sid=\"L_EXTENDSELECT_VALUE\"]').val(M_lang['S_'+config_data.msetup.extendselect]);
			if(config_data.wbcc.wssid2g != ''){
				$('[sid=\"C_MSETUP_WSSID2G\"]').val(config_data.wbcc.wssid2g);
				$('[sid=\"C_MSETUP_WPASSWORD2G\"]').val(config_data.wbcc.wpassword2g);
			}
			if(config_data.wbcc.wssid5g != ''){
				$('[sid=\"C_MSETUP_WSSID5G\"]').val(config_data.wbcc.wssid5g);
				$('[sid=\"C_MSETUP_WPASSWORD5G\"]').val(config_data.wbcc.wpassword5g);
			}
		}else{
			$('[sid=\"EXTENDSELECT_TITLE\"]').remove();
			$('[sid=\"EXTENDSELECT_INFO\"]').remove();
			$('[sid=\"WIRELESS_2G_DISABLED\"]').remove();
			$('[sid=\"WIRELESS_5G_TITLE\"]').remove();
			$('[sid=\"WIRELESS_5G_LINE\"]').remove();
			$('[sid=\"WIRELESS_5G_DISABLED\"]').remove();
			if(config_data.wbcc.wssid2g != ''){
				$('[sid=\"C_MSETUP_WSSID2G\"]').val(config_data.wbcc.wssid2g);
				$('[sid=\"C_MSETUP_WPASSWORD2G\"]').val(config_data.wbcc.wpassword2g);
			}
		}
		if($('[sid=\"C_MSETUP_WPASSWORD2G\"]').val() != ''){
			$('[sid=\"L_MSETUP_WPASSUSE2G\"]').prop('checked', true).checkboxradio('refresh', 'true');
			config_data.msetup.wpassuse2g = true;
		}else{
			config_data.msetup.wpassuse2g = false;
		}
		if($('[sid=\"C_MSETUP_WPASSWORD5G\"]').val() != ''){
			$('[sid=\"L_MSETUP_WPASSUSE5G\"]').prop('checked', true).checkboxradio('refresh', 'true');
			config_data.msetup.wpassuse5g = true;
		}else{
			config_data.msetup.wpassuse5g = false;
		}
		//footerbtn_view_control();
	}
}

add_listener_local_func['msetup'] = function()
{
	basic_control_event_add('msetup');
}

submit_local_func['msetup'] = function(localdata)
{
	if(!msetup_validate())	return;
	events.confirm({ 
		msg: M_lang['S_REBOOT_ALERT'],
		runFunc: function( flag ) {
			if(flag)
				reboot_submit('msetup',localdata, false);
		}
	});
}

//local functions end

function get_status_local(mode)
{
        $.ajaxSetup({async : true, timeout : 4000});
        var _data = [];
        _data.push({name : "act", value : 'status'});
        _data.push({name : "wlmode", value : mode});
        $.getJSON('/cgi/msetup_get.cgi', _data)
        .done(function(data) {
                if(json_validate(data, '') == true)
		{
			if(mode == '2g'){
				extcheckObj.obj2g.stat = data.msetup.status;
				if(data.msetup.status == 'FAILED' || data.msetup.status == 'WAITING')	connfailcount_2g += 1;
				else					connfailcount_2g = 0;
			}else{
				extcheckObj.obj5g.stat = data.msetup.status;
				if(data.msetup.status == 'FAILED' || data.msetup.status == 'WAITING')	connfailcount_5g += 1;
				else					connfailcount_5g = 0;
			}
		}
        })
        .fail(function(jqxhr, textStatus, error) {
		if(mode == '2g'){connfailcount_2g += 1;}
		else{connfailcount_5g += 1;}
        }).always(function(){
		if((mode == '2g' && connfailcount_2g > 2) || (mode == '5g' && connfailcount_5g > 2)){
			if(mode == '2g')	extcheckObj.obj2g.stat = 'FAILED';
			else			extcheckObj.obj5g.stat = 'FAILED';
			set_extcheckview_by_status(mode);
			//alert(M_lang['S_DISCONNECTED_STRING']);	return;
		}
		else if((mode == '2g' && connfailcount_2g != 0) || (mode == '5g' && connfailcount_5g != 0)){
			var localdata = [];
			make_local_wldata(mode, localdata);
			msetup_part_submit(localdata, mode);
			//set_extcheckview_by_status(mode);
			setTimeout(function(){get_status_local(mode);},15000);
		}else{
			set_extcheckview_by_status(mode);
		}
        });
}

$(document).on('panelclose', '#right_panel', function(){
	$('[sid=\"L_SEARCHLIST\"]').find('li').remove();
	rmode = null;
});

$(document).ready(function() {
	window.tmenu = "";
	window.smenu = "";
	
	make_M_lang(S_lang, D_lang);
	msetup_init(window.tmenu, window.smenu, null);

	extcheckObj = [];
	extcheckObj.obj2g = [];		extcheckObj.obj5g = [];
	extcheckObj.obj2g.ssid = '';	extcheckObj.obj5g.ssid = '';
	extcheckObj.obj2g.pass = '';	extcheckObj.obj5g.pass = '';
	extcheckObj.obj2g.stat = '';	extcheckObj.obj5g.stat = '';
});

function msetup_update_local(identifier)
{
	for(var articleName in config_data){
		if(config_data.hasOwnProperty(articleName) && articleName != ''){
			var caller_func = msetup_update_local_func[articleName];
			if(caller_func){
				caller_func.call(this, identifier);
				if(identifier == 'C')
					listener_add_local(articleName);
			}
		}
	}
}

function listener_add_local(ruletype)
{
	add_listener_local_func[ruletype].call(this);
}

function submit_local(rule_type, localdata)
{
	submit_local_func[rule_type].call(this, localdata);
}

function load_rightpanel()
{
	$.ajaxSetup({ async : true, timeout:20000});
	$("#right_content").load(
		'html/'+rmode+'.html',
		function(responseTxt, statusTxt, xhr) 
		{
			if (statusTxt == "success") 
			{
				$(this).trigger('create');
				load_header(RIGHT_HEADER, 'TEMP');
			}
		}
	);
}

function load_header_ended()
{
	msetup_update('S');
	msetup_update_local_func[rmode].call();
	$('#loading').popup('close');
	$('#loading_msg').popup('close');
}
