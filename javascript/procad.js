ExecuteOrDelayUntilScriptLoaded(init, "sp.js");
function init() {
    FixRibbon();
    var listId = SP.ListOperation.Selection.getSelectedList();
    LogToConsole("CurrentListId: " + listId);
    retrieveListItems(listId);
}
var listId;
function RibbonToogle()
{
    this.listId = SP.ListOperation.Selection.getSelectedList();
    LogToConsole("CurrentListId: " + listId);
    ToogleEntry(this.listId);
}
function FixRibbon()
{
    var css = document.createElement('style');
    css.type = 'text/css';
    var styles = '.FixRibbonRow { MIN-HEIGHT: 135px !important }';
    styles += ' #s4-titlerow  { WIDTH: 100% !important }';
    if (css.styleSheet) css.styleSheet.cssText = styles;
    else css.appendChild(document.createTextNode(styles));
    document.getElementsByTagName("head")[0].appendChild(css);
}
function ToogleEntry(listid)
{
    retrieveListItems(listid, true);
}

function LogToConsole(message) {
    if (window.console) {
        console.log(message);
    }
}


var $titlerow;
function InitFixedTableHeader() {
    LogToConsole("Init FixedTableHeader");
    var ListViewTable = $(".ms-listviewtable");
    if (ListViewTable.length == 1 && ctx.listTemplate != 109) {
        var FloatingHeaderTable = $("<table id='FloatingHeaderTable' style='display: none; position: absolute; background-color: "
                                    + $("#MSO_ContentTable").css("backgroundColor")
                                    + "' border='0' cellpadding='0' cellspacing='0'><tr></tr></table>");
        var FloadingHeaderRow = FloatingHeaderTable.find("tr");

        var ViewHeaderRow = $(".ms-viewheadertr");
        if (ViewHeaderRow != null) { window.console && console.log("ms-viewheadertr found"); }

        $("th", ViewHeaderRow).each(function (i, Cell) {
            var HeaderCell = $(Cell);
            var Align = (HeaderCell.find(".ms-numHeader").length == 1) ? "right" : "left";
            var PaddingRight = Align == "right" ? "19" : "4";
            FloadingHeaderRow.append("<td style='text-align: " + Align + "' class='ms-vh'><div style='padding: 5px " + PaddingRight + "px 3px 2px; white-space: nowrap'>" + HeaderCell.find(".ms-vh-div").text() + "</div></td>");
        });

        ListViewTable.append(FloatingHeaderTable);
        $titlerow = $("#s4-titlerow").clone();
        //$("#s4-titlerow").hide();
        $("#s4-workspace").scroll(InitFixedTableHeaderWidths);
        $(".ms-cui-tts", $("#s4-ribbonrow")).on("click", InitFixedTableHeaderWidths);
        $(window).resize(InitFixedTableHeaderWidths);
    }
}


function InitFixedTableHeaderWidths() {
    var RibbonHeight = $("#s4-ribbonrow").height();

    var ListViewTable = $(".ms-listviewtable");
    var FloatingHeaderTable = $("#FloatingHeaderTable");

    if (ListViewTable.offset().top <= RibbonHeight - 4) {
        window.console && console.log("Header behind Ribbon");
        if ($("#s4-ribbonrow").find("s4-titlerow").length < 1) {
            LogToConsole("TableRow found");
            $("#s4-ribbonrow").addClass("FixRibbonRow").append($titlerow);
        }
        FloatingHeaderTable.show();
        window.console && console.log("Show Ribbon");
        FloatingHeaderTable.offset({ top: RibbonHeight, left: ListViewTable.offset().left });
        FloatingHeaderTable.width(ListViewTable.width());
        var FloadingHeaderCells = FloatingHeaderTable.find("td");
        var ViewHeaderRow = $(".ms-viewheadertr");

        $("th", ViewHeaderRow).each(function (i, Cell) {
            var NewWidth = $(Cell).outerWidth();
            $(FloadingHeaderCells[i]).width(NewWidth);
        });
    }
    else {
        FloatingHeaderTable.hide();
        $("#s4-ribbonrow").removeClass("FixRibbonRow").find("#s4-titlerow").remove();
    }
}

function createListItem(listid ) {
    var clientContext = new SP.ClientContext.get_current();
    this.oSite = clientContext.get_site();
    this.oWebsite = this.oSite.get_rootWeb();
    var oList = clientContext.get_web().get_lists().getByTitle('FixedHeader');

    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);
    oListItem.set_item('Title', listid);
    
    oListItem.update();

    clientContext.load(oListItem);
    clientContext.executeQueryAsync(
        Function.createDelegate(this, this.onQuerySucceeded),
        Function.createDelegate(this, this.onQueryFailed)
    );
}

function onQuerySucceeded() {
    LogToConsole('Item created: ' + oListItem.get_id());
}

function onQueryFailed(sender, args) {
    LogToConsole('Request failed. ' + args.get_message() +
        '\n' + args.get_stackTrace());
}

var collListItem;
function retrieveListItems(listid, toggle) {

    var clientContext = new SP.ClientContext.get_current();
    this.oSite = clientContext.get_site();
    this.oWebsite = this.oSite.get_rootWeb();
    var oList = oWebsite.get_lists().getByTitle('FixedHeader');
    LogToConsole("RetrieveListItems called");
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Title" /><Value Type="Text">' + listid + '</Value></Eq></Where> </Query><ViewFields><FieldRef Name="Title" /></ViewFields></View>');
    //camlQuery.set_viewXml("<Where><Eq><FieldRef Name=\'Title\'/>" + "<Value Type=\'Text\'>" + listid +"</Value></Eq></Where>");
    this.collListItem = oList.getItems(camlQuery);

    clientContext.load(collListItem);
    if (!toggle)
    {
        clientContext.executeQueryAsync(Function.createDelegate(this, this.RLISucceeded), Function.createDelegate(this, this.RLIFailed));
    }
    else
    {
        clientContext.executeQueryAsync(Function.createDelegate(this, this.UpdateSuceeded), Function.createDelegate(this, this.UpdateFailed));
    }
}

function RLISucceeded(sender, args) {

    var listItemInfo = '';
    var itemCount = this.collListItem.get_count();
    var listItemEnumerator = collListItem.getEnumerator();
    if (itemCount > 0)
    {
        LogToConsole("Entry found");
        InitFixedTableHeader();
    }
    else{ LogToConsole("No Entry found"); }
}

function RLIFailed(sender, args) {

    LogToConsole('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}


function UpdateSuceeded(sender, args)
{
    var listItemInfo = '';

    var itemCount = this.collListItem.get_count();
    if ( itemCount > 0) {
        var listItemEnumerator = this.collListItem.getEnumerator();

        while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();
            deleteListItem(oListItem.get_id());
        }
    }
    else
    {
        FixRibbon();
        InitFixedTableHeader();
        createListItem(this.listId);
    }
}

function UpdateFailed(sender, args)
{
    LogToConsole("Failed");
}


function deleteListItem(id) {


    var clientContext = new SP.ClientContext.get_current();
    this.oSite = clientContext.get_site();
    this.oWebsite = this.oSite.get_rootWeb();
    var oList = oWebsite.get_lists().getByTitle('FixedHeader');
    this.oListItem = oList.getItemById(id);

    oListItem.deleteObject();

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onDeleteSucceded), Function.createDelegate(this, this.onDeleteFailed));
}

function onDeleteSucceded() {

    LogToConsole('Item deleted');
}

function onDeleteFailed(sender, args) {

    LogToConsole("Item Deleting Failed");
}