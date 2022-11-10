var utils = window.utils || {};

utils.enableForm = function (formId, enableIt) {
    var form = document.getElementById(formId);
    var elements = form.elements;
    var index = 0;

    for (index = 0; index < elements.length; ++index) {
        elements[index].disabled = (false === enableIt) ? true : false;
    }
};

utils.injectOrigin = function (name, searchFor) {
    var elements = document.getElementsByName(name);
    var index = 0;

    for (index = 0; index < elements.length; ++index) {
        elements[index].innerHTML = elements[index].innerHTML.replace(searchFor, location.origin);
    }
};

utils.makeRequest = function (options) {
    return new Promise(function (resolve, reject) {
        if ("object" !== typeof options) {
            reject({ msg: "Arguments are missing." });
        } else if ("string" !== typeof options.method) {
            reject({ msg: "Request method is missing." });
        } else if ("string" !== typeof options.url) {
            reject({ msg: "URL is missing." });
        } else {
            var xhr = new XMLHttpRequest();
            var formData = null;
            var urlEncodedPar = "";
            var isJsonResponse = false;
            var isFirst = true;

            if ("object" === typeof options.formData) {
                formData = options.formData;
            }
            else if ("object" === typeof options.parameter) {
                if ("get" === options.method.toLowerCase()) {
                    urlEncodedPar += "?"

                    for (var key in options.parameter) {
                        if (true === isFirst) {
                            isFirst = false;
                        } else {
                            urlEncodedPar += "&";
                        }
                        urlEncodedPar += encodeURIComponent(key);
                        urlEncodedPar += "=";
                        urlEncodedPar += encodeURIComponent(options.parameter[key])
                    }
                } else {
                    formData = new FormData();

                    for (var key in options.parameter) {
                        formData.append(key, options.parameter[key]);
                    }
                }
            }

            if ("boolean" === typeof options.isJsonResponse) {
                isJsonResponse = options.isJsonResponse;
            }

            xhr.open(options.method, options.url + urlEncodedPar);

            if ("undefined" !== typeof options.headers) {
                Object.keys(options.headers).forEach(function (key) {
                    xhr.setRequestHeader(key, options.headers[key]);
                });
            }

            if ("function" === typeof options.onProgress) {
                xhr.upload.onprogress = options.onProgress;
            }

            xhr.onload = function () {
                var jsonRsp = null;

                if (200 !== xhr.status) {
                    if (true === isJsonResponse) {
                        jsonRsp = JSON.parse(xhr.response);
                        reject(jsonRsp);
                    } else {
                        reject(xhr.response);
                    }
                } else {
                    if (true === isJsonResponse) {
                        jsonRsp = JSON.parse(xhr.response);

                        if ("ok" === jsonRsp.status) {
                            resolve(jsonRsp);
                        } else {
                            reject(jsonRsp);
                        }
                    } else {
                        resolve(xhr.response);
                    }
                }
            };

            xhr.onerror = function () {
                reject("Timeout");
            };

            if (null === formData) {
                xhr.send();
            } else {
                xhr.send(formData);
            }
        }
    });
};

utils.readJsonFile = function (file) {
    return new Promise(function (resolve, reject) {
        var rawFile = new XMLHttpRequest();

        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if ((4 == rawFile.readyState) && ("200" == rawFile.status)) {
                resolve(rawFile.responseText);
            }
        }
        rawFile.send(null);
    });
};

function matrixSetIcon(devAddress, pluginUid, file) {
    //disableUI();

    return utils.makeRequest({
        method: "POST",
        url: "https://"+devAddress+"/rest/api/v1/display/uid/" + pluginUid + "/bitmap",
        isJsonResponse: true,
        parameter: {
            file: file
        },
        headers: {
            "X-File-Size": file.size,
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "multipart/form-data",
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(function (rsp) {
        console.log("matrixSetIcon: Ok.");
    }).catch(function (rsp) {
        console.log("matrixSetIcon: Failed.");
    }).finally(function () {
        //enableUI();
    });
}

function matrixGetText(devAddress, pluginUid, justTextId) {
    //disableUI();
    return utils.makeRequest({
        method: "GET",
        url: "https://"+devAddress+"/rest/api/v1/display/uid/" + pluginUid + "/text",
        isJsonResponse: true,
        headers: {
            "Access-Control-Allow-Origin": '*'
        }
    }).then(function (rsp) {
        var justTextInput = document.getElementById(justTextId);

        justTextInput.value = rsp.data.text;

    }).catch(function (rsp) {
        console.log("matrixGetText: Internal error.");
    }).finally(function () {
        //enableUI();
    });
}

function matrixSetText(devAddress, pluginUid, justText) {
    //disableUI();

    return utils.makeRequest({
        method: "POST",
        url: "https://"+devAddress+"/rest/api/v1/display/uid/" + pluginUid + "/text",
        isJsonResponse: true,
        parameter: {
            show: justText
        },
        headers: {
            "Access-Control-Allow-Origin": '*',
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(function (rsp) {
        console.log("matrixSetText: Ok.");
    }).catch(function (rsp) {
        console.log("matrixSetText: Failed.");
    }).finally(function () {
        //enableUI();
    });
}