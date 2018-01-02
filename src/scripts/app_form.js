/**
 * Created by okuscu on 06/15/2017
 */
let imageDropzone = void 0;
let docDropzone = void 0;
let form;
let appParam = 'streetart';
let DZ_remove = [];

let cookie_SID = appParam + '.sid';
let cookie_modifiedUsername = appParam + '.cot_uname';
let cookie_modifiedFirstName = appParam + '.firstName';
let cookie_modifiedLastName = appParam + '.lastName';
let cookie_modifiedEmail = appParam + '.email';
let repo = appParam;

function saveReport(action, payload, msg, form_id, repo) {
  let uploads = (payload.image_uploads).concat(payload.doc_uploads);
  let keepQueryString = checkFileUploads(uploads);

  $.ajax({
    url: config.httpHost.app[httpHost] + config.api.post + repo + '?sid=' + getCookie(cookie_SID) + keepQueryString,
    type: 'POST',
    data: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    dataType: 'json'
  }).done(function (data) {
    switch (action) {
      case 'save':
        if (data && data.EventMessageResponse && data.EventMessageResponse.Event && data.EventMessageResponse.Event.EventID) {
          // Route to /{id} draft page if new report is successfully saved
          hasher.setHash(data.EventMessageResponse.Event.EventID + '?alert=success&msg=' + msg.done + '&ts=' + new Date().getTime());
        } else {
          hasher.setHash('new?alert=danger&msg=' + msg.fail + '&ts=' + new Date().getTime());
        }
        break;

      case 'notify':
        if (data && data.EventMessageResponse && data.EventMessageResponse.Event && data.EventMessageResponse.Event.EventID) {
          // Email report notice to emergency management captain and incident manager/reporters
          emailNotice(data.EventMessageResponse.Event.EventID, action);
        } else {
          hasher.setHash('new?alert=danger&msg=' + msg.fail + '&ts=' + new Date().getTime());
        }
        break;

      case 'submit':
        if (data && data.EventMessageResponse && data.EventMessageResponse.Event && data.EventMessageResponse.Event.EventID) {
          let updatePayload = JSON.stringify({
            'payload': JSON.stringify(form.getData()),
            'status': config.status.Submitted
          });
          updateReport(data.EventMessageResponse.Event.EventID, action, updatePayload, msg, form.getData());
        } else {
          hasher.setHash('new?alert=danger&msg=' + msg.fail + '&ts=' + new Date().getTime());
        }
        break;

      default:
        break;
    }
  }).fail(function (textStatus, error) {
    alert("POST Request Failed: " + textStatus + ", " + error);
    hasher.setHash('new?alert=danger&msg=' + msg.fail + '&ts=' + new Date().getTime());
  }).always(function () {
    $(".btn").removeAttr('disabled').removeClass('disabled');
  });
}
function updateReport(fid, action, payload, msg, repo, formData) {

  let uploads = (formData.image_uploads).concat(formData.doc_uploads);
  let keepQueryString = checkFileUploads(uploads);

  $.ajax({
    url: config.httpHost.app[httpHost] + config.api.put + repo + '/' + fid + '?sid=' + getCookie(cookie_SID) + keepQueryString,
    type: 'POST',
    data: payload,
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    dataType: 'json',
  }).done(function (data) {

    //  action = 'notify';
    switch (action) {
      case 'save':
        hasher.setHash(fid + '?alert=success&msg=' + msg.done + '&ts=' + new Date().getTime());
        // code to remove deleted attachments
        if (DZ_remove.length > 0) {
          $.each(DZ_remove, function (i, deleteRowURL) {
            $.get(deleteRowURL, function (response) {
            }).fail(function () {
              console.log('Failed to update attachments with this url parameter', deleteRowURL);
            });
          })
        }
        DZ_remove = [];

        // send the publish requests for Live records
        if ($('input[name="lstStatus"]:checked').val() == config.status.LiveApp) {
          publishUploads(uploads);
        }

        break;
      case 'updateAttachments':
        break;
      case 'notify':
        // Email report notice to emergency management captain and incident manager/reporters
        // emailNotice(fid, action);
        break;

      case 'submit':
      default:
        break;
    }
  }).fail(function (textStatus, error) {
    alert("POST Request Failed: " + textStatus + ", " + error);
    hasher.setHash(fid + '?alert=danger&msg=' + msg.fail + '&ts=' + new Date().getTime());
  }).always(function () {
    $(".btn").removeAttr('disabled').removeClass('disabled');
  });
}
function emailNotice(fid, action, PreferredContactName) {
  let emailTo = {};
  let emailCaptain = config.captain_emails[httpHost];
  let emailAdmin = config.admin_emails[httpHost];
  (typeof emailCaptain !== 'undefined' && emailCaptain != "") ? $.extend(emailTo, emailCaptain) : "";
  (typeof emailAdmin !== 'undefined' && emailAdmin != "") ? $.extend(emailTo, emailAdmin) : "";

  var emailRecipients = $.map(emailTo, function (email) {
    return email;
  }).filter(function (itm, i, a) {
    return i === a.indexOf(itm);
  }).join(',');

  var payload = JSON.stringify({
    'emailTo': emailRecipients,
    'emailFrom': (config.messages.notify.emailFrom ? config.messages.notify.emailFrom : 'wmDev@toronto.ca'),
    'id': fid,
    'status': action,
    'body': (config.messages.notify.emailBody ? config.messages.notify.emailBody : 'New submission by "' + PreferredContactName + '" has been received.'),
    'emailSubject': (config.messages.notify.emailSubject ? config.messages.notify.emailSubject : 'New submission')
  });

  $.ajax({
    url: config.httpHost.app_public[httpHost] + config.api_public.email,
    type: 'POST',
    data: payload,
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    "datatype": 'json'
  }).done(function (data, textStatus, jqXHR) {
  }).fail(function (jqXHR, textStatus, error) {
    console.log("POST Request Failed: " + textStatus + ", " + error);
  });
}
function getJSONStatus(statusVal) {
  var jsonStatusVal = "";
  /*
         'DraftApp': 'New',
         'SubmittedApp': 'Pending',
         'ApprovedApp': 'Approved',
         'DeniedApp': 'Denied',
         'InvalidApp': 'Invalid Requests'
         */
  switch (statusVal) {
    case config.status.DraftApp:
      jsonStatusVal = config.status.Draft;
      break;
    case config.status.SubmittedApp:
      jsonStatusVal = config.status.Pending;
      break;
    case config.status.ApprovedApp:
      jsonStatusVal = config.status.Approved;
      break;
    case config.status.RejectedApp:
      jsonStatusVal = config.status.Rejected;
      break;
    case config.status.LiveApp:
      jsonStatusVal = config.status.Live;
      break;
    case config.status.ArchivedApp:
      jsonStatusVal = config.status.Archived;
      break;
    case config.status.InvalidApp:
      jsonStatusVal = config.status.Invalid;
      break;
    default:
      jsonStatusVal = config.status.Draft;
  }
  //  console.log(statusVal, jsonStatusVal);
  return jsonStatusVal;
}
function processForm(action, form_id, repo) {
  let fid = $("#fid").val();
  let msg, payload;

  let f_data = form.getData();
  let PreferredContactName = displayPreferred(f_data);
  f_data.displayPreferredContactName = PreferredContactName;

  f_data.image_uploads = processUploads(imageDropzone, repo, true);
  f_data.doc_uploads = processUploads(docDropzone, repo, true);

  msg = {
    'done': 'save.done',
    'fail': 'save.fail'
  };
  var payloadStatusVal = getJSONStatus($('input[name="lstStatus"]:checked').val());
  payload = JSON.stringify({
    'payload': JSON.stringify(f_data),
    'status': payloadStatusVal
  });

  // Update report and move to Submitted state
  if (fid) {
    updateReport(fid, action, payload, msg, repo, f_data);
  }
  // Create new report and move to Submitted state
  else {
    // payload = JSON.stringify(f_data);
    payload = f_data;
    saveReport(action, payload, msg, form_id, repo);
  }
}
function loadForm(destinationSelector, data, fid, status, form_id, repo, allJSON, docMode) {
  let adminForm = true;
  let showAdminHeader = true;
  let showContactSections = false;
  let showAttachmentSection = false;
  let debugMode = false;

  DZ_remove = [];

//  let sections = $.merge(getAdminSectionsTop(), $.merge(getSubmissionSections(), getAdminSectionsBottom()));
  let sections = $.merge(getAdminSectionsTop(), getSubmissionSections());

  form = new CotForm({
    id: form_id,
    title: '',
    useBinding: false,
    rootPath: config.httpHost.rootPath[httpHost],
    sections: sections,
    success: function (e) {
      // Pass callback function based on submit button clicked
      let action = $("#action").val();
      if (['save', 'notify', 'submit', 'approve', 'reject'].indexOf(action) !== -1) {
      } else {
        //  console.log('Error: Form action is not set');
      }
      e.preventDefault();
    }
  });

  app.addForm(form, 'bottom');

  initForm(data);

  imageDropzone = new Dropzone("div#image_dropzone", $.extend(config.admin.imageDropzoneStaff, {
    "dz_id": "image_dropzone", "fid": fid, "form_id": form_id,
    "url": config.api.upload + config.default_repo + '/' + repo,
  }));

  docDropzone = new Dropzone("div#document_dropzone", $.extend(config.admin.docDropzoneStaff, {
    "dz_id": "document_dropzone", "fid": fid, "form_id": form_id,
    "url": config.api.upload + config.default_repo + '/' + repo,
  }));

  $(".dz-hidden-input").attr("aria-hidden", "true");
  $(".dz-hidden-input").attr("aria-label", "File Upload Control");


  let modifiedUsername = decodeURIComponent(getCookie(cookie_modifiedUsername));
  let modifiedName = decodeURIComponent(getCookie(cookie_modifiedFirstName)) + ' ' + decodeURIComponent(getCookie(cookie_modifiedLastName));
  let modifiedEmail = decodeURIComponent(getCookie(cookie_modifiedEmail));

  // New report
  if (!data) {
    // Set created by and modified by to current user
    $("#createdBy, #modifiedBy").val(modifiedUsername);
    var dataCreated = new Date();
    $("#recCreated").val(dataCreated);
    $("#lstStatus").val(config.status.DraftApp);
    $("#modifiedEmail").val('{"' + modifiedName + '":"' + modifiedEmail + '"}');
  }
  // View/Edit existing report
  else {

    if ($("#recCreated").val() == "") {
      $("#recCreated").val(moment(allJSON.created).format(config.dateTimeFormat));
    }

    showUploads(imageDropzone, 'image_uploads', data, repo, true, true);
    showUploads(docDropzone, 'doc_uploads', data, repo, true, true);

    // Populate existing form with JSON object from GET request

    form.setData(data);

    if (fid) { $("#fid").val(fid); }

    $("#modifiedBy").val(modifiedUsername);
    if (!$("#modifiedEmail").val()) {
      $("#modifiedBy").val(modifiedUsername);
      $("#modifiedEmail").val('{"' + modifiedName + '":"' + modifiedEmail + '"}');
    }
    else if ($("#modifiedEmail").val().indexOf(modifiedEmail) == -1) {
      if ($("#modifiedEmail").val()) {
        let emailObj = JSON.parse($("#modifiedEmail").val());
        emailObj[modifiedName] = modifiedEmail;
        $("#modifiedEmail").val(JSON.stringify(emailObj));
      } else {
        $("#modifiedEmail").val('{"' + modifiedName + '":"' + modifiedEmail + '"}');
      }
    }
  }

  if (docMode == "read") {
    // Open the document in read-only mode
    $("#" + form_id).find("input, textarea, select, button").attr('disabled', 'disabled');
    $("#" + form_id).find("fieldset.form-control").attr('disabled', 'disabled');
    $(".dz-hidden-input").prop("disabled", true);
    $(".dz-remove").hide();
    $(".save-action").hide();
    $("#savebtn").hide();
    $("#image_uploads").hide();
    $("#doc_uploads").hide();
  } else {
    $(".edit-action").hide();
  }
}
function initForm(data) {
  $(".save-action").off('click').on('click', function () {
    $(".edit-action").hide();
    $("#action").val($(this).attr('id'));
    var form_fv = $('#' + form.cotForm.id).data('formValidation');
    if (auth()) {
      form_fv.validate();
      if (form_fv.isValid()) {
        submitForm();
      }
    } else {
      $("#savebtn").hide();
    }
  });

  $("#savebtn").click(function () {
    $(".edit-action").hide();
    $("#action").val($(this).attr('id'));
    var form_fv = $('#' + form.cotForm.id).data('formValidation');
    if (auth()) {
      form_fv.validate();
      if (form_fv.isValid()) {
        submitForm();
        scroll(0, 0);
      }
    } else {
      $("#savebtn").hide();
      scroll(0, 0);
    }
  });

  $(".edit-action").off('click').on('click', function () {
    $("#" + form_id).find("input, textarea, select, button").attr('disabled', false);
    $(".dz-hidden-input").prop("disabled", false);
    $(".dz-remove").show();
    $(".edit-action").hide();
    $(".save-action").show();
    $("#savebtn").show();
    $("#image_uploads").show();
    $("#doc_uploads").show();
    docMode = "edit";
  });

  $("#printbtn").click(function () { window.print(); });

  $('input[name="PreferredContactName"]').change(function () {
    let checkedVal = $('input[name="PreferredContactName"]:checked').val();
    $('#' + form_id).formValidation('revalidateField', $('#FirstName'));
    $('#' + form_id).formValidation('revalidateField', $('#LastName'));
    $('#' + form_id).formValidation('revalidateField', $('#ArtistAlias'));
    $('#' + form_id).formValidation('revalidateField', $('#Organization'));
  });

  $('input[name="ContactMethod"]').change(function () {
    let checkedVal = $('input[name="PreferredContactName"]:checked').val();
    $('#' + form_id).formValidation('revalidateField', $('#Address'));
    $('#' + form_id).formValidation('revalidateField', $('#City'));
    $('#' + form_id).formValidation('revalidateField', $('#Province'));
    $('#' + form_id).formValidation('revalidateField', $('#PostalCode'));
    $('#' + form_id).formValidation('revalidateField', $('#PrimaryPhone'));
    $('#' + form_id).formValidation('revalidateField', $('#Email'));
  });

  if (data) {
    // HIDE/SHOW FIELDS BASED ON OTHER FIELD VALUES
  } else {
    var dataCreated = new Date();
    $("#recCreated").val(dataCreated);
    $("#lsteStatus").val(config.status.DraftApp);
  }

  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $("#back-to-top").fadeIn();
    } else {
      $("#back-to-top").fadeOut();
    }
  });

  // Scroll to top
  $("#back-to-top").click(function () {
    $("#back-to-top").tooltip('hide');
    $("html, body").animate({
      scrollTop: 0
    }, 'fast');
    return false;
  });

  $("#back-to-top").tooltip('show');
}
function submitForm() {
  //verify user still has a session

  if (auth()) {
    processForm('save', form.cotForm.id, config.default_repo);
  } else {
    scroll(0, 0);
  }
}
function getSubmissionSections() {
  let section = [
    {
      id: "contactSec",
      title: config["Contact Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            {
              id: "FirstName", title: config["First Name"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Full Name") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "LastName", title: config["Last Name"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Full Name") ? true : (value !== ''));
                  }
                }
              }
            }]
        }, {
          fields: [
            {
              id: "ArtistAlias", title: config["Artist Alias"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Artist Alias") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "Organization", title: config["Organization"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="PreferredContactName"]:checked').val();
                    return ((checkVal !== "Business") ? true : (value !== ''));
                  }
                }
              }
            }]
        }, {
          fields: [
            {
              id: "PreferredContactName",
              required: true,
              title: config["Preferred Name"],
              type: "radio", className: "col-xs-12 col-md-6",
              choices: config.preferredName.choices,
              orientation: "horizontal",
              "prehelptext": config["PreferredNameText"]
            }
          ]
        }, {
          fields: [
            { id: "OrganizationDescription", title: config["Artist Bio"], type: "textarea", className: "col-xs-12 col-md-12", htmlAttr: { maxLength: 500 } },
            {
              id: "Address", title: config["Address"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Mail") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "City", title: config["City"], value: "Toronto", className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Mail") ? true : (value !== ''));
                  }
                }
              }
            }]
        }, {
          fields: [
            {
              id: "Province", title: config["Province"], value: "Ontario", className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Mail") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "PostalCode", title: config["Postal Code"], validationtype: "PostalCode", className: "col-xs-12 col-md-6",
            }]
        }, {
          fields: [
            {
              id: "PrimaryPhone", title: config["Primary Phone"], className: "col-xs-12 col-md-6",
              //required: "true",validationtype: "Phone", 
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Phone") ? true : (value !== ''));
                  }
                }
              }
            },
            { id: "OtherPhone", title: config["Other Phone"], validationtype: "Phone", className: "col-xs-12 col-md-6" }]
        }, {
          fields: [
            {
              id: "Email", title: config["Email"], validationtype: "Email", validators: { regexp: { regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message: 'This field must be a valid email. (###@###.####)' } }, className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ContactMethod"]:checked').val();
                    return ((checkVal !== "Email") ? true : (value !== ''));
                  }
                }
              }
            },
            { id: "URL", title: config["URL"], validationtype: "URL", value: "http://", className: "col-xs-12 col-md-6" }
          ]
        }, {
          fields: [
            {
              id: "ContactMethod",
              required: true,
              title: config["preferredMethodTitle"],
              type: "radio",
              choices: config.preferredMethod.choices,
              orientation: "horizontal",
              className: "col-xs-12 col-md-6"
            }
          ]
        }
      ]
    },

    {
      id: "workSec",
      title: config["Work Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { id: "workToPublicText", title: "", type: "html", html: config["WorkToPublicText"], className: "col-xs-12 col-md-12" },
            {
              id: "WorkToPublic",
              required: true,
              orientation: "horizontal",
              title: config["Work To Public"],
              type: "radio",
              value: "",
              choices: config.choices.yesNoFull,
              className: "col-xs-12 col-md-6"
            },
            { id: "Profile", "prehelptext": config["ProfileText"], title: config["Profile"], type: "textarea", className: "col-xs-12 col-md-12" },
            { id: "IntNavail", title: config["Availability"], type: "textarea", className: "col-xs-12 col-md-12" },
            { id: "Exp", title: config["Experience"], type: "textarea", className: "col-xs-12 col-md-12" },
            { id: "WorkHistory", title: config["Work History"], type: "textarea", className: "col-xs-12 col-md-12" }
          ]
        }
      ]
    },
    {
      id: "cvSec",
      title: config["CV Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { "id": "chkCV", "bindTo": "chkCV", "title": config["chkCVAvailable"], "required": true, "type": "radio", "choices": config.choices.yesNoFull, "orientation": "horizontal", "className": "col-xs-12 col-md-6" },
            // { id: "chkCV", title: "", type: "radio", choices: config.chkCVAvailable.choices, orientation: "horizontal", className: "col-xs-12 col-md-12" },
            { id: "CV", title: config["CV"], type: "html", "aria-label": "Dropzone File Upload Control Field for Resume", html: '<section aria-label="File Upload Control Field for Resume" id="document_attachments"> <div class="dropzone" id="document_dropzone" aria-label="Dropzone File Upload Control for Resume Section"></div></section>', className: "col-xs-12 col-md-12" }
          ]
        }]
    },
    {
      id: "imageSec",
      title: config["Images Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { id: "Images", "prehelptext": config["ImagesText"], title: config["Images"], type: "html", "aria-label": "Dropzone File Upload Control Field for Images", html: '<section aria-label="File Upload Control Field for Images" id="image_attachments"> <div class="dropzone" id="image_dropzone" aria-label="Dropzone File Upload Control for Images Section"></div></section>', className: "col-xs-12 col-md-12" },
            { id: "FooterText", title: "", type: "html", html: config["FooterText1"], className: "col-xs-12 col-md-12" },
            { id: "FooterText", title: "", type: "html", html: config["FooterText2"], className: "col-xs-12 col-md-12" },
            { id: "FooterText", title: "", type: "html", html: config["FooterText3"], className: "col-xs-12 col-md-12" },
            {
              id: "chkDeclaration", title: "", type: "radio", choices: config.chkDeclaration.choices, orientation: "horizontal", className: "col-xs-12 col-md-12",
              validators: {
                callback: {
                  message: config["declarationValidation"],
                  callback: function (value, validator, $field) {
                    return $field[0].checked;
                  }
                }
              }
            },
         //   { id: "submitHelp", title: "", type: "html", html: config["SubmitText"], className: "col-xs-12 col-md-12" },
            {
              id: "actionBar",
              type: "html",
              html: `<div className="col-xs-12 col-md-12"><button class="btn btn-success" id="savebtn"><span class="glyphicon glyphicon-send" aria-hidden="true"></span> ` + config.button.submitReport + `</button></div>`
            },
            { id: "successFailRow", type: "html", className: "col-xs-12 col-md-12", html: `<div id="successFailArea" className="col-xs-12 col-md-12"></div>` },
            { id: "fid", type: "html", html: "<input type=\"text\" id=\"fid\" aria-label=\"Document ID\" aria-hidden=\"true\" name=\"fid\">", class: "hidden" },
            { id: "action", type: "html", html: "<input type=\"text\" id=\"action\" aria-label=\"Action\" aria-hidden=\"true\" name=\"action\">", class: "hidden" },
            { id: "createdBy", type: "html", html: "<input type=\"text\" id=\"createdBy\" aria-label=\"Record Created By\" aria-hidden=\"true\" name=\"createdBy\">", class: "hidden" },
            { id: "recCreated", type: "html", html: "<input type=\"text\" id=\"recCreated\" aria-label=\"Record Creation Date\" aria-hidden=\"true\" name=\"recCreated\">", class: "hidden" }]
        }
      ]
    }
  ]
  return section;
}
function getAdminSectionsTop() {
  var section = [{
    id: "adminSec",
    title: config["Admin Section"],
    className: "panel-info",
    rows: [{
      fields: [
        { id: "displayPreferredContactName", type: "html", html: "<input type=\"text\" id=\"displayPreferredContactName\" aria-label=\"Display Preferred Contact Name\" aria-hidden=\"true\" name=\"displayPreferredContactName\">", class: "hidden" },// 
        { id: "displayProfile", type: "html", html: "<input type=\"text\" id=\"displayProfile\" aria-label=\"Display Profile\" aria-hidden=\"true\" name=\"displayProfile\">", class: "hidden" },// 
        {
          "id": "lstStatus",
          "title": config.recStatus.title,
          "required": true,
          "type": "radio",
          "orientation": "horizontal",
          "choices": config.recStatus.choices,
          "class": "col-xs-12 col-md-12"
        }]
    }]
  }];
  return section;
}
function getAdminSectionsBottom() {
  var section = [
    {
      id: "hiddenSec",
      title: "",
      className: "panel-info",
      rows: [{ fields: [] }]
    }
  ]
  return section;
}
function displayPreferred(f_data) {
  switch (f_data.PreferredContactName) {
    case 'Full Name':
      return f_data.FirstName + " " + f_data.LastName;
    case 'Artist Alias':
      return f_data.ArtistAlias;
    case 'Business':
      return f_data.Organization;
    default:
      return '';
  }
}
function checkFileUploads(uploads) {
  let queryString = "";
  let binLoc = "";

  if (uploads.length > 0) {
    $.each(uploads, function (index, item) {
      if (binLoc == "") {
        binLoc = item.bin_id;
      } else {
        binLoc = binLoc + "," + item.bin_id;
      }
    })
  }

  if (binLoc != "") { queryString = "&keepFiles=" + binLoc };

  return queryString;
}
function publishUploads(uploads) {
  if (uploads.length > 0) {
    $.each(uploads, function (index, item) {
      var updateURL = config.api.post + 'binUtils/' + config.default_repo + '/' + item.bin_id + '/' + "publish" + '?sid=' + getCookie(config.default_repo + '.sid');
      $.get(updateURL, function (response) {
        //update attachments with status publish
      }).fail(function () {
        console.log('Failed to publish attachments with this url parameter', updateURL);
      });
    })
  }
}

