/**
 * Created by okuscu on 06/15/2017
 */
let imageDropzone = void 0;
let docDropzone = void 0;
let form;
let cookie_SID = 'graffiti_exemption.sid';
let cookie_modifiedUsername = 'graffiti_exemption.cot_uname';
let cookie_modifiedFirstName = 'graffiti_exemption.firstName';
let cookie_modifiedLastName = 'graffiti_exemption.lastName';
let cookie_modifiedEmail = 'graffiti_exemption.email';

//let sessionStatus = false;

function checkFileUploads(payload) {
  let queryString = "";
  let binLoc = "";
  if (payload.image_uploads[0]) {
    $.each(payload.image_uploads, function (index, item) {
      if (binLoc == "") {
        binLoc = item.bin_id;
      } else {
        binLoc = binLoc + "," + item.bin_id;
      }
    })
    queryString = "&KeepFiles=" + binLoc;
  }

  if (payload.doc_uploads[0]) {
    $.each(payload.doc_uploads, function (index, item) {
      if (binLoc == "") {
        binLoc = item.bin_id;
      } else {
        binLoc = binLoc + "," + item.bin_id;
      }
    })
  }

  if (binLoc != "") {
    queryString = "&KeepFiles=" + binLoc;
  }

  return queryString;
}
function saveReport(action, payload, msg, form_id, repo) {
  // $(".btn").prop('disabled', true);

  let keepQueryString = checkFileUploads(payload);

  $.ajax({
    url: config.httpHost.app[httpHost] + config.api.post + repo + '?sid=' + getCookie(cookie_SID) + keepQueryString,
    type: 'POST',
    data: JSON.stringify(payload),
    //   data: payload,
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
          emailNotice(data.EventMessageResponse.Event.EventID, action, ['captain']);
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
  //  $(".btn").prop('disabled', true);

  let keepQueryString = checkFileUploads(formData);

  $.ajax({
    url: config.httpHost.app[httpHost] + config.api.put + repo + '/' + fid + '?sid=' + getCookie(cookie_SID) + keepQueryString,
    type: 'POST',
    data: payload,
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    dataType: 'json'
  }).done(function (data) {
    switch (action) {
      case 'save':
        hasher.setHash(fid + '?alert=success&msg=' + msg.done + '&ts=' + new Date().getTime());
        break;
      case 'updateAttachments':
        break;
      case 'notify':
        // Email report notice to emergency management captain and incident manager/reporters
        //emailNotice(fid, action, ['captain']);
        break;

      case 'submit':
      case 'approve':
      case 'reject':
        // Email report notice to administrator, emergency management captain and incident manager/reporters
        //emailNotice(fid, action, ['administrator', 'captain']);
        hasher.setHash(fid + '?alert=success&msg=' + msg.done + '&ts=' + new Date().getTime());
        break;

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
function emailNotice(fid, action, recipients) {
  let emailTo;
  if ($("#modifiedEmail").val()) {
    emailTo = JSON.parse($("#modifiedEmail").val());
  } else {
    emailTo = {};
  }
  let emailAdmin = config.administrator['G'];
  let emailCaptain = config.captain['G'];

  if (recipients && recipients.indexOf('administrator') !== -1) {
    $.extend(emailTo, emailAdmin);
  }
  if (recipients && recipients.indexOf('captain') !== -1) {
    $.extend(emailTo, emailCaptain);
  }

  let emailRecipients = $.map(emailTo, function (email) {
    return email;
  }).filter(function (itm, i, a) {
    return i === a.indexOf(itm);
  }).join(',');

  let payload = JSON.stringify({
    'email': emailRecipients,
    'id': fid,
    'status': action,
    'home': 'G'
  });

  $.ajax({
    url: config.httpHost.app[httpHost] + config.api.email,
    type: 'POST',
    data: payload,
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    dataType: 'json'
  }).done(function () {

    if (action === 'notify') {
      hasher.setHash(fid + '?alert=success&msg=notify.done&ts=' + new Date().getTime());
    }
  }).fail(function (textStatus, error) {
    alert("POST Request Failed: " + textStatus + ", " + error);

    if (action === 'notify') {
      hasher.setHash(fid + '?alert=danger&msg=notify.fail&ts=' + new Date().getTime());
    }
  });
}
function processForm(action, form_id, repo) {
  let fid = $("#fid").val();
  let msg, payload;
  //  let f_data = getFormJSON(form_id);
  let f_data = form.getData();

  f_data.image_uploads = processUploads(imageDropzone, repo, true);
  f_data.doc_uploads = processUploads(docDropzone, repo, true);

  switch (action) {
    case 'save':
      msg = {
        'done': 'save.done',
        'fail': 'save.fail'
      };
      var complainStatusVal = $("#complaintStatus").val();
      var jsonStatusVal = "";

      /*
       'DraftHRC': 'New',
       'SubmittedHRC': 'Ongoing',
       'ApprovedHRC': 'Closed',
       'DeletedHRC': 'Deleted'
       */
      switch ($("#complaintStatus").val()) {
        case config.status.DraftHRC:
          jsonStatusVal = config.status.Draft;
          break;
        case config.status.ApprovedHRC:
          jsonStatusVal = config.status.Approved;
          break;
        case config.status.SubmittedHRC:
          jsonStatusVal = config.status.Submitted;
          break;
        default:
          jsonStatusVal = config.status.Draft;
      }

      payload = JSON.stringify({
        'payload': JSON.stringify(f_data),
        'status': jsonStatusVal
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
      break;
    case 'notify':
    case 'updateAttachments':
      msg = {
        'done': 'save.done',
        'fail': 'save.fail'
      };
      // Update report and notify emergency management captain for status 'notify'
      if (fid) {
        payload = JSON.stringify({
          'payload': JSON.stringify(f_data)
        });
        updateReport(fid, action, payload, msg, repo, f_data);
      }
      // Create new report and notify emergency management captain for status 'notify'
      else {
        //  payload = JSON.stringify(f_data);
        payload = f_data;
        saveReport(action, payload, msg, form_id, repo);
      }
      break;

    case 'submit':
      msg = {
        'done': 'submit.done',
        'fail': 'submit.fail'
      };

      // Update report and move to Submitted state
      if (fid) {

        var complainStatusVal = $("#complaintStatus").val();
        var jsonStatusVal = "";

        /*
         'DraftHRC': 'New',
         'SubmittedHRC': 'Ongoing',
         'ApprovedHRC': 'Closed',
         'DeletedHRC': 'Deleted'
         */
        switch ($("#complaintStatus").val()) {
          case config.status.DraftHRC:
            jsonStatusVal = config.status.Draft;
            break;
          case config.status.ApprovedHRC:
            jsonStatusVal = config.status.Approved;
            break;
          case config.status.SubmittedHRC:
            jsonStatusVal = config.status.Submitted;
            break;
          default:
            jsonStatusVal = config.status.Draft;
        }

        payload = JSON.stringify({
          'payload': JSON.stringify(f_data),
          'status': jsonStatusVal
        });

        updateReport(fid, action, payload, msg, repo, f_data);
      }
      // Create new report and move to Submitted state
      else {
        //  payload = JSON.stringify(f_data);
        payload = f_data;
        saveReport(action, payload, msg, form_id, repo);
      }
      break;
    case 'approve':
      msg = {
        'done': 'approve.done',
        'fail': 'approve.fail'
      };
      // Update report and move to Approved state
      if (fid) {
        payload = JSON.stringify({
          'payload': JSON.stringify(f_data),
          'status': config.status.Approved
        });
        updateReport(fid, action, payload, msg, repo, f_data);
      }
      break;
    case 'reject':
      msg = {
        'done': 'reject.done',
        'fail': 'reject.fail'
      };
      // Update report and move back to Draft (Yes) state
      if (fid) {
        payload = JSON.stringify({
          'payload': JSON.stringify(f_data),
          'status': config.status.Draft
        });
        updateReport(fid, action, payload, msg, repo, f_data);
      }
      break;
    default:
      break;
  }
}
function loadForm(destinationSelector, data, fid, status, form_id, repo, allJSON, docMode) {
  let adminForm = true;
  let showAdminHeader = true;
  let showContactSections = false;
  let showAttachmentSection = false;
  let debugMode = false;

  //$(destinationSelector).empty();
  //  let sections = $.merge($.merge(getAdminSectionsTop(), getSubmissionSections()), getAdminSectionsBottom());
  let sections = $.merge(getAdminSectionsTop(), getSubmissionSections(), getAdminSectionsBottom());

  //  form = new CotForm({
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

  //getSessionStorage(data);

  initForm(data);
  // imageDropzone = new Dropzone("div#" + upload_selector, setupDropzone({ fid: fid, form_id: form_id, url: config.api.upload + config.default_repo + '/' + repo }));

  imageDropzone = new Dropzone("div#image_dropzone", $.extend(config.admin.imageDropzone, {
    "dz_id": "admin_dropzone", "fid": fid, "form_id": form_id,
    "url": config.api.upload + config.default_repo + '/' + repo,
  }));
  //"dz_id": "admin_dropzone", "fid": fid, "form_id": form_id,
  docDropzone = new Dropzone("div#document_dropzone", $.extend(config.admin.docDropzone, {
    "dz_id": "staff_dropzone", "fid": fid, "form_id": form_id,
    "url": config.api.upload + config.default_repo + '/' + repo,
  }));

  $(".dz-hidden-input").attr("aria-hidden", "true");
  $(".dz-hidden-input").attr("aria-label", "File Upload Control");

  // Set datetime picker for Date of Action field
  $(".datetimepicker.wir\\[0\\]\\[dateAction\\]").datetimepicker({ "format": "DD/MM/YYYY" });

  let modifiedUsername = decodeURIComponent(getCookie(cookie_modifiedUsername));
  let modifiedName = decodeURIComponent(getCookie(cookie_modifiedFirstName)) + ' ' + decodeURIComponent(getCookie(cookie_modifiedLastName));
  let modifiedEmail = decodeURIComponent(getCookie(cookie_modifiedEmail));

  // New report
  if (!data) {
    // Set created by and modified by to current user
    $("#createdBy, #modifiedBy").val(modifiedUsername);
    var dataCreated = new Date();


    var dataCreated = new Date();
    // dataCreatedFormatted = moment(dataCreated).format(config.dateTimeFormat);
    // $("#complaintCreated").val(dataCreatedFormatted);

    $("#recCreated").val(dataCreated);
    $("#lsteStatus").val("New");

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
    $(".dz-hidden-input").prop("disabled", true);
    $(".dz-remove").hide();
    $(".save-action").hide();
    $("#savebtn").hide();
  } else {
    $(".edit-action").hide();
  }

  // New or existing Draft report
  if (status === config.status.Draft || !status) {
    // Remove Approve and Reject buttons
    $("#approveReportElement, #rejectReportElement").remove();
  }
  // Submitted or Approved report
  else if (status === config.status.Submitted || status === config.status.Approved) {

    // Disable all fields and remove submission buttons if not administator
    if ($.inArray(config.groups.graffiti_exemption_admin, groupMemberships) === -1) {
      /// //    $("#" + form_id).find("input, textarea, select, button").attr('disabled', 'disabled');
      $("#saveSubmit").remove();
    } else {
      $(".btn-save").html($(".btn-save").html().replace(config.button.saveReport, config.button.save));
      $("#notifyReportElement, #submitReportElement").remove();
    }
  }
}

function initForm(data) {

  // we need to call off click first to overcome multiple POST requests with event registration
  //$(".save-action").click(function () {
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

  $(".edit-action").off('click').on('click', function () {
    $("#" + form_id).find("input, textarea, select, button").attr('disabled', false);
    $(".dz-hidden-input").prop("disabled", false);
    $(".dz-remove").show();
    $(".edit-action").hide();
    $(".save-action").show();
    $("#savebtn").show();
    docMode = "";
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

  $('#eNotice').on('change', function () {
    //  if(this.value == config.status.ApprovedHRC){
    $('#' + form_id).formValidation('revalidateField', $('#ComplianceDate'));
    //  }
  });

  $('#eMaintenance').on('change', function () {
    //  if(this.value == config.status.ApprovedHRC){
    $('#' + form_id).formValidation('revalidateField', $('#eMaintenanceAgreement'));
    //  }
  });

  if (data) {
    // HIDE/SHOW FIELDS BASED ON OTHER FIELD VALUES
  } else {

    var dataCreated = new Date();
    dataCreated = moment(dataCreated).format(config.dateTimeFormat);
    $("#recCreated").val(dataCreated);

    $("#lsteStatus").val("New");
  }

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
      title: app.data["Contact Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            //"required": true,
            { "id": "eFirstName", "title": app.data["First Name"], "required": true, "className": "col-xs-12 col-md-6" },
            { "id": "eLastName", "title": app.data["Last Name"], "required": true, "className": "col-xs-12 col-md-6" },
            { "id": "eAddress", "title": app.data["Address"], "required": true, "className": "col-xs-12 col-md-6" },
            { "id": "eCity", "title": app.data["City"], "value": "Toronto", "className": "col-xs-12 col-md-6" }
          ]
        }, {
          fields: [{ "id": "ePostalCode", "title": app.data["Postal Code"], "className": "col-xs-12 col-md-6" },
          {
            "id": "ePrimaryPhone", "title": app.data["Phone"],
            //  "required": true,
            "validationtype": "Phone", "className": "col-xs-12 col-md-6"
          },
          { "id": "eFax", "title": app.data["Fax"], "validationtype": "Phone", "className": "col-xs-12 col-md-6" },
          { "id": "eEmail", "title": app.data["Email"], "validationtype": "Email", "validators": { regexp: { regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message: 'This field must be a valid email. (###@###.####)' } }, "className": "col-xs-12 col-md-6" }
          ]
        }
      ]
    },
    {
      id: "graffitiSec",
      title: app.data["Graffiti Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            {
              "id": "sameAsAbove",
              "title": "",
              "type": "",
              "choices": config.sameAsAbove.choices,
              "class": "col-xs-12 col-md-12",
              "value": "Same As Above",
              "aria-label": "Click here to set same address values for graffiti location"
            },
            { "id": "emAddress", "title": app.data["Graffiti Address"], "required": true, "className": "col-xs-12 col-md-6" },
            { "id": "emCity", "title": app.data["Graffiti City"], "className": "col-xs-12 col-md-6" }
          ]
        },
        {
          fields: [
            { "id": "emPostalCode", "title": app.data["Graffiti Postal Code"], "className": "col-xs-12 col-md-6" },
            {
              "id": "emFacingStreet", "title": app.data["Facing Street"],
              //  "required": true,
              "className": "col-xs-12 col-md-6"
            },
            { "id": "emFacingStreet", "title": app.data["Facing Street"], "className": "col-xs-12 col-md-6" },
            { "id": "emDescriptiveLocation", "prehelptext": app.data["DescriptiveLocationText"], "title": app.data["graffitiDesLocation"], "required": true, "type": "textarea", "className": "col-xs-12 col-md-12" }
          ]
        }
      ]
    },
    {
      id: "detailsSec",
      title: app.data["Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            {
              "id": "ePermission",
              "title": app.data["permission"],
              //    "required": true,
              "type": "radio",
              "className": "col-xs-12 col-md-12",
              "choices": config.choices.yesNoFull,
              "orientation": "horizontal"
            },
            {
              "id": "eNotice",
              "title": app.data["notice"],
              //  "required": true,
              //  "type": "radio",
              "type": "dropdown",
              "value": "No",
              "className": "col-xs-12 col-md-12",
              "choices": config.choices.yesNoFull,
              "orientation": "horizontal"
            }
            ,
            {
              "id": "ComplianceDate",
              "title": app.data["compliance"],
              //    "required": true,
              "type": "datetimepicker",
              "placeholder": config.dateFormat,
              "className": "col-xs-12 col-md-6",
              "options": { format: config.dateFormat },
              "validators": {
                callback: {
                  message: app.data["compliance"] + ' is required',
                  // this is added to formValidation
                  callback: function (value, validator, $field) {
                    var checkVal = $("#eNotice").val();
                    return (checkVal !== "Yes") ? true : (value !== '');
                  }
                }
              }
            },
            {
              "id": "eMaintenance",
              "title": app.data["maintenance"],
              //  "required": true,
              //  "type": "radio",
              "type": "dropdown",
              "value": "No",
              "className": "col-xs-12 col-md-12",
              "choices": config.choices.yesNoFull,
              "orientation": "horizontal"
            },
            {
              "id": "eMaintenanceAgreement", "title": app.data["agreementDetails"],
              //  "required": true,
              "className": "col-xs-12 col-md-12",
              "validators": {
                callback: {
                  message: app.data["agreementDetails"] + ' is required',
                  // this is added to formValidation
                  callback: function (value, validator, $field) {
                    var checkVal = $("#eMaintenance").val();
                    return (checkVal !== "Yes") ? true : (value !== '');
                  }
                }
              }
            },
            {
              "id": "eArtistInfo", "title": app.data["artistDetails"],
              //  "required": true,
              "className": "col-xs-12 col-md-12"
            },
            {
              "id": "eArtSurfaceEnhance", "title": app.data["enhance"],
              //  "required": true,
              "className": "col-xs-12 col-md-12"
            },
            {
              "id": "eArtLocalCharacter", "title": app.data["adhere"],
              "required": true,
              "className": "col-xs-12 col-md-12"
            },
            { "id": "eAdditionalComments", "title": app.data["comments"], "className": "col-xs-12 col-md-12" },
          ]
        }]
    },
    {
      id: "attSec",
      title: app.data["Attachment Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { "id": "AttachmentText", "title": "", "type": "html", "html": app.data["AttachmentText"], "className": "col-xs-12 col-md-12" },
            { "id": "Images", "prehelptext": app.data["ImagesText"], "title": app.data["Images"], "type": "html", "aria-label": "Dropzone File Upload Control Field for Images", "html": '<section aria-label="File Upload Control Field for Images" id="attachment"> <div class="dropzone" id="image_dropzone" aria-label="Dropzone File Upload Control for Images Section"></div></section>', "className": "col-xs-12 col-md-12" },
            { "id": "Documents", "prehelptext": app.data["DocumentsText"], "title": app.data["Documents"], "type": "html", "aria-label": "Dropzone File Upload Control Field for Documents", "html": '<section aria-label="File Upload Control Field for Documents" id="attachment"> <div class="dropzone" id="document_dropzone" aria-label="Dropzone File Upload Control for Document Section"></div></section>', "className": "col-xs-12 col-md-12" },
            { "id": "DeclarationText", "title": "", "type": "html", "html": app.data["DeclarationText"], "className": "col-xs-12 col-md-12" },
            {
              id: "actionBar",
              type: "html",
              html: `<div className="col-xs-12 col-md-12"> <button class="btn btn-success" id="closebtn"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span>Close</button> <button class="btn btn-success" id="savebtn"><span class="glyphicon glyphicon-send" aria-hidden="true"></span> ` + config.button.submitReport + `</button>
                 </div>`
              //<button class="btn btn-success" id="printbtn"><span class="glyphicon glyphicon-print" aria-hidden="true"></span>Print</button>
              //
            },
            {
              id: "successFailRow",
              type: "html",
              className: "col-xs-12 col-md-12",
              html: `<div id="successFailArea" className="col-xs-12 col-md-12"></div>`
            },
          ]
        }
      ]
    }
  ]
  return section;
}
function getAdminSectionsTop() {
  var section = [{
    rows: [{
      fields: [
        {
          "id": "lsteStatus",
          "title": config.recStatus.title,
          "type": "dropdown",
          "choices": config.recStatus.choices,
          "class": "col-xs-12 col-md-6"
        },
        { "id": "AddressGeoID", "title": app.data["Address Geo ID"], "className": "col-xs-12 col-md-6" },
        { "id": "MapAddress", "title": app.data["Map Address"], "className": "col-xs-12 col-md-6" },
        { "id": "ShowMap", "title": app.data["ShowMap"], "className": "col-xs-12 col-md-6" }

      ]
    }]
  }];
  return section;
}
function getAdminSectionsBottom() {
  let section = [
    {
      id: "hiddenSec",
      title: "",
      className: "panel-info",
      rows: [
        {
          fields: [
            {
              "id": "fid",
              "type": "html",
              "html": "<input type=\"text\" id=\"fid\" aria-label=\"Document ID\" aria-hidden=\"true\" name=\"fid\">",
              "class": "hidden"
            }, {
              "id": "action",
              "type": "html",
              "html": "<input type=\"text\" id=\"action\" aria-label=\"Action\" aria-hidden=\"true\" name=\"action\">",
              "class": "hidden"
            }, {
              "id": "createdBy",
              "type": "html",
              "html": "<input type=\"text\" id=\"createdBy\" aria-label=\"Complaint Created By\" aria-hidden=\"true\" name=\"createdBy\">",
              "class": "hidden"
            }, {
              "id": "recCreated",
              "type": "html",
              "html": "<input type=\"text\" id=\"recCreated\" aria-label=\"Record Creation Date\" aria-hidden=\"true\" name=\"recCreated\">",
              "class": "hidden"
            }]
        }
      ]
    }
  ]
  return section;
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



