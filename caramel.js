function caramel() {
    var thisClass = this;

    var config = {
        baseURL: '',
        serviceVersion: 'v4',
        endpointURL: '',
        crmUsername: '',
        crmPassword: ''
    };

    var currentSession = {
        sessionId: ''
    };

    var currentOperation = {
        module: '',
        findBy: ''
    };

    // core methods

    this.init = function(options) {
        config.baseURL = options.baseURL;
        config.endpointURL = config.baseURL + "/service/" + config.serviceVersion + "/rest.php";
        this.clearCurrentSession();
    };

    this.clearCurrentSession = function() {
        currentSession = {
            sessionId: ''
        }
    };

    this.setCurrentSession = function(options) {
        currentSession.sessionId = options.sessionId;
    };

    this.showConfig = function() {
        console.log("CRM baseURL: " + config.baseURL);
        console.log("CRM endpointURL: " + config.endpointURL);
        console.log("CRM Username: " + config.crmUsername);
        console.log("CRM Password: " + config.crmPassword);
    };

    this.restCall = function(methodName, params, callbackFunction, failFunction) {
        // add session
        console.log("restCall(" + methodName + ")");
        console.log("====================================");
        console.log("PARAMS: " + JSON.stringify(params));

        console.log(methodName + "-call: " + currentSession.sessionId);
        if (!params.session && currentSession.sessionId != "") {
            params.session = currentSession.sessionId;
        }

        /*
                $.get(config.endpointURL + "&jsoncallback=?", {
                    method: methodName,
                    input_type: "JSON",
                    response_type: "JSON",
                    dataType: "jsonp",
                    rest_data: JSON.stringify(params)
                }, function(data) { console.log("DATA: " + data); });
        */
        var dataToSend = {
            method: methodName,
            input_type: "JSON",
            response_type: "JSON",
            rest_data: JSON.stringify(params)
        };

        console.log("dataToSend: " + JSON.stringify(dataToSend));
        console.log("====================================");
        $.ajax({
            // type: "GET",
            url: config.endpointURL + "?jsoncallback=?",
            data: dataToSend,
            dataType: 'jsonp', // jQuery JSONP requests are always async
            success: callbackFunction,
            error: failFunction
        });
    };

    this.restFail = function(xhr, ajaxOptions, thrownError) {
        console.log("AJAX error");
        console.log("==========");
        console.log("Status: " + xhr.status);
        console.log("Opt: " + ajaxOptions);
        console.log("Error: " + thrownError);
        console.log("==========");
    };

    // userland methods
    this.isSessionAvailable = function() {
        return (currentSession.sessionId != '');
    }

    this.logout = function(options) {
        this.restCall("logout", {},
            (options && options.success ? [this.logoutSuccess, options.success] : this.logoutSuccess),
            this.restFail
        );
    };

    this.logoutSuccess = function() {
        console.log("successfully logged out!");
        thisClass.clearCurrentSession();
    };

    this.login = function(options) {
        var params = {
            user_auth: {
                user_name: options.username,
                password: $.md5(options.password)
            },
            application: "SugarCRM"
        };

        this.restCall("login", params,
            (options.success ? [this.loginSuccess, options.success] : this.loginSuccess),
            this.restFail
        );
    };

    this.loginSuccess = function(result) {
        console.log("resultLoginSuccess = " + JSON.stringify(result));
        var sessionOptions = {
            sessionId: result.id
        };
        thisClass.setCurrentSession(sessionOptions);
        console.log("SessionID: " + currentSession.sessionId);
    }

    this.getUserId = function(options) {
        this.restCall("get_user_id", {},
            (options && options.success ? [this.getUserIdSuccess, options.success] : this.getUserIdSuccess),
            this.restFail
        );
    }

    this.getUserIdSuccess = function(result) {
        console.log("get_user_id: " + JSON.stringify(result));

    }

    this.getEntryList = function(options) {
        this.restCall(
            "get_entry_list",
            options.params,
            (options && options.success ? [this.getEntryListSuccess, options.success] : this.getEntryListSuccess),
            this.restFail
        );
    }

    this.getEntryListSuccess = function(result) {
        console.log("get_entry_list: " + JSON.stringify(result));
    }

    this.Account = function() {
        currentOperation.module = "Accounts";
        currentOperation.databaseTable = "accounts";
        return this;
    }

    this.Lead = function() {
        currentOperation.module = "Leads";
        currentOperation.databaseTable = "leads";
        return this;
    }

    this.Contact = function() {
        currentOperation.module = "Contacts";
        currentOperation.databaseTable = "contacts";
        return this;
    }

    this.findBy = function(variable, content) {
        currentOperation.findBy = {
            field: variable,
            value: content
        };
        return this;
    }

    this.call = function(success) {
        var params = {
            session: currentSession.sessionId,
            module_name: currentOperation.module,
            query: " " + currentOperation.databaseTable + "." + currentOperation.findBy.field + ' like "%' + currentOperation.findBy.value + '%"'
        };

        this.restCall(
            "get_entry_list",
            params,
            success,
            this.restFail
        );
    }
}