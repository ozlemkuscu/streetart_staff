"use strict";

callback({
  "items": [
    {
      "title": "config",
      "summary":
      {
        'title': 'StreetARToronto',
        'v2': { 'title': "StreetARToronto" },
        'dateTimeFormat': 'MM/DD/YYYY hh:mm',
        'dateTimeFormat2': 'YYYY/MM/DD hh:mm',
        'dateTimeFormat3': 'MM/DD/YYYY hh:mm a',
        'dateFormat': 'MM/DD/YYYY',
        'dateFormat2': 'YYYY-MM-DD',
        'dateFormatView': 'YYYY/MM/DD h:mm a',
        'timeFormat': 'h:mm a',
        'default_repo': 'streetart',
        'formName': { 'demo': 'StreetARToronto Artist Form' },
        'timeOutMsg': '<br><br><p><strong>The session will time out after 15 minutes of inactivity, please save your work.</strong></p>',
        'pointerType': {
          'title': 'Pointer',
          choices: [{ 'text': 'Select one', 'value': '' }]
        },
        'button': {
          'submit': 'Submit',
          'edit': 'Edit',
          'submitPublic': 'Submit Public',
          'createNewEntry': 'Create New',
          'viewSubmissions': 'View Submissions',
          'print': 'Print',
          'exportCsv': 'Export to CSV',
          'exportExcel': 'Export to Excel',
          'viewEdit': 'View / Edit',
          'delete': 'Delete',
          'addNewItem': 'Add New Item',
          'removeItem': 'Remove Item',
          'clearItem': 'Clear Item',
          'saveReport': 'Save Draft',
          'save': 'Save',
          'notifyReport': 'Notify Captain',
          'submitReport': 'Submit',
          'submitPublicReport': 'Submit Public',
          'approveReport': 'Approve',
          'rejectReport': 'Reject',
          'removeReport': 'Remove Record',
          'removeTitle': 'Remove Item',
          'createReport': 'Create Report',
          'reports': 'Reports'
        },
        'choices': {
          'yesNo': [{
            'text': 'Yes',
            'value': 'y'
          }, {
            'text': 'No',
            'value': 'n'
          }],
          'yesNoSelect': [{
            'text': 'Select One',
            'value': ''
          }, {
            'text': 'Yes',
            'value': 'y'
          }, {
            'text': 'No',
            'value': 'n'
          }],
          'yesNoFull': [{
            'text': 'Yes',
            'value': 'Yes'
          }, {
            'text': 'No',
            'value': 'No'
          }],
          'yesNoNA': [{
            'text': 'Yes',
            'value': 'y'
          }, {
            'text': 'No',
            'value': 'n'
          }, {
            'text': 'N/A',
            'value': 'n/a'
          }]
        },
        'httpHost': {
          'rootPath': {
            'local': '/',
            'dev': '/webapps/work/decom/streetart_staff/',
            'qa': '/webapps/streetart_staff/',
            'prod': '/webapps/streetart_staff/'
          },
          'rootPath_public': {
            'local': '/',
            'dev': '/webapps/work/decom/streetart_public/',
            'qa': '/webapps/streetart_public/',
            'prod': '/webapps/streetart_public/'
          },
          'root': {
            'local': 'localhost',
            'dev': 'https://was-intra-sit.toronto.ca',
            'qa': 'https://was-intra-qa.toronto.ca',
            'prod': 'https://insideto-secure.toronto.ca'
          },
          'root_public': {
            'local': 'localhost',
            'dev': 'https://was-inter-sit.toronto.ca',
            'qa': 'https://was-inter-qa.toronto.ca',
            'prod': 'https://secure.toronto.ca'
          },
          'app': {
            'local': 'https://was-intra-sit.toronto.ca',
            'dev': 'https://was-intra-sit.toronto.ca',
            'qa': 'https://was-intra-qa.toronto.ca',
            'prod': 'https://insideto-secure.toronto.ca'
          },
          'app_public': {
            'local': 'https://was-inter-sit.toronto.ca',
            'dev': 'https://was-inter-sit.toronto.ca',
            'qa': 'https://was-inter-qa.toronto.ca',
            'prod': 'https://secure.toronto.ca'
          },
          'eventDispatcher': {
            'dev': 'http://cheetah-b4.corp.toronto.ca:5680',
            'qa': 'https://esb1qa.toronto.ca:5680',
            'prod': 'https://esb1.toronto.ca:5680'
          }
        },
        'api': {
          'get': '/cc_sr_admin_v1/retrieve/eventrepo/',
          'post': '/cc_sr_admin_v1/submit/',
          'put': '/cc_sr_admin_v1/submit/eventrepo/',
          'delete': '/cc_sr_admin_v1/submit/eventrepo/',
          'email': '/cc_sr_admin_v1/submit/csu_email',
          'eventDispatcher': '/rest/COTEventDispatcher_V2/REST',
          'upload': '/cc_sr_admin_v1/upload/',
          'session': '/cc_sr_admin_v1/session/',
          'timeout': 60
        },
        'api_public': {
          'post': '/cc_sr_v1/submit/',
          'upload': '/cc_sr_v1/upload/',
          'email': '/cc_sr_v1/submit/streetart_email'
        },
        'members': {
          'app_g': 'G',
          'app_admin': 'testweb1,StreetARToronto_user,StreetARToronto_admin,okuscu,bkiri'
        },
        'admin': {
          'Ozlem Kuscu Yahoo': 'ozlemkuscu@yahoo.ca'
        },
        'captain': {
          'Ozlem Kuscu': 'ozlem.kuscu@toronto.ca'
        },
        'recStatus': {
          'title': 'Status',
          choices: [
            { 'text': 'New', 'value': 'New' },
            { 'text': 'Pending', 'value': 'Pending' },
            { 'text': 'Approved', 'value': 'Approved' },
            { 'text': 'Rejected', 'value': 'Rejected' },
            { 'text': 'Live', 'value': 'Live' },
            { 'text': 'Archived', 'value': 'Archived' },
            { 'text': 'Invalid requests', 'value': 'Invalid requests' }
          ]
        },
        'preferredMethod': {
          'title': 'Preferred Method of Contact',
          choices: [
            { 'text': 'Phone', 'value': 'Phone' },
            { 'text': 'Email', 'value': 'Email' },
            { 'text': 'Mail', 'value': 'Mail' },
          ]
        },
        'preferredName': {
          'title': 'Preferred Name for Contact',
          choices: [
            { 'text': 'Full Name', 'value': 'Full Name' },
            { 'text': 'Artist Alias', 'value': 'Artist Alias' },
            { 'text': 'Business', 'value': 'Business' },
          ]
        },
        'messages': {
          'current': '',
          'load': {
            'fail': 'Unable to load! Report could not be retrieved. Please try again.'
          },
          'save': {
            'done': 'Saved! This report was successfully saved.',
            'fail': 'Unable to save! This report could not be saved. Please try again.'
          },
          'notify': {
            'done': 'Notified! This report was successfully sent to the Emergency Management Captain.',
            'fail': 'Unable to notify! This report could not be sent to the Emergency Management Captain. Please try again.',
            'emailFrom': 'wmDev@toronto.ca',
            'emailSubject': 'New Artist Profile',
            'emailBody': 'New Artist Profile has been received.',
            'sendNotification':true
          },
          'submit': {
            'done': 'Thank you! Your request has been received.',
            'fail': 'Unable to submit! This report could not be submitted to the Administrator. Please try again.'
          },
          'approve': {
            'done': 'Approved! This report was successfully approved.</div>',
            'fail': 'Unable to approve! This report could not be approved. Please try again.'
          },
          'reject': {
            'done': 'Rejected! This report was successfully rejected and assigned back to the incident manager.',
            'fail': 'Unable to reject! This report could not be rejected. Please try again.'
          },
          'delete': {
            'done': 'Deleted! Report was successfully deleted.',
            'fail': 'Unable to delete! This report could not be deleted. Please try again.'
          },
          'noSubmissionsFound': 'No submissions found.',
          'fadeOutTime': 8000
        },
        'auth': {
          'login': '<h2>Session timeout! Please log in to access this application.</h2>',
          'group': '<h2>Unauthorized! You don\'t have sufficient group permissions to view this application.</h2>'
        },
        'status': {
          'Draft': 'Yes',
          'Submitted': 'Submitted',
          'Approved': 'Approved',
          'Deleted': 'Deleted',
          'Yes': 'New',
          'Ongoing': 'Submitted',
          'Closed': 'Approved',
          'Search': 'Global Search',
          'All': 'All',
          'DraftApp': 'New',
          'YesApp': 'New',
          'SubmittedApp': 'Pending',
          'ApprovedApp': 'Approved',
          'RejectedApp': 'Rejected',
          'LiveApp': 'Live',
          'ArchivedApp': 'Archived',
          'InvalidApp': 'Invalid requests'
        },
        'chkCVAvailable': {
          'title': '',
          'choices': [{ 'text': 'Make my CV/resume available for public viewing.', 'value': 'Yes' }]
        },
        'chkDeclaration': {
          'title': '',
          'choices': [{ 'text': 'I acknowledge my profile will be removed from the City of Toronto Artist Directory if I am found to be engaging in illegal graffiti activities or charged for mischief related to graffiti vandalism.', 'value': 'Yes' }]
        },
        'admin':
        {
          'resumeDropzonePublic': {
            "acceptedFiles": "image/*,application/pdf,application/PDF,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "maxFiles": 1,
            "dictDefaultMessage": "Drop files here or <button class='btn-link' aria-label='File Upload - Drop files here or click to upload' type='button'>select</button> to upload.",
            "maxFilesize": 10,
            "dictFileTooBig": "Maximum size for file attachment is 10 MB",
            "addRemoveLinks": true,
            "dictMaxFilesExceeded": "Maximum 1 uploaded file"
          },
          'resumeDropzoneStaff': {
            "acceptedFiles": "image/*,application/pdf,application/PDF,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "maxFiles": 1,
            "dictDefaultMessage": "Drop files here or <button class='btn-link' aria-label='File Upload - Drop files here or click to upload' type='button'>select</button> to upload.",
            "maxFilesize": 10,
            "dictFileTooBig": "Maximum size for file attachment is 10 MB",
            "addRemoveLinks": true,
            "dictMaxFilesExceeded": "Maximum 1 uploaded file"
          },
          'imageDropzonePublic': {
            "acceptedFiles": "image/*,application/pdf,application/PDF,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "maxFiles": 5,
            "dictDefaultMessage": "Drop files here or <button class='btn-link' aria-label='File Upload - Drop files here or click to upload' type='button'>select</button> to upload.",
            "maxFilesize": 10,
            "dictFileTooBig": "Maximum size for file attachment is 10 MB",
            "addRemoveLinks": true,
            "dictMaxFilesExceeded": "Maximum 5 uploaded file"
          },
          'imageDropzoneStaff': {
            "acceptedFiles": "image/*,application/pdf,application/PDF,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "maxFiles": 5,
            "dictDefaultMessage": "Drop files here or <button class='btn-link' aria-label='File Upload - Drop files here or click to upload' type='button'>select</button> to upload.",
            "maxFilesize": 10,
            "dictFileTooBig": "Maximum size for file attachment is 10 MB",
            "addRemoveLinks": true,
            "dictMaxFilesExceeded": "Maximum 5 uploaded file"
          }
        }
      }
    },
    {
      "title": "breadcrumbtrail",
      "summary": [{
        "name": "...",
        "link": "http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=8e79f9be8db1c310VgnVCM1000006cd60f89RCRD"
      }, {
        "name": "Transportation",
        "link": "http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=e10086195a7c1410VgnVCM10000071d60f89RCRD"
      }, {
        "name": "StreetARToronto",
        "link": "http://www1.toronto.ca/wps/portal/contentonly?vgnextoid=bebb4074781e1410VgnVCM10000071d60f89RCRD"
      }]
    },
    {
      "summary": "Open",
      "title": "View_Edit"
    },
    {
      "summary": "Preferred Name for Contact",
      "title": "Preferred Name"
    },
    {
      "summary": "Contact Method",
      "title": "preferredMethodColumn"
    },
    {
      "summary": "Preferred Method of Contact",
      "title": "preferredMethod"
    },
    {
      "summary": "Professional Contact Details",
      "title": "Contact Details Section"
    }, {
      "summary": "Contacted By",
      "title": "Contacted By"
    }, {
      "summary": "Created",
      "title": "Profile Created"
    }, {
      "summary": "Submission Date",
      "title": "Submission Date Column"
    }, {
      "summary": "Name",
      "title": "Name"
    }, {
      "summary": "First Name",
      "title": "First Name"
    }, {
      "summary": "Last Name",
      "title": "Last Name"
    }, {
      "summary": "Last Name",
      "title": "Last Name Column"
    }, {
      "summary": "Artist Alias",
      "title": "Artist Alias"
    }, {
      "summary": "Artist Representative Business or Organization Name",
      "title": "Organization"
    }, {
      "summary": "<p tabindex=0>You may wish to provide only your artist alias to the general public viewing the artist directory.</p>",
      "title": "PreferredNameText"
    }, {
      "summary": "Artist Bio/Business Description (max 500 characters)",
      "title": "Artist Bio"
    }, {
      "summary": "Address",
      "title": "AddressColumn"
    }, {
      "summary": "Business Address",
      "title": "Address"
    }, {
      "summary": "City",
      "title": "City"
    }, {
      "summary": "Province",
      "title": "Province"
    }, {
      "summary": "Postal Code",
      "title": "Postal Code"
    }, {
      "summary": "Business Phone 1",
      "title": "Primary Phone"
    }, {
      "summary": "Business Phone 2",
      "title": "Other Phone"
    }, {
      "summary": "Email",
      "title": "EmailColumn"
    }, {
      "summary": "Business Email",
      "title": "Email"
    }, {
      "summary": "Website",
      "title": "URL"
    }, {
      "summary": "<p tabindex=0>Only the selected method of contact will be posted to your online profile.</p>",
      "title": "PreferredMethodText"
    }, {
      "summary": "Work Details",
      "title": "Work Details Section"
    },
    {
      "summary": "Show Work Details on Public Profile",
      "title": "Work To Public"
    }, {
      "summary": "<p tabindex=0>Providing this information is not mandatory and you may choose whether you post it to your public profile. More details may provide prospective clients with the opportunity to learn more about your work. If you wish to add these details to your public profile, please mark your preference below.</p>",
      "title": "WorkToPublicText"
    }, {
      "summary": "Profile",
      "title": "Profile"
    }, {
      "summary": "<p tabindex=0>Tell us about yourself, your style, your preferred medium.</p>",
      "title": "ProfileText"
    }, {
      "summary": "Availability and Interest",
      "title": "Availability"
    }, {
      "summary": "Level of Experience",
      "title": "Experience"
    }, {
      "summary": "Past Work History",
      "title": "Work History"
    }, {
      "summary": "Attachments",
      "title": "Attachments Section"
    }, {
      "summary": "CV/Resume",
      "title": "CV"
    }, {
      "summary": "CV/Resume Section",
      "title": "CV Section"
    }, {
      "summary": "Image/s",
      "title": "Images"
    }, {
      "summary": "Image/s Section",
      "title": "Images Section"
    }
    , {
      "summary": "IMAGE SPECS <br><strong>Format: jpg, gif, png, dimensions: 600X400 pixel, size: 1.0 mb max., Orientation: horizontal only, limit of max five (5) images.</strong>",
      "title": "ImagesText"
    }, {
      "summary": "If you have any questions about the Artist Directory, please email <a href='mailto:streetart@toronto.ca'>streetart@toronto.ca</a>",
      "title": "FooterText1"
    }, {
      "summary": "The images of the buildings attached to this form should not include the photos of identifiable people. The images may be reproduced in City of Toronto publications/material, including marketing and promotional materials and the City of Toronto official website.",
      "title": "FooterText2"
    }, {
      "summary": "Any use of or reliance on this website, the contents of this website or the information provided through this website shall be at your sole risk. The City of Toronto does not endorse or sponsor any of the artists identified on this website. The City of Toronto provides the website as an open list to artists on an 'as is', 'as available', basis. Further, the City of Toronto does not represent and warrant that the website or its contents will be available or meet your requirements, that access will be uninterrupted, that there will be no delays, failures or errors or omissions or loss of transmitted information, that no viruses or other contaminating or destructive properties will be transmitted or that no damage will occur to your computer system due to use of the website.",
      "title": "FooterText3"
    }, {
      "summary": "Your cannot submit without marking that you will not engage in illegal graffiti.",
      "title": "declarationValidation"
    }, {
      "summary": "<strong>I acknowledge my profile will be removed from the City of Toronto Artist Directory if I am found to be engaging in illegal graffiti activities or charged for mischief related to graffiti vandalism.</strong>",
      "title": "DeclarationText"
    }, {
      "summary": "File Attachment",
      "title": "File Attachment"
    }, {
      "summary": "STAFF AREA",
      "title": "Staff Area Footer"
    }, {
      "summary": "streetart_submissions",
      "title": "Excel File Name"
    }
  ]
});
