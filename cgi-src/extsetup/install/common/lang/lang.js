// JavaScript Document
function msetup_update(identifier)
{
	var VAL_ID = 0;
	var VAL_ARTICLE = 1;
	var VAL_TAGNAME = 2;

	$("[sid^='" + identifier + "_']").each(function()
	{
		var sid = $(this).attr("sid");	
		var type = $(this).attr("type");
		var l_sid = sid.toLowerCase();
		var l_sid_s = l_sid.split("_");
	
		if(identifier == "C")
		{	
			if( $(this).hasClass("ip") || $(this).hasClass("mac") )
			{
				var getvalue = eval("config_data." + l_sid_s[VAL_ARTICLE] + "." + l_sid_s[VAL_TAGNAME]);
				var value_s;
				if(!getvalue)
					var value_s = ["","","","","",""];
				else
				{
					if( $(this).hasClass("ip") )
						var value_s = getvalue.split(".");
					else if( $(this).hasClass("mac") )
						var value_s = getvalue.split("-");
						if(value_s.length == 1)
							value_s = getvalue.split(":");
				}
				var arraycount = value_s.length;
				if(arraycount > 0)
				{
					for(var i=0;i<arraycount;i++)
						$('[sid="VALUE'+i+'"]', this).val(value_s[i]);
				}
			}
			else
			{
				switch(type)
				{	
					case "checkbox":
						eval("config_data." + l_sid_s[VAL_ARTICLE] + "." + l_sid_s[VAL_TAGNAME]) == 1 ? 
							$('[sid="' + sid + '"]').prop('checked', 'checked').checkboxradio("refresh") :
							$('[sid="' + sid + '"]').removeAttr('checked').checkboxradio("refresh") ;
						break;	
					case "text":
					case "password":
						var pholder = M_lang[("S_"+l_sid_s[VAL_ARTICLE]+"_"+l_sid_s[VAL_TAGNAME]).toUpperCase()];
						if(pholder)
							$('[sid="' + sid + '"]').attr('placeholder',pholder);
						$('[sid="' + sid + '"]').val(eval("config_data." + l_sid_s[VAL_ARTICLE] + "." + l_sid_s[VAL_TAGNAME]));
						break;
				}
			}

		}

		else if (identifier == "D")
		{
			if( $(this).hasClass("ip") || $(this).hasClass("mac") )
			{
				var getvalue = eval("status_data." + l_sid_s[VAL_ARTICLE] + "." + l_sid_s[VAL_TAGNAME]);
				var value_s;
				if(!getvalue)
					var value_s = ["","","",""];
				else
				{
					if( $(this).hasClass("ip") )
						var value_s = getvalue.split(".");
					else if( $(this).hasClass("mac") )
						var value_s = getvalue.split("-");
				}
				var arraycount = value_s.length;
				if(arraycount > 0)
				{
					for(var i=0;i<arraycount;i++)
						$('[sid="VALUE'+i+'"]', this).val(value_s[i]);
				}
			}
			else
				$('[sid="' + sid + '"]').text(M_lang["D_" + eval("status_data."+ l_sid_s[VAL_ARTICLE] + "." + l_sid_s[VAL_TAGNAME] + "")]);
		}	
		else // (identifier == "S" or etc)
		{
			if(type){
				switch(type){
					case "select":
					case "text":
					case "password":
					case "radio":
					case "checkbox":
					default:
						$('[sid="' + sid + '"]').attr('value',M_lang[sid]);
						break;
				}
			}
			else
				$('[sid="' + sid + '"]').text(M_lang[sid]);
		}	
	});
	msetup_update_local(identifier);
}
