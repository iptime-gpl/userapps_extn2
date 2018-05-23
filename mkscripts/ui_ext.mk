EXT_DIR:=$(USERAPPS_ROOT)/cgi-src/ext_ux
ifeq ($(USE_MULTI_LANG),y)
LANG_LIST:=$(LANG_PACKS)
else
LANG_LIST:=$(LANGUAGE_POSTFIX)
endif

ext_html:
	@echo -e "\t\t--->Install HTML CSS JS GIFs"
	@cp -ra clones/$(TARGET)/home $(ROOT_DIR)/
	@ln -s /home/httpd/index.html $(ROOT_DIR)/home/httpd/192.168.0.1/index.html
	@ln -s /home/httpd/images2 $(ROOT_DIR)/home/httpd/192.168.0.1/images2
	@cp -ra $(EXT_DIR)/images/install/* $(ROOT_DIR)/
ifeq ($(USE_OEM_UI),y)
	@echo "$(LANG_LIST)" | awk -vRS=, '{print $$1}' | while read -r lang; do \
		cp clones/$(TARGET)/images/login_back_$(PRODUCT_ID).$$lang.* $(ROOT_DIR)/home/httpd/images2/; \
		cp clones/$(TARGET)/images/titlebar_$(PRODUCT_ID).$$lang.* $(ROOT_DIR)/home/httpd/images2/; \
		cp clones/$(TARGET)/images2/login_bt.$$lang.gif $(ROOT_DIR)/home/httpd/images2/; \
		cp clones/$(TARGET)/images2/login_str_id.$$lang.gif $(ROOT_DIR)/home/httpd/images2/; \
		cp clones/$(TARGET)/images2/login_str_passwd.$$lang.gif $(ROOT_DIR)/home/httpd/images2/; \
		cp clones/$(TARGET)/images2/login_bt_refresh.gif $(ROOT_DIR)/home/httpd/images2/login_bt_refresh.$$lang.gif; \
	done
else
	@cp clones/$(TARGET)/images2/main_title.gif $(ROOT_DIR)/home/httpd/images2/main_title.$(PRODUCT_ID).gif
	@echo "$(LANG_LIST)" | awk -vRS=, '{print $$1}' | while read -r lang; do \
		cp clones/$(TARGET)/images2/login_main.extender.$$lang.gif $(ROOT_DIR)/home/httpd/images2/; \
	done
endif
	@cp clones/$(TARGET)/images2/login_title.gif $(ROOT_DIR)/home/httpd/images2/login_title.$(PRODUCT_ID).gif

# CSS Section Start
	@ln -s /home/httpd/time.v2.css $(ROOT_DIR)/home/httpd/192.168.0.1/time.v2.css
	@cp -ra $(EXT_DIR)/css/install/* $(ROOT_DIR)/
# CSS Section End

	@rm -rf $(ROOT_DIR)/home/httpd/192.168.255.1/index*.html
ifeq ($(USE_NOLOGIN_PAGE_CONNECT),y)
	@cp $(ROOT_DIR)/home/httpd/index.html $(ROOT_DIR)/home/httpd/index_org.html
	@cp $(CONF_DIR)/html/index_nologin.html $(ROOT_DIR)/home/httpd/
endif

# JS Section Start 	
	@cp -ra $(EXT_DIR)/js/install/* $(ROOT_DIR)/
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
UI_TARGET_LIST+=ext_html

ext_cgi:
	@echo -e "\t\t--->Install CGI"
	@cp -ra $(EXT_DIR)/cgi/install/* $(ROOT_DIR)/
UI_TARGET_LIST+=ext_cgi

ifeq ($(USE_EMBEDDED_HELP),y)
# Help Section START 
NVEXT_HELP_DIR:=help

ext_help:
	@echo -e "\t\t--->Install HELP"
	@cp -ra $(EXT_DIR)/help/install/* $(ROOT_DIR)/
	@ln -s /home/httpd/$(NVEXT_HELP_DIR) $(ROOT_DIR)/home/httpd/192.168.0.1/$(NVEXT_HELP_DIR)

UI_TARGET_LIST+=ext_help
endif #USE_EMBEDDED_HELP



ext_msg:
	@echo -e "\t--->Install Extender UI"

ext_ui: ext_msg $(UI_TARGET_LIST)

TARGET_LIST+=ext_ui