CotForm.prototype.setData = function (data) {
  // STANDARD FIELD OPERATION
  function standardFieldOp(field, val) {
    if (field.length === 1) { // SINGLE FIELD ELMENT
      if (Array.isArray(val)) { // MULTIPLE VALUE ELEMENT - AKA SELECT
        for (var i = 0, l = val.length; i < l; i++) {
          field.find('[value="' + val[i] + '"]').prop('selected', true);
        }
      } else { // STANDARD TEXT-LIKE FIELD
        if (field.is('[type="checkbox"]') || field.is('[type="radio"]')) { // EXCEPT FOR THIS
          if (field.val() === val) {
            field.prop('checked', true);
          }
        } else {
          field.val(val);
        }
      }
    } else { // MULTIPLE FIELD ELEMENT - GROUP OF CHECKBOXS, RADIO BUTTONS
      if (Array.isArray(val)) {
        for (var i = 0, l = val.length; i < l; i++) {
          field.filter('[value="' + val[i] + '"]').prop('checked', true);
        }
      } else { // SINGLE FIELD ELEMENT - STAND ALONE CHECKBOX, RADIO BUTTON
        field.filter('[value="' + val + '"]').prop('checked', true);
      }
    }
    // PLUGIN REBUILD
    field.filter('.multiselect').multiselect('rebuild');
    field.filter('.daterangevalidation').daterangepicker('update');
  }
  // GO THROUGH DATA
  var form = $('#' + this.cotForm.id);
  for (var k in data) {
    if (k === 'rows') { // GRID FIELDS
      for (var i = 0, l = data[k].length; i < l; i++) {
        if (i > 0) { // ADD ROW IF NEEDED
          var fields = $();
          for (var k2 in data[k][i]) {
            fields = fields.add(form.find('[name="row[0].' + k2 + '"]'));
          }
          fields.closest('tr').find('button.grid-add').trigger('click');
        }

        for (var k2 in data[k][i]) { // ASSIGN VALUES
          standardFieldOp(form.find('[name="row[' + i + '].' + k2 + '"]'), data[k][i][k2]);
        }
      }
    } else { // STANDARD FIELDS
      standardFieldOp(form.find('[name="' + k + '"]'), data[k]);
    }
  }
};

