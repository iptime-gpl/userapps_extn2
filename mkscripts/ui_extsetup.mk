MSETUP_DIR:=$(USERAPPS_ROOT)/cgi-src/extsetup


MSETUP_DIRS:=cgi common msetup

msetup_install:
	@echo -e "\t\t--->Install MSETUP files"
	@cp -ra $(MSETUP_DIR)/install/* $(ROOT_DIR)/home/httpd/
	@for i in $(MSETUP_DIRS) ; do\
		ln -s ../$$i $(ROOT_DIR)/home/httpd/192.168.0.1/$$i;\
	done

UI_TARGET_LIST+=msetup_install

msetup_msg:
	@echo -e "\t--->Install MSETUP"

msetup_ui: msetup_msg $(UI_TARGET_LIST)

TARGET_LIST+=msetup_ui


