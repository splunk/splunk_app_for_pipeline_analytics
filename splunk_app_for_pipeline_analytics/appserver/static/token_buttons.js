require(['jquery', 'underscore', 'splunkjs/mvc', /*'util/console',*/ 'splunkjs/mvc/simplexml/ready!'], function($, _, mvc/*, console*/)
    {
    function panelLayout(dashboard_no, panels_pcts_array)
        {
        // Grab the DOM for the dashboard row of interest. Very first raw is [0] or .first().
        var panelRow = $('.dashboard-row')[dashboard_no];

        // Get the dashboard cells (which are the parent elements of the actual panels and define the panel size)
        var panelCells = $(panelRow).children('.dashboard-cell');

        var len = panels_pcts_array.length;
        for (var i=0; i<len; i++)
            {
            // Adjust the cells' width
            $(panelCells[i]).css('width', panels_pcts_array[i] + "%");
            }
        }

/*
    <!-- How to use custom buttons within Simple XML dashboard -->
    <row>
      <panel>
         <html>
           <a href="#" class="btn-pill" data-set-token="show_chart" data-value="show" data-unset-token="show_table">Show Chart</a>
           <a href="#" class="btn-pill" data-set-token="show_table" data-value="show" data-unset-token="show_chart">Show Table</a>
           <a href="#" class="btn-pill" data-token-json='{"show_table": null, "show_chart": null, "test_tok2": "RANDOM"}'>Hide All</a>
           <a href="#" class="btn-pill" data-current-state="0" data-token-json-s0='{"BUTTON_TEXT":"Click Here", show_table": null, "show_chart": null, "test_tok2": "RANDOM"}' data-token-json-s1='{"BUTTON_TEXT":"Thank you", "token_x": 1, "token_y": null, "test_tok2": "RANDOM"}'>Click Here</a>
         </html>
      </panel>
    </row>

      <html>
        <div>
          <div>
            <a style="margin:0 0 0 0px;background-color:#9b4a46;color:#ffe058;border-radius:8px;outline:none;" type="button" class="btn" href="/app/$env:app$/$env:page$">Reset dashboard</a>
            <a style="margin:0 0 0 10px;color:#ffe058;border-radius:8px;border:0;" type="button" class="btn" data-token-json="{&quot;form.selected_sender&quot;:&quot;*&quot;, &quot;form.selected_receiver&quot;:&quot;*&quot;, &quot;form.selected_ap&quot;:&quot;*&quot;, &quot;form.selected_protocol&quot;:&quot;*&quot;}" href="#">Clear filters</a>
            <span style="margin:0 -5px 0 5px;color:#888;">|</span>

            <a id="timechart_button" style="margin:0 0 0 10px;border-radius:8px;border:0;" type="button" class="btn" data-current-state="0" data-token-json-s0="{&quot;split_by_mac&quot;:&quot;1&quot;, &quot;BUTTON_TEXT&quot;:&quot;Group by Vendor&quot;}" data-token-json-s1="{&quot;split_by_mac&quot;:null,  &quot;BUTTON_TEXT&quot;:&quot;Split by MAC&quot;}" href="#">Group by Vendor</a>

            <a id="timechart_button" style="margin:0 0 0 10px;border-radius:8px;border:0;" type="button" class="btn" data-current-state="0" data-token-json-s0="{&quot;timechart_expanded&quot;:null, &quot;BUTTON_TEXT&quot;:&quot;Expand timechart&quot;}" data-token-json-s1="{&quot;timechart_expanded&quot;:&quot;1&quot;,  &quot;BUTTON_TEXT&quot;:&quot;Collapse timechart&quot;, &quot;CALL_FN&quot;:&quot;panelLayout(1,[25,0,0,0,75]);&quot;}" href="#">Expand timechart</a>
            <a style="margin:0 0 0 10px;border-radius:8px;border:0;" type="button" class="btn" data-current-state="0" data-token-json-s0="{&quot;BUTTON_TEXT&quot;:&quot;Hide stats&quot;, &quot;show_stats_panel&quot;:&quot;1&quot;,  &quot;CALL_FN&quot;:&quot;show__timechart_button();&quot;, &quot;XXmap_height&quot;:&quot;700&quot;}" data-token-json-s1="{&quot;BUTTON_TEXT&quot;:&quot;Show stats&quot;, &quot;show_stats_panel&quot;:null, &quot;CALL_FN&quot;:&quot;hide__timechart_button();&quot;, &quot;XXmap_height&quot;:&quot;1100&quot;}" href="#">Hide stats</a>
            <a style="margin:0 0 0 10px;border-radius:8px;border:0;" type="button" class="btn" data-current-state="0" data-token-json-s0="{&quot;show_map&quot;:1, &quot;BUTTON_TEXT&quot;:&quot;Hide map&quot;, &quot;dummy_value&quot;:&quot;RANDOM&quot;}" data-token-json-s1="{&quot;show_map&quot;:null, &quot;BUTTON_TEXT&quot;:&quot;Show map&quot;}" href="#">Hide map</a>
          </div>
        </div>
      </html>
*/

    // Predefined functions to call from within Simple XML buttons
    //
    function hide__timechart_button()  { $("#timechart_button").hide(); }
    function show__timechart_button()  { $("#timechart_button").show(); }


    // Set initial panel layout
//    panelLayout(1,[20,20,20,20,20]);

    // Enforce custom layouts. Splunk overwrites HTML of panel when panel tokens are changing, thus discarding all initial custom settings and resetting all panels to equal lengths.
    // We monitor inline style change and make sure "width" is matching current set of tokens.
    //
    function EnforceCustomLayout()
    {
    var mutationObserver = new MutationObserver(function(mutations)
      {
        //if(getToken("timechart_expanded")==null && $("#xpanel1")[0]!=null && $("#xpanel1")[0].style.width!="20%")
        //    {
        //    panelLayout(1,[10,15,25,20,30]);
        //    }
        //else
        if (getToken("timechart_expanded")=="1" && $("#xpanel1")[0]!=null && $("#xpanel5")[0]!=null && ($("#xpanel1")[0].style.width!="25%" || $("#xpanel5")[0].style.width!="75%"))
            {
            panelLayout(1,[25,0,0,0,75]);
            }
      });
    mutationObserver.observe(document.querySelectorAll("#xpanel1")[0], {attributes: true, attributeFilter: ['style', 'class']});
    mutationObserver.observe(document.querySelectorAll("#xpanel5")[0], {attributes: true, attributeFilter: ['style', 'class']});
    }

/// This blows up .JS if panels ID's does not exists
///    EnforceCustomLayout();


/*
    splunkjs.mvc.Components.getInstance("submitted").on (
        "change:timechart_expanded",
        function(evt, newValue)
        {
        if (newValue != null)
            {
//alert("setting layout 1");
            panelLayout(1, [25,75]);
            }
        else
            {
//alert("setting layout 2");
            panelLayout(1, [10,30,20,20,20]);
            }
        });
*/

    function setToken(name, value)
        {
        //console.log('Setting Token %o=%o', name, value);
        var defaultTokenModel = mvc.Components.get('default');
        if (defaultTokenModel != null)
            defaultTokenModel.set(name, value);

        var submittedTokenModel = mvc.Components.get('submitted');
        if (submittedTokenModel != null)
            submittedTokenModel.set(name, value);
        }

    function getToken(name)
        {
        var defaultTokenModel = mvc.Components.get('default');
        if(defaultTokenModel != null)
            return defaultTokenModel.get(name);

        var submittedTokenModel = mvc.Components.get('submitted');
        if(submittedTokenModel != null)
            return submittedTokenModel.get(name);
        }

////////////////!!!!
//alert("timechart_expanded=" + getToken("timechart_expanded"));
////////////////!!!!

    function unsetToken(name)
        {
        var defaultTokenModel = mvc.Components.get('default');
        if (defaultTokenModel != null)
            defaultTokenModel.unset(name);

        var submittedTokenModel = mvc.Components.get('submitted');
        if (submittedTokenModel != null)
            submittedTokenModel.unset(name);
        }

    $('.dashboard-body').on('click', '[data-set-token],[data-unset-token],[data-token-json],[data-current-state]', function(e)
        {
        e.preventDefault();
        var target = $(e.currentTarget);
        var setTokenName = target.data('set-token');
        if (setTokenName)
            {
            setToken(setTokenName, target.data('value'));
            }

        var unsetTokenName = target.data('unset-token');
        if (unsetTokenName)
            {
            unsetToken(unsetTokenName);
            }

        var tokenJson = target.data('token-json');
        if (tokenJson)
            {
            try
                {
                if (_.isObject(tokenJson))
                    {
                    _(tokenJson).each(function(value, key)
                        {
//alert("retrieved k/v=: " + key + "/" + value);
                        if (key == "CALL_FN")
                            {
//alert("1: eval()-ing: " + value);
                            eval(value);
                            }
                        else if (value=="RANDOM")
                            setToken(key, Math.random());
                        else if (value == null)
                            unsetToken(key);
                        // "dest_token":"{src_token}"
                        else if (value[0]=="{" && value.charAt(value.length-1)=="}")
                            {
                            var src_token=value.slice(1,-1);
                            setToken(key, getToken(src_token));
                            }
                        else
                            setToken(key, value);
                        });
                    }
                }
            catch (e)
                {
                //console.warn('Cannot parse token JSON: ', e);
                }
            }

        // Process multi-state looping buttons.
        var current_state = parseInt($(this).attr("data-current-state"), 10);
        if (current_state != null)
            {
            var next_state=current_state+1;
            var tokenJson = target.data('token-json-s' + next_state);
            if (tokenJson == null)
                {
                next_state=0;
                var tokenJson = target.data('token-json-s' + next_state);
                }
            if (tokenJson)
                {
                try
                    {
                    if (_.isObject(tokenJson))
                        {
                        _(tokenJson).each(function(value, key)
                            {
//alert("retrieved k/v=: " + key + "/" + value);
                            if (key == "CALL_FN")
                                {
//alert("2: eval()-ing: " + value);
                                eval(value);
                                }
                            else if (key == "BUTTON_TEXT")
                                {
//alert("setting html to: " + value);
                                target.html(value);
                                }
                            else if (value=="RANDOM")
                                {
//alert("setting random");
                                setToken(key, Math.random());
                                }
                            else if (value == null)
                                {
//alert("unsetting token: " + key);
                                unsetToken(key);
                                }
                            // "dest_token":"{src_token}"
                            else if (value[0]=="{" && value.charAt(value.length-1)=="}")
                                {
                                var src_token=value.slice(1,-1);
                                setToken(key, getToken(src_token));
                                }
                            else
                                {
//alert("setting :" + key + " to:" + value);
                                setToken(key, value);
                               }
                            });
                        }
//alert("setting data-current-state to: " + next_state);
                    target.attr('data-current-state', next_state);
                    }
                catch (e)
                    {
                    //console.warn('Cannot parse token JSON: ', e);
                    }
                }
            }
        });
    });