CotForm.prototype.getData = function () {
  var data = {}, blanks = {}, rowIndexMap = {}; // {stringIndex: intIndex}
  $.each($('#' + this.cotForm.id).serializeArray(), function (i, o) {
    if (o.name.indexOf('row[') !== -1) {
      var sRowIndex = o.name.substring(o.name.indexOf('[') + 1, o.name.indexOf(']'));
      if (sRowIndex !== 'template') {
        var rows = data['rows'] || [];
        var iRowIndex = rowIndexMap[sRowIndex];
        if (iRowIndex === undefined) {
          rows.push({});
          iRowIndex = rows.length - 1;
          rowIndexMap[sRowIndex] = iRowIndex;
        }
        rows[iRowIndex][o.name.split('.')[1]] = o.value;
        data['rows'] = rows;
      }
    } else {
      if (data.hasOwnProperty(o.name)) {
        data[o.name] = $.makeArray(data[o.name]);
        data[o.name].push(o.value);
      } else {
        data[o.name] = o.value;
      }
    }
  });

  var _blanks = $('#' + this.cotForm.id + ' [name]')
  $.each(_blanks, function () {
    if (!data.hasOwnProperty(this.name)) {
      blanks[this.name] = '';
    }
  });
  return $.extend(data, blanks);
};

CotSession.prototype.expireIn = function (minutes) {
  //set how long the current session cookies should last before expiring, in minutes
  //returns true if the session cookie expiry times were updated, false if not (because there is no session data)
  //NOTE: not entirely sure what should happen if the current session cookies are expired...
  if (this.sid) {
    this._storeLogin({
      passwordExpiryDate: (new Date()).getTime() + (minutes * 60 * 1000),
      sid: this.sid,
      userID: this.username || '',
      email: this.email || '',
      cotUser: {
        firstName: this.firstName || '',
        lastName: this.lastName || '',
        division: this.division || '',
        groupMemberships: this.groups || ''
      }
    });
    return true;
  }
  return false;
};

