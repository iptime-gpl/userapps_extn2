

ifeq ($(USE_MULTI_PLATFORM),y)
NVEXT_JS_ROOT:=$(ROOT_DIR)/home/httpd/js.extender
NVEXT_JS_DIR:=js.extender
else
NVEXT_JS_ROOT:=$(ROOT_DIR)/home/httpd/js
NVEXT_JS_DIR:=js
endif

ifneq ($(USE_MULTI_PLATFORM),y)
nvext_html:
# HTML CSS JS Section start
	@echo -e "\t\t--->Install HTML CSS JS GIFs"
	@cp -ra clones/$(TARGET)/home $(ROOT_DIR)/
	@ln -s /home/httpd/index.html $(ROOT_DIR)/home/httpd/192.168.0.1/index.html
# GIF Section	
	@ln -s /home/httpd/images2 $(ROOT_DIR)/home/httpd/192.168.0.1/images2
	@cp -ra $(CONF_DIR)/html/gifs/v2/*.gif $(ROOT_DIR)/home/httpd/images2
	@cp -ra $(CONF_DIR)/html/gifs/v3/* $(ROOT_DIR)/home/httpd/images2
ifeq ($(USE_UI3),y)
	@rm -rf $(ROOT_DIR)/home/httpd/images2/radio.gif
	@rm -rf $(ROOT_DIR)/home/httpd/images2/radio_disable.gif
endif
ifeq ($(USE_HTTP_SESSION),y)
	@cp -ra $(CONF_DIR)/html/modules/httpsession/images/common/*.gif $(ROOT_DIR)/home/httpd/images2
	@cp -ra $(CONF_DIR)/html/modules/httpsession/images/$(LANGUAGE_POSTFIX)/*.gif $(ROOT_DIR)/home/httpd/images2
	@cp -ra $(CONF_DIR)/html/modules/httpsession/css/*.css $(ROOT_DIR)/home/httpd/
endif
ifeq ($(USE_OEM_UI),y)
	@cp clones/$(TARGET)/images/login_back_$(PRODUCT_ID).$(LANGUAGE_POSTFIX).* $(ROOT_DIR)/home/httpd/images2/
	@cp clones/$(TARGET)/images/titlebar_$(PRODUCT_ID).$(LANGUAGE_POSTFIX).* $(ROOT_DIR)/home/httpd/images2/
	@rm -rf $(ROOT_DIR)/home/httpd/images2/login_back_info.gif
	@cp -ra $(CONF_DIR)/html/gifs/v1/login_back_info.gif $(ROOT_DIR)/home/httpd/images2/login_back_info.v1.gif
else
	@cp -ra $(CONF_DIR)/html/gifs/v2/$(LANGUAGE_POSTFIX)/$(LOGIN_MAIN_GIF) $(ROOT_DIR)/home/httpd/images2
	@cp -ra $(CONF_DIR)/html/gifs/v2/$(LANGUAGE_POSTFIX)/main_title_button.$(LANGUAGE_POSTFIX).gif $(ROOT_DIR)/home/httpd/images2
	@cp clones/$(TARGET)/images2/main_title.gif $(ROOT_DIR)/home/httpd/images2/main_title.$(PRODUCT_ID).gif
	@cp clones/$(TARGET)/images2/login_title.gif $(ROOT_DIR)/home/httpd/images2/login_title.$(PRODUCT_ID).gif
endif
ifeq ($(USE_WIFI_EXTENDER),y)
	@cp $(ROOT_DIR)/home/httpd/images2/navimenu_wirelessconf.gif $(ROOT_DIR)/home/httpd/images2/navimenu_extender.gif
	@cp $(ROOT_DIR)/home/httpd/images2/wirelessconf_basicsetup.gif $(ROOT_DIR)/home/httpd/images2/extender_setup.gif
ifeq ($(USE_5G_WL),y)
	@cp $(ROOT_DIR)/home/httpd/images2/navimenu_wirelessconf5g.gif $(ROOT_DIR)/home/httpd/images2/navimenu_extender5g.gif
	@cp $(ROOT_DIR)/home/httpd/images2/wirelessconf_basicsetup.gif $(ROOT_DIR)/home/httpd/images2/extender5g_setup.gif
endif
	@rm -rf $(ROOT_DIR)/home/httpd/images2/navimenu_wirelessconf.gif
	@rm -rf $(ROOT_DIR)/home/httpd/images2/wirelessconf_basicsetup.gif
ifeq ($(USE_5G_WL),y)
	@rm -rf $(ROOT_DIR)/home/httpd/images2/navimenu_wirelessconf5g.gif
endif

ifneq ($(USE_OEM_UI),y)
	@cp clones/$(TARGET)/images2/login_main.extender.$(LANGUAGE_POSTFIX).gif $(ROOT_DIR)/home/httpd/images2/
endif
endif


# GIF Section End

# CSS Section Start
	@ln -s /home/httpd/time.v2.css $(ROOT_DIR)/home/httpd/192.168.0.1/time.v2.css
	@cp -ra $(CONF_DIR)/html/navi/time.v2.css $(ROOT_DIR)/home/httpd/time.v2.css
# CSS Section End

#	@ln -s /home/httpd/images2 $(ROOT_DIR)/home/httpd/192.168.255.1/images2
#	@ln -s /home/httpd/time.v2.css $(ROOT_DIR)/home/httpd/192.168.255.1/time.v2.css
#	@ln -s /home/httpd/192.168.255.1/index_$(LANGUAGE_POSTFIX).html $(ROOT_DIR)/home/httpd/192.168.255.1/index.html
	@rm -rf $(ROOT_DIR)/home/httpd/192.168.255.1/index*.html
ifeq ($(USE_NOLOGIN_PAGE_CONNECT),y)
	@cp $(ROOT_DIR)/home/httpd/index.html $(ROOT_DIR)/home/httpd/index_org.html
	@cp $(CONF_DIR)/html/index_nologin.html $(ROOT_DIR)/home/httpd/
endif

# JS Section Start 	
	@mkdir -p $(NVEXT_JS_ROOT)
	@cp -ra $(CONF_DIR)/html/extender/*.js $(NVEXT_JS_ROOT)
ifeq ($(USE_HTTP_SESSION),y)
	@cp -ra $(CONF_DIR)/html/modules/httpsession/js/*.js $(NVEXT_JS_ROOT)
endif
	@cp -ra $(CONF_DIR)/html/extender/string.js.$(LANG_FIX) $(NVEXT_JS_ROOT)/string.js
	@rm -rf $(NVEXT_JS_ROOT)/string.js.*
ifeq ($(USE_5G_WL),y)
	@ln -s /home/httpd/$(NVEXT_JS_DIR)/wirelessconf.js $(NVEXT_JS_ROOT)/wirelessconf5g.js
endif
ifneq ($(CUSTOM_NAVIMENU_JS_NAME),)
	cp -ra $(CONF_DIR)/html/navi/$(CUSTOM_NAVIMENU_JS_NAME) $(ROOT_DIR)/home/httpd/$(NVEXT_JS_DIR)/navimenu.js
	rm -rf $(ROOT_DIR)/home/httpd/$(NVEXT_JS_DIR)/$(CUSTOM_NAVIMENU_JS_NAME)
endif
# JS Section End	

# ETC Start 	
ifeq ($(USE_ONLINE_UPGRADE),y)
	@echo "$(PRODUCT_ID)" >  $(ROOT_DIR)/default/var/checkup
	@ln -s /var/checkup $(ROOT_DIR)/home/httpd/checkup
	@ln -s /home/httpd/checkup $(ROOT_DIR)/home/httpd/192.168.0.1/checkup
endif

ifeq ($(USE_CAPTCHA_CODE),y)
	@ln -s /tmp/captcha $(ROOT_DIR)/home/httpd/captcha
	@ln -s /home/httpd/captcha $(ROOT_DIR)/home/httpd/192.168.0.1/captcha
endif
	@echo $(MAJOR_VER).$(MINOR_VER) >  $(ROOT_DIR)/home/httpd/version
	@ln -s /home/httpd/version $(ROOT_DIR)/home/httpd/192.168.0.1/version
	@$(DATE) >  $(ROOT_DIR)/home/httpd/build_date
	@ln -s /home/httpd/build_date $(ROOT_DIR)/home/httpd/192.168.0.1/build_date
# ETC End 	
# HTML CSS JS Section End
UI_TARGET_LIST+=nvext_html
endif



ifeq ($(USE_MULTI_PLATFORM),y)
nvmulti_html:
# HTML CSS JS Section start
	@echo -e "\t\t--->Install HTML CSS JS GIFs"
	@cp -ra clones/$(TARGET)/home $(ROOT_DIR)/
# GIF Section	
	@cp $(ROOT_DIR)/home/httpd/images2/navimenu_wirelessconf.gif $(ROOT_DIR)/home/httpd/images2/navimenu_extender.gif
	@cp $(ROOT_DIR)/home/httpd/images2/wirelessconf_basicsetup.gif $(ROOT_DIR)/home/httpd/images2/extender_setup.gif
ifeq ($(USE_5G_WL),y)
	@cp $(ROOT_DIR)/home/httpd/images2/navimenu_wirelessconf5g.gif $(ROOT_DIR)/home/httpd/images2/navimenu_extender5g.gif
	@cp $(ROOT_DIR)/home/httpd/images2/wirelessconf_basicsetup.gif $(ROOT_DIR)/home/httpd/images2/extender5g_setup.gif
endif
ifneq ($(USE_OEM_UI),y)
	@cp clones/$(TARGET)/images2/login_main.extender.$(LANGUAGE_POSTFIX).gif $(ROOT_DIR)/home/httpd/images2/
endif
# GIF Section End

# CSS Section Start
# CSS Section End

# JS Section Start 	
	@mkdir -p $(NVEXT_JS_ROOT)
	@cp -ra $(CONF_DIR)/html/extender/*.js $(NVEXT_JS_ROOT)
ifeq ($(USE_HTTP_SESSION),y)
	@cp -ra $(CONF_DIR)/html/modules/httpsession/js/*.js $(NVEXT_JS_ROOT)
endif
	@cp -ra $(CONF_DIR)/html/extender/string.js.$(LANG_FIX) $(NVEXT_JS_ROOT)/string.js
	@ln -s /home/httpd/js.extender/wirelessconf.js $(ROOT_DIR)/home/httpd/js.extender/extender.js
	@rm -rf $(NVEXT_JS_ROOT)/string.js.*
ifeq ($(USE_5G_WL),y)
	@ln -s /home/httpd/$(NVEXT_JS_DIR)/wirelessconf.js $(NVEXT_JS_ROOT)/wirelessconf5g.js
endif
# JS Section End	
# HTML CSS JS Section End
UI_TARGET_LIST+=nvmulti_html
endif





##################################################################################################
# nvext_cgi
##################################################################################################
NVEXT_CGI_PATH:=$(USERAPPS_ROOT)/cgi-src/extender
NVEXT_CGIBIN_LIST := $(NVEXT_CGI_PATH)/timepro.cgi $(NVEXT_CGI_PATH)/upgrade.cgi
ifeq ($(USE_MOBILE_CGI),y)
NVEXT_CGIBIN_LIST +=$(NVEXT_CGI_PATH)/m.cgi
endif
ifeq ($(USE_HTTP_SESSION),y)
NVEXT_CGIBIN_LIST += $(NVEXT_CGI_PATH)/login_session.cgi
NVEXT_CGIBIN_LIST += $(NVEXT_CGI_PATH)/login_handler.cgi
ifeq ($(USE_CAPTCHA_CODE),y)
NVEXT_CGIBIN_LIST += $(NVEXT_CGI_PATH)/captcha.cgi
endif
endif
ifeq ($(USE_CONFIG_SAVE_RESTORE),y)
NVEXT_CGIBIN_LIST += $(NVEXT_CGI_PATH)/download.cgi
endif
NVEXT_LOGIN_LIST := $(NVEXT_CGI_PATH)/login.cgi

ifeq ($(USE_WIFI_EXTENDER),y)

ifeq ($(USE_MULTI_PLATFORM),y)
NVEXT_CGIBIN:=bin2
else
NVEXT_CGIBIN:=cgibin
endif

nvext_cgi:
	@echo -e "\t\t--->Install CGI"
	@mkdir -p $(ROOT_DIR)/$(NVEXT_CGIBIN)
	@mkdir -p $(ROOT_DIR)/$(NVEXT_CGIBIN)/login-cgi
	@cp -ra $(NVEXT_LOGIN_LIST) $(ROOT_DIR)/$(NVEXT_CGIBIN)/login-cgi/
	@cp -ra $(NVEXT_CGIBIN_LIST) $(ROOT_DIR)/$(NVEXT_CGIBIN)
ifeq ($(USE_HTTP_SESSION),y)
	@ln -s /$(NVEXT_CGIBIN)/login-cgi/login.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/login.cgi
endif
	@ln -s /$(NVEXT_CGIBIN)/timepro.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/d.cgi
ifeq ($(USE_MOBILE_CGI),y)
	@mkdir -p $(ROOT_DIR)/$(NVEXT_CGIBIN)/ddns
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/info.cgi
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/sys_apply.cgi
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/net_apply.cgi
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/wol_apply.cgi
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/wireless_apply.cgi
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/ddns/ddns_apply.cgi
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/login-cgi/hostinfo.cgi
	@ln -s /$(NVEXT_CGIBIN)/m.cgi $(ROOT_DIR)/$(NVEXT_CGIBIN)/login-cgi/hostinfo2.cgi
endif
UI_TARGET_LIST+=nvext_cgi
endif

ifeq ($(USE_EMBEDDED_HELP),y)
# Help Section START 
NVEXT_HELP_SRCDIR := $(USERAPPS_ROOT)/fs/help/extender/$(LANGUAGE_POSTFIX)

ifeq ($(USE_MULTI_PLATFORM),y)
NVEXT_HELP_DIR:=extender_help
else
NVEXT_HELP_DIR:=help
endif

nvext_help:
	@echo -e "\t\t--->Install HELP"
	@mkdir -p $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)
ifeq ($(USE_UTF8),y)
	@for file in $(shell ls $(NVEXT_HELP_SRCDIR)); do  \
		iconv -f EUCKR -t UTF-8  $(NVEXT_HELP_SRCDIR)/$$file -o $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/$$file&>>mk.log;  \
	done
else
	@cp -ra $(NVEXT_HELP_SRCDIR)/* $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)
endif
	@rm -rf $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/trafficconf_ls_help.html
	@rm -rf $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/trafficconf_lspolicy_help.html
	@rm -rf $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/trafficconf_lsrule_help.html
	@rm -rf $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/expertconf_kai_help.html
	@ln -s /home/httpd/$(NVEXT_HELP_DIR) $(ROOT_DIR)/home/httpd/192.168.0.1/$(NVEXT_HELP_DIR)
	@ln -s /home/httpd/$(NVEXT_HELP_DIR)/extender_advancesetup_help.html $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/extender5g_advancesetup_help.html
	@ln -s /home/httpd/$(NVEXT_HELP_DIR)/extender_info_help.html $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/extender5g_info_help.html
	@ln -s /home/httpd/$(NVEXT_HELP_DIR)/extender_setup_help.html $(ROOT_DIR)/home/httpd/$(NVEXT_HELP_DIR)/extender5g_setup_help.html

UI_TARGET_LIST+=nvext_help
endif #USE_EMBEDDED_HELP



nvext_msg:
	@echo -e "\t--->Install Navi Extender UI"

nvext_ui: nvext_msg $(UI_TARGET_LIST)

TARGET_LIST+=nvext_ui


