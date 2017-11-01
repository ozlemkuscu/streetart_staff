//const configURLC2 = "//www1.toronto.ca/static_files/WebApps/CommonComponents/streetart/JSONFeed.js"; //opentext link
const configURLC2 = "https://contrib0.wp.intra.dev-toronto.ca/app_content/streetart_staff_config/"; //wordpress link
const configURLC3 = "https://was-intra-sit.toronto.ca/c3api_config/v2/ConfigService.svc/ConfigSet('streetart/JSONFeed.js')/ConfigContent"; //c3api link
let form_id = "streetart";

const app = new cot_app("StreetARToronto Artist Directory", {
  hasFooter: true,
  hasContentBottom: true,
  hasContentRight: true,
  hasContentLeft: true,
  hasContentTop: true,
  hasLeftNav: false,
  searchcontext: 'INTRA'
});
let httpHost;
let oLogin;
let groupMemberships = [];
let tab = "Yes";

let config = void 0;
let artistData;

$(document).ready(function () {
  loadVariables();
});
function loadVariables() {
  // Loads the config parameters from the defined config URL file  
  $.ajax({
    url: configURLC2, //'/scripts/JSONFeed.json'
    type: "GET",
    cache: "true",
    dataType: "jsonp",
    jsonpCallback: "callback",
    success: function (data) {
      config = data;
      renderApp();
    },
    error: function () {
      console.log(configURLC2 + " failed. Trying alternative URL for configuration : " + configURLC3);
      $.ajax({
        url: configURLC3,
        type: "GET",
        cache: "true",
        dataType: "jsonp",
        jsonpCallback: "callback",
        success: function (data) {
          config = data;
          renderApp();
        },
        error: function () {
          alert("Error: The application was unable to load data. Please contact system administrator.");
        }
      })
    }
  })
}
function renderApp() {
  //ADD ALL THE LINKS YOU WANT TO THE APPLICATION BREADCRUMB
  httpHost = detectHost();
  app.setBreadcrumb(config["breadcrumbtrail"]);
  //INCLUDE ANY NECCESSARY JS/CSS LIBRARIES
  //FORMS TYPICALLY USE AT LEAST THE FOLLOWING 3 LIBRARIES
  app.includeLogin = app.includeDatePicker = app.includeRangePicker = app.includeFormValidation = app.includePlaceholders = app.includeMultiSelect = true;
  app.searchContext = "INTRA";
  //RENDER THE FINISHED PAGE AND THEN CALL A CALLBACK FUNCTION WHEN COMPLETE
  app.render(init);
}
function detectHost() {
  switch (window.location.origin) {
    case config.httpHost.root.dev:
      return 'dev';
    case config.httpHost.root.qa:
      return 'qa';
    case config.httpHost.root.prod:
      return 'prod';
    default:
      //  console.log("Cannot find the server parameter in detectHost function. Please check with your administrator.");
      return 'dev';
  }
}
function auth() {
  // Page authorization based on user cookie and group permissions

  if (!oLogin.isLoggedIn()) {
    //  console.log("user not logged in");
    $("#app-content-top").empty().html(config.auth.login);
    //  $("#view_pane").empty();
    //  $("#app-content-right").show();
    scroll(0, 0);
    oLogin.showLogin();
    return false;
  } else if (groupMemberships.length < 1) {
    $("#app-content-top").empty().html(config.auth.group);
    $("#view_pane").empty();
    $("#app-content-right").show();
    scroll(0, 0);
    return false;
  } else {

    if (oLogin.sid) {
      // check if the session is still active
      var sessionCheckValid;
      sessionCheck(function (textStatus, data) {
        // success
        $("#app-content-right").hide();

        // This code is for extending cookie Expiry Time as long as the user interacts with server
        try {
          oLogin.session.expireIn(config.api.timeout);
        } catch (err) {
          // do nothing, just continue the code block
        }

        sessionCheckValid = true;
      }, function (textStatus, errorThrown) {
        // failure
        $("#app-content-top").empty().html(config.auth.login);
        $("#view_pane").empty();
        $("#app-content-right").show();
        scroll(0, 0);
        sessionCheckValid = false;
      })
      return sessionCheckValid;
    } else {
      $("#app-content-top").empty().html(config.auth.login);
      $("#view_pane").empty();
      $("#app-content-right").show();
      scroll(0, 0);
      return false;
    }
  }
}
function sessionCheck(success, failed) {
  ///  console.log("sessionCheck");
  // to check if the session is still active
  $.ajax({
    url: config.httpHost.app[httpHost] + config.api.session + getCookie(cookie_SID),
    dataType: 'json',
    async: false,
    error: function (jqXHR, textStatus, errorThrown) {
      failed(textStatus, errorThrown);
    },
    method: 'GET',
    success: function (data, textStatus) { //, jqXHR) {
      if (data.error) { // if (data.error == 'no_such_session')
        failed('Error', data.error);
      } else {
        success(textStatus, data);
      }
    }
  }
  )
}
// Render mustache.js template
function tpl(id, mst, callback) {
  $.get(mst, function (template) {
    let rendered = Mustache.render(template, $.extend(config, cot_login_app));
    $(id).empty().html(rendered);
    callback();
  }).fail(function () {
    $(id).empty();
    console.log('Failed to load template:  ' + mst);
  });
}
function listSubmissions(status, filter, repo, target) {
  //verify user still has a session
  if (auth()) {
    app.setContent({ bottom: '<div class="row"><div class="col-xs-12"><div id="view_pane" class="">viewPane</div></div></div>' });

    //Update View Title

    let viewParam = "";
    let viewParam2 = "";
    if (status == "All") {
      viewParam = config.status[status];
    } else if (status == "Search") {
      viewParam = "Result";
    } else {//if (status == "Yes" || status == "Submitted" || status == "Approved") {
      viewParam = getViewtitle(status);
    }

    $("#viewtitle").html(viewParam + " Submissions " + viewParam2);

    if (status == "Live") {
      status = "APR";
    }

    // build retrieve parameters
    let json = {};
    json.repo = repo;
    json.status = status == "Search" ? "" : (status == "All" ? "" : status);
    //  json.filter = filter;
    json.filter = (status == "All" ? "status~(Yes)|(APR)|(Approved)|(Rejected)|(Live)|(Invalid)|(Archived)|(Pending)" : filter);
    let args = "";
    //initialize new cc_retrieve_view (pass in constructor)
    // build cc_retrieve_view constructor
    args = {
      url: config.httpHost.app[httpHost] + config.api.get + repo + '/?json=' + JSON.stringify(json) + '&sid=' + getCookie(cookie_SID),
      target: $("#" + target),
      addScroll: true,
      addFilter: true,
      defaultSortOrder: "des",
      addFooter: true,
      dateFormat: config.dateFormatView,
      columnDefs: [
        { "targets": 0, data: null, defaultContent: '', title: '<span class="sr-only">' + config["View_Edit"] + '</span>', "defaultContent": `<a class="btn-default btn-view-edit-report"><span title="View/Edit" class="glyphicon glyphicon-pencil"></span></a>` },
        //{ "targets": 1, data: null, defaultContent: '', title: '<span class="sr-only">' + "Delete" + '</span>', "defaultContent": `<glyphicon glyphicon-remove class="btn btn-danger btn-remove-report"><span title="DElete" class="glyphicon glyphicon-remove"></span></a>` },
        {
          "targets": 1, defaultContent: '', title: config["Submission Date Column"], type: 'date',
          data: function (row, type, val, meta) {
            if (row.recCreated !== "") {
              return moment(new Date(row.recCreated)).format(config.dateTimeFormat);
            }
            return moment(row.created).format(config.dateTimeFormat);
          }
        },
        { "targets": 2, data: function (row, type, val, meta) { return (row.FirstName + " " + row.LastName); }, defaultContent: '', title: config["Name"] },
        { "targets": 3, data: 'Address', "title": config["AddressColumn"], defaultContent: '', sortOrder: "des" },
        { "targets": 4, data: 'City', "title": config["City"], defaultContent: '', sortOrder: "des" },
        { "targets": 5, data: 'lstStatus', "title": config.recStatus.title, defaultContent: '', sortOrder: "des" },
        { "targets": 6, data: 'Province', "title": config["Province"], defaultContent: '', sortOrder: "des" },
        { "targets": 7, data: 'PostalCode', "title": config["Postal Code"], defaultContent: '', sortOrder: "des" },
        { "targets": 8, data: 'PrimaryPhone', "title": config["Primary Phone"], defaultContent: '', sortOrder: "des" },
        { "targets": 9, data: 'OtherPhone', "title": config["Other Phone"], defaultContent: '', sortOrder: "des" },
        { "targets": 10, data: 'Email', title: config["Email"], defaultContent: '', sortOrder: "des" },
        { "targets": 11, data: 'ContactMethod', "title": config["preferredMethodColumn"], defaultContent: '', sortOrder: "des" },
      ]
    }

    var myDataTable = new cc_retrieve_view(args);

    //render cc_retrieve_view
    myDataTable.render();
    $('.dataTables_filter').hide();
    $("#admin_search").on("keyup search input paste cut", function () {
      myDataTable.dt.search(this.value).draw();
    });

    var originalIncrease = window.increaseFontSize;
    window.increaseFontSize = function () {
      originalIncrease();
      myDataTable.dt.draw();
    }

    var originalDecrease = window.decreaseFontSize;
    window.decreaseFontSize = function () {
      originalDecrease();
      myDataTable.dt.draw();
    }

    $('ul.dropdown-menu > li').removeClass('active');
    $('#tabExportCSV').click(function () { $(".dt-button.buttons-csv.buttons-html5").click(); });
    $('#tabExportEXCEL').click(function () { $(".dt-button.buttons-excel.buttons-html5").click(); });
    $('#tabExportPDF').click(function () { $(".dt-button.buttons-pdf.buttons-html5").click(); });
    $('#tabExportCOPY').click(function () { $(".dt-button.buttons-copy.buttons-html5").click(); });
  }
}
function deleteReport(fid, payload, modal, repo) {
  $(".btn").prop('disabled', true);

  $.ajax({
    url: config.httpHost.app[httpHost] + config.api.delete + repo + '/' + fid,
    type: 'GET',
    data: {
      'json': payload,
      'sid': getCookie(cookie_SID)
    },
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    dataType: 'json'
  }).done(function () {
    hasher.setHash('?alert=success&msg=delete.done&status=' + tab + '&ts=' + new Date().getTime());
  }).fail(function () {
    hasher.setHash('?alert=danger&msg=delete.fail&status=' + tab + '&ts=' + new Date().getTime());
  }).always(function () {
    //  modal.modal('hide');
    // $(".btn").removeAttr('disabled').removeClass('disabled');
  });
}
function homePage() {
  let lastView = $.cookie(encodeURIComponent(config.default_repo) + '.lastHash');
  hasher.setHash((lastView ? lastView : 'All' + '?ts=' + new Date().getTime() + '&status='));
}
function frontPage(query, repo) {
  if (auth()) {
    if (query && query.alert && query.msg) {
      config.messages.current = eval('config.messages.' + query.msg);
    } else {
      config.messages.current = '';
    }

    // Initial application load
    tpl('#app-content-top', 'html/submissions.html', function () {

      if (query && query.alert && query.msg) {
        if (query.alert === 'success') {
          $("#submissions > .alert-success").removeClass('hidden').fadeOut(config.messages.fadeOutTime, function () {
            $(this).addClass('hidden');
            config.messages.current = '';
          });
        } else if (query.alert === 'danger') {
          $("#submissions > .alert-danger").removeClass('hidden').fadeOut(config.messages.fadeOutTime, function () {
            $(this).addClass('hidden');
            config.messages.current = '';
          });
        }
      }

      /* List submissions */
      let tab = (query && query.status) ? query.status : (query ? (query.status == "" ? "Search" : config.status.Draft) : config.status.Draft);
      let _repo = repo ? repo : config.default_repo;
      var search = query && query.search ? query.search : '';

      $('ul.dropdown-menu > li').removeClass('active');
      $('[data-id="' + tab + '"]').parent().addClass('active');

      listSubmissions(tab, search, _repo, 'view_pane');
    });
  }
}
function newPage(query) {
  if (auth()) {
    if (query && query.alert && query.msg) {
      config.messages.current = eval('config.messages.' + query.msg);
    } else {
      config.messages.current = '';
    }

    tpl('#app-content-top', 'html/viewedit.html', function () {
      if (query && query.alert && query.msg) {
        if (query.alert === 'success') {
          $("#new-content > .alert-success").removeClass('hidden').fadeOut(config.messages.fadeOutTime, function () {
            $(this).addClass('hidden');
            config.messages.current = '';
          });
        } else if (query.alert === 'danger') {
          $("#new-content > .alert-danger").removeClass('hidden').fadeOut(config.messages.fadeOutTime, function () {
            $(this).addClass('hidden');
            config.messages.current = '';
          });
        }
      }
      //  $("#viewtitle").html('Submission' + config.timeOutMsg);
      loadForm("#new-form", null, null, null, form_id, config.default_repo);
    });
  }
}
function getViewtitle(statusVal) {
  var viewtitleVal = "";
  /*
         'DraftApp': 'New',
         'SubmittedApp': 'Pending',
         'ApprovedApp': 'Approved',
         'DeniedApp': 'Denied',
         'InvalidApp': 'Invalid Requests'
         */
  switch (statusVal) {
    case config.status.Draft:
      viewtitleVal = config.status.DraftApp;
      break;
    case config.status.Pending:
      viewtitleVal = config.status.SubmittedApp;
      break;
    case config.status.Approved:
      viewtitleVal = config.status.ApprovedApp;
      break;
    case config.status.Rejected:
      viewtitleVal = config.status.RejectedApp;
      break;
    case config.status.Live || config.status.LiveApp:
      viewtitleVal = config.status.LiveApp;
      break;
    case config.status.Archived:
      viewtitleVal = config.status.ArchivedApp;
      break;
    case config.status.Invalid:
      viewtitleVal = config.status.InvalidTitle;
      break;
    default:
  }

  return viewtitleVal;
}
function viewEditPage(id, query) {
  let repo = query.repo ? query.repo : config.default_repo;
  let docMode = query.mode ? query.mode : "";

  if (auth()) {
    if (query && query.alert && query.msg) {
      config.messages.current = eval('config.messages.' + query.msg);
    } else {
      config.messages.current = '';
    }

    tpl('#app-content-top', 'html/viewedit.html', function () {
      if (query && query.alert && query.msg) {
        if (query.alert === 'success') {
          $("#viewedit-content > .alert-success").removeClass('hidden').fadeOut(config.messages.fadeOutTime, function () {
            $(this).addClass('hidden');
            config.messages.current = '';
          });
        } else if (query.alert === 'danger') {
          $("#viewedit-content > .alert-danger").removeClass('hidden').fadeOut(config.messages.fadeOutTime, function () {
            $(this).addClass('hidden');
            config.messages.current = '';
          });
        }
      }

      // API call to get report
      $.getJSON(config.httpHost.app[httpHost] + config.api.get + repo + '/' + id + '?sid=' + getCookie(cookie_SID))
        .done(function (data) {
          let payload = JSON.parse(data.payload);
          $("#viewtitle").html(getViewtitle(data.status) + ' Submission');
          loadForm("#viewedit-form", payload, id, data.status, form_id, config.default_repo, data, docMode);
        })
        .fail(function (textStatus, error) {
          $("#viewedit-content > .alert-danger").append(textStatus + ' ' + error + ' ' + config.messages.load.fail).removeClass('hidden').fadeOut(config.messages.fadeOutTime, function () {
            $(this).addClass('hidden');
          });
        });
    });
  }
}
// Setup hasher
function parseHash(newHash) {
  if (newHash !== "") { $.cookie(encodeURIComponent(config.default_repo) + '.lastHash', newHash, { expires: 7 }); }
  crossroads.parse(newHash);
}
function initFrontPage(data) {
  // configuration fields, should be same as access configuration values
  let cfg_groupMemberships = config.members.app_admin;

  if (cfg_groupMemberships.length > 0) {
    $.each(cfg_groupMemberships, function (i, group) {
      // check if the logged in username is also in groups list
      // if so put it in the groupmemberships values
      if (group === oLogin.username) {
        groupMemberships.push(oLogin.username);
      }
    })

    // check if the user is in one of the application groups
    // values taken from user cookie
    let groupsStr = oLogin.groups;
    // Save group names based on user's group permissions
    if (data && (groupsStr != "")) {
      for (let name in cfg_groupMemberships) {
        if (groupsStr.indexOf(cfg_groupMemberships[name]) !== -1) {
          groupMemberships.push(cfg_groupMemberships[name]);
        }
      }

      hasher.initialized.add(parseHash); // Parse initial hash
      hasher.changed.add(parseHash); // Parse hash changes
      hasher.init(); // Start listening for history change
    }
  }
}
function init() {
  crossroads.ignoreState = true;
  // crossroads.addRoute(':?query:', homePage);
  crossroads.addRoute('/:?query:', frontPage);
  crossroads.addRoute('/new:?query:', newPage);
  crossroads.addRoute('/{id}:?query:', viewEditPage);

  oLogin = new cot_login({
    ccRoot: config.httpHost.app[httpHost],
    welcomeSelector: "#app-content-right",
    onLogin: initFrontPage,
    appName: config.default_repo
  });

  $("#maincontent").on('click', '#btn-print', function () { window.print(); });
  $("#maincontent").on('click', '#btn-exportCsv', function () { });

  $("#maincontent").on('click', '.tablink', function () {
    hasher.setHash('?status=' + $(this).attr('data-id') + '&ts=' + new Date().getTime());
  });

  $("#maincontent").on('click', '#btn-adminSearch', function () {
    var query = $('#admin_search').val();
    if (query.trim() != "") {
      //   query = encodeURIComponent('(?i)'+query+'(?-i)');
      hasher.setHash('?status=' + $(this).attr('data-id') + '&search=' + 'payload~' + query + '&ts=' + new Date().getTime());
    }
  });

  // View / Edit report button
  $("#maincontent").on('click', '.btn-view-edit-report', function () {
    hasher.setHash($(this).parents('tr').attr('data-id') + '?ts=' + new Date().getTime() + '&mode=read&repo=' + config.default_repo);
  });

  // Edit button
  $("#maincontent").on('click', '.edit-action', function () {
    hasher.setHash($('#fid').val() + '?ts=' + new Date().getTime() + '&mode=edit&repo=' + config.default_repo);
  });

  // Set action parameter value based on button clicked
  $("#maincontent").on("click", ".btn-save, .btn-notify, .btn-submit", function () {
    $("#action").val($(this).attr('id'));
  });

}
// Sort submissions in order of last modified date with most recent first
function sortSubmissionsByDate(data) {
  data.sort(function (a, b) {
    //    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });
}