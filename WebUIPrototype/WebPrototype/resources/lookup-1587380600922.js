(function(window, undefined) {
  var dictionary = {
    "c8b6b819-e62d-43fd-8272-23b5dc328029": "Customer-Purchase-Detail",
    "2316a0d4-f7b7-45b8-a9d7-f94b3d24b059": "Customer-Main",
    "665ec720-0768-4604-ab34-f2b096b2053a": "Index",
    "ea3ebe6a-3f82-4918-a561-7175b5bc485f": "Login",
    "18d6d117-bd31-4d66-a52f-40eee7b3288b": "Common-Resolution-Create",
    "3610c629-410f-4089-bc50-712e94c3c769": "Employee-Main",
    "b69a742c-13e1-4db1-b541-c40d0c0ebcf9": "Customer-Case-Create",
    "5569069b-e82d-4f98-bfbb-5e9617207540": "Common-Resolutions",
    "532492bb-233b-4c49-b52f-10f192801c57": "Customer-Case-Detail",
    "7fa6a1f4-9e56-47d7-935b-c46d6e3b8d49": "Customer-Main-Buy-Fail",
    "87db3cf7-6bd4-40c3-b29c-45680fb11462": "960 grid - 16 columns",
    "e5f958a4-53ae-426e-8c05-2f7d8e00b762": "960 grid - 12 columns",
    "f39803f7-df02-4169-93eb-7547fb8c961a": "Template 1",
    "bb8abf58-f55e-472d-af05-a7d1bb0cc014": "default"
  };

  var uriRE = /^(\/#)?(screens|templates|masters|scenarios)\/(.*)(\.html)?/;
  window.lookUpURL = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, url;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      url = folder + "/" + canvas;
    }
    return url;
  };

  window.lookUpName = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, canvasName;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      canvasName = dictionary[canvas];
    }
    return canvasName;
  };
})(window);