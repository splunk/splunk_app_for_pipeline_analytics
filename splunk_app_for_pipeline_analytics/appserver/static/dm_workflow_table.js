require([
    "underscore",
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/simplexml/ready!"
], function(
   _,
   mvc,
   SearchManager,
   TableView
) {

    mvc.Components.revokeInstance("myCustomRowSearch");

    // Set up search managers
    var search2 = new SearchManager({
        id: "myCustomRowSearch",
        preview: true,
        cache: true,
        //search: mvc.tokenSafe("| datamodel DevOps_Pipelines Pipelines flat | search repository_name=\"$repos$\" | table id,name"),
        search: mvc.tokenSafe("| datamodel DevOps_Pipelines Pipelines flat | search repository_name=\"$repos$\" | stats latest(created) as created, latest(started) as started, latest(completed) as completed,latest(result) as result by repository_name,name,run_id | eval duration=if(isnotnull(completed),tostring(completed-started,\"Duration\"),\"In Progress\") | rename repository_name as \"Repository Name\", name as \"Workflow Name\", run_id as \"Run ID\" | table result, \"Repository Name\", \"Workflow Name\", \"Run ID\", duration,completed|sort completed|fields - completed"),
        earliest_time: mvc.tokenSafe("$timeTkn.earliest$"),
        latest_time: mvc.tokenSafe("$timeTkn.latest$")
    });

    // Create a table for a custom row expander
    var mycustomrowtable = new TableView({
        id: "table-customrow",
        managerid: "myCustomRowSearch",
        drilldown: "none",
        drilldownRedirect: false,
        el: $("#table-customrow")
    });

    // Define icons for the custom table cell
    var ICONS = {
        failure: "error",
        in_progress: "question-circle",
        success: "check-circle"
    };

    // Use the BaseCellRenderer class to create a custom table cell renderer
    var CustomCellRenderer = TableView.BaseCellRenderer.extend({
        canRender: function(cellData) {
            // This method returns "true" for the "range" field
            return cellData.field === "result";
        },

        // This render function only works when canRender returns "true"
        render: function($td, cellData) {
            console.log("cellData: ", cellData);

            var icon = "question";
            if(ICONS.hasOwnProperty(cellData.value)) {
                icon = ICONS[cellData.value];
            }
            $td.addClass("icon").html(_.template('<i class="icon-<%-icon%> <%- status %>" title="<%- status %>"></i>', {
                icon: icon,
                status: cellData.value
            }));
        }
    });

    // Use the BasicRowRenderer class to create a custom table row renderer
    var CustomRowRenderer = TableView.BaseRowExpansionRenderer.extend({
        canRender: function(rowData) {
            console.log("RowData: ", rowData);
            return true;
        },

        initialize: function(args){
             this._searchManager = new SearchManager({
                 id: 'details-search-manager',
                 preview: false
             });
             this._TableView = new TableView({
                 id: 'ResultsTable',
                 managerid: 'details-search-manager',
                 drilldown: "all",
                 drilldownRedirect: true
            });
        },

        render: function($container, rowData) {
        // Print the rowData object to the console
        console.log("RowData: ", rowData);

        var repoNameCell = _(rowData.cells).find(function (cell) {
            return cell.field === 'Repository Name';
        });


        var workflowName = _(rowData.cells).find(function (cell) {
            return cell.field === 'Workflow Name';
        });

        var workflowIDCell = _(rowData.cells).find(function (cell) {
            return cell.field === 'Run ID';
        });

        this._TableView.on("click", function(e) {
            e.preventDefault();
            console.log(e);
            window.open("/app/github_app_for_splunk/workflow_details?form.workflow_id="+workflowIDCell.value+"&form.repoName="+repoNameCell.value+"&form.workflowName="+workflowName.value+"&form.field1.earliest=-24h%40h&form.field1.latest=now&form.timeRange.earliest=-30d%40d&form.timeRange.latest=now&form.workflowCount=25",'_self');
        });

        this._searchManager.set({ search: '| datamodel DevOps_Pipelines Pipelines flat | search run_id='+workflowIDCell.value+' | eval started=if(status=="requested", _time, null), completed=if(status=="completed", _time,null) | stats latest(result) as Status, earliest(started) as Started, latest(completed) as Completed, latest(source_branch) as Branch, latest(trigger) as Trigger | eval Duration=tostring(Completed-Started, "Duration") | eval Started=strftime(Started,"%Y-%m-%dT%H:%M:%S"), Completed=strftime(Completed,"%Y-%m-%dT%H:%M:%S")| fields Status, Started, Completed, Duration, Branch, Trigger | eval Details="Click here for Workflow Details" | transpose|rename column AS Details| rename "row 1" AS values'});
                // $container is the jquery object where we can put out content.
                // In this case we will render our chart and add it to the $container
                $container.append(this._TableView.render().el);
        }
    });

    // Create an instance of the custom cell renderer,
    // add it to the table, and render the table
    var myCellRenderer = new CustomCellRenderer();
    mycustomrowtable.addCellRenderer(myCellRenderer);
    mycustomrowtable.render();

    // Create an instance of the custom row renderer,
    // add it to the table, and render the table
    var myRowRenderer = new CustomRowRenderer();
    mycustomrowtable.addRowExpansionRenderer(myRowRenderer);
    mycustomrowtable.render();

    mycustomrowtable.on("click", function(e) {
       e.preventDefault();
       console.log(e.data);
       window.open("/app/github_app_for_splunk/workflow_details?form.repoName="+e.data["row.repository.full_name"]+"&form.workflowName="+e.data["row.workflow_job.name"]+"&form.field1.earliest=-24h%40h&form.field1.latest=now&form.timeRange.earliest=-30d%40d&form.timeRange.latest=now&form.workflowCount=25",'_blank');
    });

});
