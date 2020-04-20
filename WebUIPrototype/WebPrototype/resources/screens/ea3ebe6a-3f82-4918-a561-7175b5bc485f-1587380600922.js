jQuery("#simulation")
  .on("click", ".s-ea3ebe6a-3f82-4918-a561-7175b5bc485f .click", function(event, data) {
    var jEvent, jFirer, cases;
    if(data === undefined) { data = event; }
    jEvent = jimEvent(event);
    jFirer = jEvent.getEventFirer();
    if(jFirer.is("#s-Button_1")) {
      cases = [
        {
          "blocks": [
            {
              "actions": [
                {
                  "action": "jimChangeStyle",
                  "parameter": [ {
                    "#s-ea3ebe6a-3f82-4918-a561-7175b5bc485f #s-Button_1 > .backgroundLayer": {
                      "attributes": {
                        "background-color": "#CCCCCC"
                      }
                    }
                  },{
                    "#s-ea3ebe6a-3f82-4918-a561-7175b5bc485f #s-Button_1": {
                      "attributes-ie": {
                        "-pie-background": "#CCCCCC",
                        "-pie-poll": "false"
                      }
                    }
                  } ],
                  "exectype": "serial",
                  "delay": 0
                }
              ]
            }
          ],
          "exectype": "serial",
          "delay": 0
        }
      ];
      event.data = data;
      jEvent.launchCases(cases);
    } else if(jFirer.is("#s-Button_2")) {
      cases = [
        {
          "blocks": [
            {
              "actions": [
                {
                  "action": "jimChangeStyle",
                  "parameter": [ {
                    "#s-ea3ebe6a-3f82-4918-a561-7175b5bc485f #s-Button_1 > .backgroundLayer": {
                      "attributes": {
                        "background-color": "transparent",
                        "background-image#moz": "-moz-linear-gradient(top,#FFFFFF,#E6E6E6)",
                        "background-image#wk": "-webkit-linear-gradient(top,#FFFFFF,#E6E6E6)",
                        "background-image#old": "-webkit-gradient(linear,left top,left bottom,color-stop(0%,#FFFFFF), color-stop(100%,#E6E6E6))",
                        "background-image#op": "-o-linear-gradient(top,#FFFFFF,#E6E6E6)",
                        "background-image#draft": "linear-gradient(to bottom,#FFFFFF,#E6E6E6)"
                      }
                    }
                  },{
                    "#s-ea3ebe6a-3f82-4918-a561-7175b5bc485f #s-Button_1": {
                      "attributes-ie": {
                        "-pie-background": "linear-gradient(to bottom,#FFFFFF,#E6E6E6)",
                        "-pie-poll": "false"
                      }
                    }
                  } ],
                  "exectype": "serial",
                  "delay": 0
                }
              ]
            }
          ],
          "exectype": "serial",
          "delay": 0
        },
        {
          "blocks": [
            {
              "actions": [
                {
                  "action": "jimChangeStyle",
                  "parameter": [ {
                    "#s-ea3ebe6a-3f82-4918-a561-7175b5bc485f #s-Button_2 > .backgroundLayer": {
                      "attributes": {
                        "background-color": "#CCCCCC"
                      }
                    }
                  },{
                    "#s-ea3ebe6a-3f82-4918-a561-7175b5bc485f #s-Button_2": {
                      "attributes-ie": {
                        "-pie-background": "#CCCCCC",
                        "-pie-poll": "false"
                      }
                    }
                  } ],
                  "exectype": "serial",
                  "delay": 0
                }
              ]
            }
          ],
          "exectype": "serial",
          "delay": 0
        }
      ];
      event.data = data;
      jEvent.launchCases(cases);
    } else if(jFirer.is("#s-Rectangle_3")) {
      cases = [
        {
          "blocks": [
            {
              "actions": [
                {
                  "action": "jimNavigation",
                  "parameter": {
                    "target": "screens/2316a0d4-f7b7-45b8-a9d7-f94b3d24b059"
                  },
                  "exectype": "serial",
                  "delay": 0
                }
              ]
            }
          ],
          "exectype": "serial",
          "delay": 0
        }
      ];
      event.data = data;
      jEvent.launchCases(cases);
    } else if(jFirer.is("#s-Rectangle_5")) {
      cases = [
        {
          "blocks": [
            {
              "actions": [
                {
                  "action": "jimNavigation",
                  "parameter": {
                    "target": "screens/3610c629-410f-4089-bc50-712e94c3c769"
                  },
                  "exectype": "serial",
                  "delay": 0
                }
              ]
            }
          ],
          "exectype": "serial",
          "delay": 0
        }
      ];
      event.data = data;
      jEvent.launchCases(cases);
    }
  });